const express = require('express');
const db = require('../db/db');
const { requireLogin, requireAdmin } = require('../middleware/auth');
const { calcTotals, lineTotal } = require('../lib/calc');
const { nextNumber } = require('../lib/numbering');
const { renderDocumentPdf } = require('../lib/pdf');
const { buildDocumentDocx } = require('../lib/docx');

const router = express.Router();

function getItems(documentId) {
  return db.prepare('SELECT * FROM document_items WHERE document_id = ? ORDER BY sort_order').all(documentId);
}

function saveItems(documentId, items) {
  db.prepare('DELETE FROM document_items WHERE document_id = ?').run(documentId);
  const insert = db.prepare(`INSERT INTO document_items
    (document_id, sort_order, description, days, qty, unit, unit_price, line_total)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`);
  items.forEach((it, idx) => {
    insert.run(documentId, idx, it.description, it.days || 1, it.qty || 1, it.unit || 'Each', it.unit_price || 0, lineTotal(it));
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

function insertDocument(doc) {
  const info = db.prepare(`
    INSERT INTO documents (kind, number, version, root_id, parent_id, status, payment_status, due_date, language,
      client_name, contact_person, project_title, venue, po_number, currency,
      discount_type, discount_value, tax_type, subtotal, discount_amount, tax_amount, grand_total,
      quote_ref_id, notes, created_by)
    VALUES (@kind, @number, @version, @root_id, @parent_id, @status, @payment_status, @due_date, @language,
      @client_name, @contact_person, @project_title, @venue, @po_number, @currency,
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
    po_number=@po_number, currency=@currency, discount_type=@discount_type, discount_value=@discount_value,
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
    po_number: doc.po_number, currency: doc.currency, discount_type: doc.discount_type, discount_value: doc.discount_value,
    tax_type: doc.tax_type, subtotal: doc.subtotal, discount_amount: doc.discount_amount, tax_amount: doc.tax_amount,
    grand_total: doc.grand_total, quote_ref_id: doc.quote_ref_id, notes: doc.notes, created_by: req.session.user.id,
  };

  const tx = db.transaction(() => {
    db.prepare("UPDATE documents SET status='amended', updated_at=datetime('now') WHERE id=?").run(doc.id);
    const info = db.prepare(`
      INSERT INTO documents (kind, number, version, root_id, parent_id, status, payment_status, due_date, language,
        client_name, contact_person, project_title, venue, po_number, currency,
        discount_type, discount_value, tax_type, subtotal, discount_amount, tax_amount, grand_total,
        quote_ref_id, notes, created_by)
      VALUES (@kind, @number, @version, @root_id, @parent_id, @status, @payment_status, @due_date, @language,
        @client_name, @contact_person, @project_title, @venue, @po_number, @currency,
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

router.get('/:id/pdf', requireLogin, (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).send('Not found');
  const items = getItems(doc.id);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `inline; filename="${doc.number}.pdf"`);
  renderDocumentPdf(doc, items, res);
});

router.get('/:id/docx', requireLogin, async (req, res) => {
  const doc = db.prepare('SELECT * FROM documents WHERE id = ?').get(req.params.id);
  if (!doc) return res.status(404).send('Not found');
  const items = getItems(doc.id);
  try {
    const buffer = await buildDocumentDocx(doc, items);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    res.setHeader('Content-Disposition', `attachment; filename="${doc.number}.docx"`);
    res.send(buffer);
  } catch (e) {
    console.error('[docx] failed:', e);
    res.status(500).send('Could not generate the .docx');
  }
});

module.exports = router;
