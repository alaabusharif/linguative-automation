const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const express = require('express');
const multer = require('multer');
const db = require('../db/db');
const { requireLogin, requireAdmin } = require('../middleware/auth');
const { calcTotals, lineTotal } = require('../lib/calc');
const { nextNumber } = require('../lib/numbering');
const { renderDocumentPdf } = require('../lib/pdf');
const { buildDocumentDocx } = require('../lib/docx');
const { submitInvoice } = require('../lib/jofotara');

const router = express.Router();

// Uploaded PO attachments (PDF or image) — stored as-is, never parsed/OCR'd.
// Lives under data/ like the sqlite file, so it survives code-only redeploys.
const PO_FILES_DIR = path.join(__dirname, '..', 'data', 'po-files');
if (!fs.existsSync(PO_FILES_DIR)) fs.mkdirSync(PO_FILES_DIR, { recursive: true });

const PO_FILE_TYPES = {
  'application/pdf': '.pdf',
  'image/png': '.png',
  'image/jpeg': '.jpg',
  'image/webp': '.webp',
};

const poFileUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 15 * 1024 * 1024 },
});

function getItems(documentId) {
  return db.prepare('SELECT * FROM document_items WHERE document_id = ? ORDER BY sort_order').all(documentId);
}

function saveItems(documentId, items) {
  db.prepare('DELETE FROM document_items WHERE document_id = ?').run(documentId);
  const insert = db.prepare(`INSERT INTO document_items
    (document_id, sort_order, description, days, qty, unit, unit_price, line_total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  const upsertCatalog = db.prepare('INSERT OR IGNORE INTO items_catalog (name) VALUES (?)');
  items.forEach((it, idx) => {
    insert.run(documentId, idx, it.description, it.days || 1, it.qty || 1, it.unit || 'Each', it.unit_price || 0, lineTotal(it));
    const desc = (it.description || '').trim();
    if (desc) upsertCatalog.run(desc);
  });
}

function withItems(doc) {
  if (!doc) return doc;
  return { ...doc, items: getItems(doc.id) };
}

// List: only the latest/live version of each document number (hide superseded "amended" rows).
router.get('/', requireLogin, (req, res) => {
  const kind = req.query.kind === 'invoice' ? 'invoice' : 'quote';
  const rows = db.prepare(`
    SELECT d.* FROM documents d
    WHERE d.kind = ?
      AND d.id NOT IN (
        SELECT parent_id FROM documents WHERE parent_id IS NOT NULL
      )
    ORDER BY d.created_at DESC
  `).all(kind);
  res.json({ documents: rows });
});

router.get('/:id', requireLogin, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });

  const rootId = doc.root_id || doc.id;
  const history = db.prepare('SELECT id, version, status, created_at FROM documents WHERE id = ? OR root_id = ? ORDER BY version')
    .all(rootId, rootId);

  res.json({ document: withItems(doc), history });
});

function buildDocFromInput(kind, body, createdBy) {
  const items = Array.isArray(body.items) ? body.items : [];
  const totals = calcTotals({ items, discountType: body.discount_type, discountValue: body.discount_value, taxType: body.tax_type });
  const number = body.number || nextNumber(kind);

  return {
    kind,
    number,
    version: 1,
    status: 'draft',
    payment_status: kind === 'invoice' ? 'unpaid' : null,
    due_date: kind === 'invoice' ? (body.due_date || null) : null,
    language: body.language === 'ar' ? 'ar' : 'en',
    client_name: body.client_name || '',
    contact_person: body.contact_person || '',
    project_title: body.project_title || '',
    venue: body.venue || '',
    po_number: body.po_number || null,
    valid_until: body.valid_until || null,
    service_dates: body.service_dates || null,
    currency: body.currency || 'JOD',
    discount_type: body.discount_type === 'percent' ? 'percent' : 'flat',
    discount_value: Number(body.discount_value) || 0,
    tax_type: ['16', '0', 'exempt'].includes(body.tax_type) ? body.tax_type : '16',
    subtotal: totals.subtotal,
    discount_amount: totals.discountAmount,
    tax_amount: totals.taxAmount,
    grand_total: totals.grandTotal,
    quote_ref_id: body.quote_ref_id || null,
    notes: body.notes || null,
    created_by: createdBy,
    items,
  };
}

// Keeps the clients autocomplete list current with whatever gets typed on a
// document, even if the user never clicked "+ Add" in the dropdown.
function upsertClient(name, contactPerson) {
  const clientName = (name || '').trim();
  if (!clientName) return;
  db.prepare('INSERT INTO clients (name, contact_person) VALUES (?, ?) ON CONFLICT(name) DO UPDATE SET contact_person = COALESCE(clients.contact_person, excluded.contact_person)')
    .run(clientName, (contactPerson || '').trim() || null);
}

function insertDocument(doc) {
  const info = db.prepare(`
    INSERT INTO documents (kind, number, version, root_id, parent_id, status, payment_status, due_date, language,
      client_name, contact_person, project_title, venue, po_number, valid_until, service_dates, currency,
      discount_type, discount_value, tax_type, subtotal, discount_amount, tax_amount, grand_total,
      quote_ref_id, notes, created_by)
    VALUES (@kind, @number, @version, @root_id, @parent_id, @status, @payment_status, @due_date, @language,
      @client_name, @contact_person, @project_title, @venue, @po_number, @valid_until, @service_dates, @currency,
      @discount_type, @discount_value, @tax_type, @subtotal, @discount_amount, @tax_amount, @grand_total,
      @quote_ref_id, @notes, @created_by)
  `).run({ root_id: null, parent_id: null, ...doc });
  const id = info.lastInsertRowid;
  saveItems(id, doc.items);
  return id;
}

router.post('/', requireLogin, (req, res) => {
  const kind = req.body.kind === 'invoice' ? 'invoice' : 'quote';
  const doc = buildDocFromInput(kind, req.body, req.session.user.id);
  const id = insertDocument(doc);
  upsertClient(doc.client_name, doc.contact_person);
  res.json({ document: withItems(db.prepare('SELECT * FROM documents WHERE id = ?').get(id)) });
});

// Create an invoice directly from an existing quote — PO/client/items carry over automatically.
router.post('/from-quote/:quoteId', requireLogin, (req, res) => {
  const quote = db.prepare('SELECT * FROM documents WHERE id = ? AND kind = ?').get(req.params.quoteId, 'quote');
  if (!quote) return res.status(404).json({ error: 'Quote not found' });
  const items = getItems(quote.id);

  const doc = buildDocFromInput('invoice', {
    client_name: quote.client_name,
    contact_person: quote.contact_person,
    project_title: quote.project_title,
    venue: quote.venue,
    po_number: quote.po_number,
    service_dates: quote.service_dates,
    currency: quote.currency,
    discount_type: quote.discount_type,
    discount_value: quote.discount_value,
    tax_type: quote.tax_type,
    language: quote.language,
    items,
    quote_ref_id: quote.id,
    due_date: req.body.due_date || null,
  }, req.session.user.id);

  const id = insertDocument(doc);
  res.json({ document: withItems(db.prepare('SELECT * FROM documents WHERE id = ?').get(id)) });
});

// Edit a document while it's still a draft.
router.put('/:id', requireLogin, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  if (doc.status !== 'draft') return res.status(400).json({ error: 'Only draft documents can be edited directly — use Amend for a sent document.' });

  const items = Array.isArray(req.body.items) ? req.body.items : getItems(doc.id);
  const totals = calcTotals({ items, discountType: req.body.discount_type ?? doc.discount_type, discountValue: req.body.discount_value ?? doc.discount_value, taxType: req.body.tax_type ?? doc.tax_type });

  db.prepare(`UPDATE documents SET
    client_name=@client_name, contact_person=@contact_person, project_title=@project_title, venue=@venue,
    po_number=@po_number, valid_until=@valid_until, service_dates=@service_dates, currency=@currency, discount_type=@discount_type, discount_value=@discount_value,
    tax_type=@tax_type, language=@language, subtotal=@subtotal, discount_amount=@discount_amount, tax_amount=@tax_amount,
    grand_total=@grand_total, due_date=@due_date, notes=@notes, updated_at=datetime('now')
    WHERE id=@id`).run({
    id: doc.id,
    language: req.body.language === 'ar' || req.body.language === 'en' ? req.body.language : doc.language,
    client_name: req.body.client_name ?? doc.client_name,
    contact_person: req.body.contact_person ?? doc.contact_person,
    project_title: req.body.project_title ?? doc.project_title,
    venue: req.body.venue ?? doc.venue,
    po_number: req.body.po_number ?? doc.po_number,
    valid_until: req.body.valid_until ?? doc.valid_until,
    service_dates: req.body.service_dates ?? doc.service_dates,
    currency: req.body.currency ?? doc.currency,
    discount_type: req.body.discount_type ?? doc.discount_type,
    discount_value: totals ? (req.body.discount_value ?? doc.discount_value) : doc.discount_value,
    tax_type: req.body.tax_type ?? doc.tax_type,
    subtotal: totals.subtotal,
    discount_amount: totals.discountAmount,
    tax_amount: totals.taxAmount,
    grand_total: totals.grandTotal,
    due_date: req.body.due_date ?? doc.due_date,
    notes: req.body.notes ?? doc.notes,
  });
  saveItems(doc.id, items);
  upsertClient(req.body.client_name ?? doc.client_name, req.body.contact_person ?? doc.contact_person);
  res.json({ document: withItems(db.prepare('SELECT * FROM documents WHERE id = ?').get(doc.id)) });
});

router.post('/:id/submit', requireLogin, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc || doc.status !== 'draft') return res.status(400).json({ error: 'Only a draft can be submitted for approval' });
  db.prepare("UPDATE documents SET status='pending_approval', updated_at=datetime('now') WHERE id=?").run(doc.id);
  res.json({ ok: true });
});

// Ala's approval is required before a document can be sent.
router.post('/:id/approve', requireAdmin, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc || doc.status !== 'pending_approval') return res.status(400).json({ error: 'Only a pending-approval document can be approved' });
  db.prepare("UPDATE documents SET status='approved', approved_by=?, approved_at=datetime('now'), updated_at=datetime('now') WHERE id=?")
    .run(req.session.user.id, doc.id);
  res.json({ ok: true });
});

router.post('/:id/send', requireLogin, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc || doc.status !== 'approved') return res.status(400).json({ error: 'Only an approved document can be marked sent' });
  db.prepare("UPDATE documents SET status='sent', updated_at=datetime('now') WHERE id=?").run(doc.id);
  res.json({ ok: true });
});

// Amend: create a new linked version; the original is kept, marked "amended".
router.post('/:id/amend', requireLogin, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  if (['cancelled', 'amended'].includes(doc.status)) return res.status(400).json({ error: 'This version can no longer be amended' });

  const rootId = doc.root_id || doc.id;
  const maxVersion = db.prepare('SELECT MAX(version) AS v FROM documents WHERE id = ? OR root_id = ?').get(rootId, rootId).v;
  const items = getItems(doc.id);

  const newDoc = {
    kind: doc.kind, number: doc.number, version: maxVersion + 1, root_id: rootId, parent_id: doc.id,
    status: 'draft', payment_status: doc.kind === 'invoice' ? 'unpaid' : null, due_date: doc.due_date, language: doc.language,
    client_name: doc.client_name, contact_person: doc.contact_person, project_title: doc.project_title, venue: doc.venue,
    po_number: doc.po_number, valid_until: doc.valid_until, service_dates: doc.service_dates, currency: doc.currency, discount_type: doc.discount_type, discount_value: doc.discount_value,
    tax_type: doc.tax_type, subtotal: doc.subtotal, discount_amount: doc.discount_amount, tax_amount: doc.tax_amount,
    grand_total: doc.grand_total, quote_ref_id: doc.quote_ref_id, notes: doc.notes, created_by: req.session.user.id,
  };

  const tx = db.transaction(() => {
    db.prepare("UPDATE documents SET status='amended', updated_at=datetime('now') WHERE id=?").run(doc.id);
    const info = db.prepare(`
      INSERT INTO documents (kind, number, version, root_id, parent_id, status, payment_status, due_date, language,
        client_name, contact_person, project_title, venue, po_number, valid_until, service_dates, currency,
        discount_type, discount_value, tax_type, subtotal, discount_amount, tax_amount, grand_total,
        quote_ref_id, notes, created_by)
      VALUES (@kind, @number, @version, @root_id, @parent_id, @status, @payment_status, @due_date, @language,
        @client_name, @contact_person, @project_title, @venue, @po_number, @valid_until, @service_dates, @currency,
        @discount_type, @discount_value, @tax_type, @subtotal, @discount_amount, @tax_amount, @grand_total,
        @quote_ref_id, @notes, @created_by)
    `).run(newDoc);
    saveItems(info.lastInsertRowid, items);
    return info.lastInsertRowid;
  });

  const newId = tx();
  res.json({ document: withItems(db.prepare('SELECT * FROM documents WHERE id = ?').get(newId)) });
});

// Cancel: status change only — the record is kept, never deleted.
router.post('/:id/cancel', requireLogin, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  db.prepare("UPDATE documents SET status='cancelled', updated_at=datetime('now') WHERE id=?").run(doc.id);
  res.json({ ok: true });
});

router.post('/:id/mark-paid', requireLogin, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND kind = ?').get(req.params.id, 'invoice');
  if (!doc) return res.status(404).json({ error: 'Not found' });
  db.prepare("UPDATE documents SET payment_status='paid', updated_at=datetime('now') WHERE id=?").run(doc.id);
  res.json({ ok: true });
});

// Per-invoice "send this one to JoFotara" choice — off by default. Only
// invoices that haven't already gone through successfully can be re-toggled.
router.put('/:id/jofotara-toggle', requireLogin, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND kind = ?').get(req.params.id, 'invoice');
  if (!doc) return res.status(404).json({ error: 'Not found' });
  if (doc.jofotara_status === 'submitted') return res.status(400).json({ error: 'Already submitted to JoFotara — cannot turn off.' });
  db.prepare("UPDATE documents SET jofotara_enabled=?, updated_at=datetime('now') WHERE id=?")
    .run(req.body.enabled ? 1 : 0, doc.id);
  res.json({ document: withItems(db.prepare('SELECT * FROM documents WHERE id = ?').get(doc.id)) });
});

// Sends this invoice to JoFotara for clearance. Safe to retry after a
// failure (same UUID is reused); refuses once it has already succeeded,
// since ISTD treats a resend as a duplicate/amended document, not a no-op.
router.post('/:id/jofotara/submit', requireLogin, async (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND kind = ?').get(req.params.id, 'invoice');
  if (!doc) return res.status(404).json({ error: 'Not found' });
  if (!doc.jofotara_enabled) return res.status(400).json({ error: 'JoFotara is not turned on for this invoice.' });
  // Once submitted, re-sending is only ever a no-op retry to recover a
  // missing QR (ISTD returns the original on a resend of the same
  // number+UUID) — never allowed once we actually have one.
  if (doc.jofotara_status === 'submitted' && doc.jofotara_qr) return res.status(400).json({ error: 'Already submitted to JoFotara.' });

  const items = getItems(doc.id);
  try {
    const result = await submitInvoice(doc, items);
    if (result.ok) {
      db.prepare(`UPDATE documents SET jofotara_status='submitted', jofotara_uuid=?, jofotara_number=?,
        jofotara_qr=?, jofotara_error=NULL, jofotara_submitted_at=datetime('now'), updated_at=datetime('now') WHERE id=?`)
        .run(result.uuid, result.number, result.qr, doc.id);
    } else {
      console.error(`[jofotara] submit rejected for doc ${doc.id} (HTTP ${result.status}): ${result.message}\nRaw response: ${result.raw}`);
      db.prepare(`UPDATE documents SET jofotara_status='failed', jofotara_uuid=?, jofotara_error=?,
        updated_at=datetime('now') WHERE id=?`).run(result.uuid, result.message, doc.id);
    }
    res.json({ document: withItems(db.prepare('SELECT * FROM documents WHERE id = ?').get(doc.id)) });
  } catch (e) {
    console.error('[jofotara] submit failed:', e);
    db.prepare("UPDATE documents SET jofotara_status='failed', jofotara_error=?, updated_at=datetime('now') WHERE id=?")
      .run(e.message || 'Could not reach JoFotara', doc.id);
    res.json({ document: withItems(db.prepare('SELECT * FROM documents WHERE id = ?').get(doc.id)) });
  }
});

// Manual backfill for an invoice that was submitted to JoFotara before the
// EINV_QR response field was mapped correctly (fixed 2026-10-29) — stores a
// QR image pasted/uploaded from the JoFotara portal directly, with NO call
// to the JoFotara/ISTD API. Only for a submitted invoice that has no QR yet;
// never touches jofotara_status, jofotara_number or jofotara_uuid.
function checkQrBackfillAllowed(doc) {
  if (!doc) return 'Not found';
  if (doc.jofotara_status !== 'submitted') return 'This invoice has not been submitted to JoFotara.';
  if (doc.jofotara_qr) return 'This invoice already has a QR code on file.';
  return null;
}

function isPng(buffer) {
  return Buffer.isBuffer(buffer) && buffer.length > 8 && buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
}

function saveQrBackfill(docId, base64) {
  db.prepare("UPDATE documents SET jofotara_qr=?, updated_at=datetime('now') WHERE id=?").run(base64, docId);
  return withItems(db.prepare('SELECT * FROM documents WHERE id = ?').get(docId));
}

// Advanced/fallback path: pasting the QR's base64 text (or a data: URL) by hand.
router.put('/:id/jofotara/qr', requireLogin, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND kind = ?').get(req.params.id, 'invoice');
  const blocked = checkQrBackfillAllowed(doc);
  if (blocked === 'Not found') return res.status(404).json({ error: blocked });
  if (blocked) return res.status(400).json({ error: blocked });

  const raw = String(req.body.qr || '').trim();
  const base64 = raw.includes(',') ? raw.split(',').pop() : raw;
  if (!base64) return res.status(400).json({ error: 'Paste the QR image\'s base64 data (or a data: URL) from the JoFotara portal.' });
  let buffer;
  try { buffer = Buffer.from(base64, 'base64'); } catch { buffer = Buffer.alloc(0); }
  if (!buffer.length || !isPng(buffer)) return res.status(400).json({ error: 'That doesn\'t look like a valid PNG image.' });

  res.json({ document: saveQrBackfill(doc.id, base64) });
});

// Main path: uploading the QR image file directly (e.g. saved/downloaded
// from the JoFotara portal). PNG only — same format the real QR always
// comes back as, and the only format the PDF's QR renderer trusts (see
// lib/pdf.js's isValidPng — a deliberate limit, not an oversight).
const qrFileUpload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 } });
router.post('/:id/jofotara/qr-file', requireLogin, qrFileUpload.single('file'), (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ? AND kind = ?').get(req.params.id, 'invoice');
  const blocked = checkQrBackfillAllowed(doc);
  if (blocked === 'Not found') return res.status(404).json({ error: blocked });
  if (blocked) return res.status(400).json({ error: blocked });

  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });
  if (!isPng(req.file.buffer)) return res.status(400).json({ error: 'That file isn\'t a PNG image — on the JoFotara portal, save or screenshot the QR as a .png file.' });

  res.json({ document: saveQrBackfill(doc.id, req.file.buffer.toString('base64')) });
});

// "Prepared by" is always the user who created the document — never a
// manually-typed field, so it can't be edited after the fact.
function withPreparedBy(doc) {
  const creator = doc.created_by ? db.prepare('SELECT display_name FROM users WHERE id = ?').get(doc.created_by) : null;
  return { ...doc, prepared_by: creator ? creator.display_name : '' };
}

router.get('/:id/pdf', requireLogin, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).send('Not found');
  const items = getItems(doc.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${doc.number}.pdf"`);
  renderDocumentPdf(withPreparedBy(doc), items, res);
});

router.get('/:id/docx', requireLogin, async (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).send('Not found');
  const items = getItems(doc.id);
  try {
    const buffer = await buildDocumentDocx(withPreparedBy(doc), items);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.number}.docx"`);
    res.send(buffer);
  } catch (e) {
    console.error('[docx] failed:', e);
    res.status(500).send('Could not generate the .docx');
  }
});

// Attaches a PO file (PDF or image) to this document, replacing any
// previous attachment. Stored as-is — no OCR/auto-fill runs on it.
router.post('/:id/po-file', requireLogin, poFileUpload.single('file'), (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const ext = PO_FILE_TYPES[req.file.mimetype];
  if (!ext) return res.status(400).json({ error: 'Only PDF, PNG, JPEG or WebP files are accepted' });

  if (doc.po_file_path) {
    fs.rm(path.join(PO_FILES_DIR, doc.po_file_path), { force: true }, () => {});
  }

  const storedName = `${doc.id}-${crypto.randomBytes(6).toString('hex')}${ext}`;
  fs.writeFileSync(path.join(PO_FILES_DIR, storedName), req.file.buffer);
  db.prepare("UPDATE documents SET po_file_path=?, po_file_name=?, updated_at=datetime('now') WHERE id=?")
    .run(storedName, req.file.originalname || `PO${ext}`, doc.id);
  res.json({ document: withItems(db.prepare('SELECT * FROM documents WHERE id = ?').get(doc.id)) });
});

router.get('/:id/po-file', requireLogin, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc || !doc.po_file_path) return res.status(404).send('No PO file attached');
  const filePath = path.join(PO_FILES_DIR, doc.po_file_path);
  if (!fs.existsSync(filePath)) return res.status(404).send('File missing');
  res.setHeader('Content-Disposition', `inline; filename="${doc.po_file_name || doc.po_file_path}"`);
  res.sendFile(filePath);
});

router.delete('/:id/po-file', requireLogin, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).json({ error: 'Not found' });
  if (doc.po_file_path) {
    fs.rm(path.join(PO_FILES_DIR, doc.po_file_path), { force: true }, () => {});
  }
  db.prepare("UPDATE documents SET po_file_path=NULL, po_file_name=NULL, updated_at=datetime('now') WHERE id=?").run(doc.id);
  res.json({ document: withItems(db.prepare('SELECT * FROM documents WHERE id = ?').get(doc.id)) });
});

module.exports = router;
