const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const PDFDocument = require('pdfkit');
// Resolved via pdfkit's own dependency, not a plain require('png-js'): npm
// doesn't always hoist a transitive dependency to the top-level
// node_modules (depends on the exact install history), and this server is
// deployed by uploading a pre-built node_modules through FastPanel, not by
// running npm install here — so a plain require('png-js') that happened to
// work in one install can throw MODULE_NOT_FOUND in another. pdfkit already
// requires png-js to do its own PNG work, so resolving relative to pdfkit
// finds the exact copy it uses, wherever npm actually put it.
const PNGJS = require(require.resolve('png-js', { paths: [path.dirname(require.resolve('pdfkit'))] }));
const qrcodeGen = require('qrcode-generator');
const { drawBidiLine, drawBidiWrapped, wrapBidiLines } = require('./bidi');
const { labelsFor, formatDate, taxLabel, paymentTypeLabel } = require('./labels');
const { getCompanySettings, bankDetailsFor } = require('./settings');
const { columnsFor } = require('./itemFormats');

// Fixed pixel layout per line-item format (see lib/itemFormats.js for what
// each format's columns mean) — kept as explicit tables rather than one
// generic formula so the existing Event/Interpretation layout never shifts
// a pixel from what Ala already knows, while Translation/Hourly (new
// 2026-11-18) get their own column count and spacing.
const EN_LAYOUT = {
  event: { desc: 40, descW: 210, days: 260, qty: 290, unit: 320, unitPrice: 365, total: 465 },
  translation: { desc: 40, descW: 165, unit: 210, qty: 300, unitPrice: 370, total: 465 },
  hourly: { desc: 40, descW: 270, qty: 320, unitPrice: 365, total: 465 },
};
const AR_LAYOUT = {
  event: { total: 40, totalW: 85, unitPrice: 130, unitPriceW: 80, unit: 215, unitW: 45, qty: 265, qtyW: 35, days: 305, daysW: 35, desc: 345, descW: 210 },
  translation: { total: 40, totalW: 85, unitPrice: 130, unitPriceW: 75, qty: 210, qtyW: 55, unit: 270, unitW: 75, desc: 355, descW: 200 },
  hourly: { total: 40, totalW: 85, unitPrice: 130, unitPriceW: 80, qty: 215, qtyW: 45, desc: 265, descW: 290 },
};

// Evenly-spaced fallback layout for a custom column_config whose field set
// doesn't match one of the 3 fixed presets above (added 2026-11-18, so a
// user picking a non-preset combination of columns still gets a sane,
// non-overlapping table instead of undefined column positions).
const TABLE_LEFT = 40, TABLE_WIDTH = 515, DYN_TOTAL_W = 85, DYN_DESC_MIN = 150;
function dynamicLayout(colKeys, isArabic) {
  const n = colKeys.length;
  const fieldsW = Math.max(TABLE_WIDTH - DYN_TOTAL_W - DYN_DESC_MIN, 0);
  const colW = n ? fieldsW / n : 0;
  const descW = TABLE_WIDTH - DYN_TOTAL_W - n * colW;
  if (!isArabic) {
    const layout = { desc: TABLE_LEFT, descW };
    let x = TABLE_LEFT + descW;
    for (const key of colKeys) { layout[key] = x; x += colW; }
    layout.total = x;
    return layout;
  }
  let x = TABLE_LEFT;
  const layout = { total: x, totalW: DYN_TOTAL_W };
  x += DYN_TOTAL_W;
  for (const key of colKeys) { layout[key] = x; layout[`${key}W`] = colW; x += colW; }
  layout.desc = x;
  layout.descW = descW;
  return layout;
}

// Renders a borderless 2-column label/value table (bold navy label, wrapped
// charcoal value) starting at (x, y), matching the reference design's
// "PREPARED FOR" block — label and value each wrap independently, and the
// row height follows whichever of the two is taller.
function drawLabelValueTable(pdf, rows, x, y, labelW, valueW) {
  let cy = y;
  for (const [label, value] of rows) {
    const labelH = pdf.font('Helvetica-Bold').fontSize(10.5).heightOfString(label, { width: labelW });
    const valueH = pdf.font('Helvetica').fontSize(10.5).heightOfString(value, { width: valueW });
    pdf.font('Helvetica-Bold').fillColor(BRAND.navy).text(label, x, cy, { width: labelW });
    pdf.font('Helvetica').fillColor(BRAND.charcoal).text(value, x + labelW, cy, { width: valueW });
    cy += Math.max(labelH, valueH) + 4;
  }
  pdf.y = cy;
}

// Arabic equivalent of drawLabelValueTable — label sits on the right
// portion of the row (read first in RTL), value on the left, each wrapping
// independently via lib/bidi.js's wrapBidiLines.
function drawBidiLabelValueTable(pdf, rows, x, y, labelW, valueW) {
  let cy = y;
  for (const [label, value] of rows) {
    const labelLines = wrapBidiLines(pdf, label, labelW);
    const valueLines = wrapBidiLines(pdf, value, valueW);
    const lineHeight = pdf.currentLineHeight();
    const rowLines = Math.max(labelLines.length, valueLines.length, 1);
    pdf.fillColor(BRAND.navy);
    labelLines.forEach((line, i) => drawBidiLine(pdf, line, x + valueW, cy + i * lineHeight, labelW));
    pdf.fillColor(BRAND.charcoal);
    valueLines.forEach((line, i) => drawBidiLine(pdf, line, x, cy + i * lineHeight, valueW));
    cy += rowLines * lineHeight + 4;
  }
  pdf.y = cy;
}

// A format's fixed layout is pixel-tuned for exactly that format's own
// default column set shown together — e.g. event's qty/unit/unitPrice sit
// only ~30-45px apart because days normally fills the gap before them. So
// reuse those fixed positions only when the selected columns are literally
// that preset's own default, same set AND same order; any customization
// (a dropped column, a reorder, or borrowing another format's columns)
// needs the evenly-spaced dynamic layout above instead, or the leftover
// columns stay jammed at their old (now too-close) positions.
function layoutFor(table, format, cols, isArabic, defaultKeys) {
  const preset = table[format] || table.event;
  const keys = cols.map((c) => c.key);
  const matchesPreset = keys.length === defaultKeys.length && keys.every((k, i) => k === defaultKeys[i]);
  return matchesPreset ? preset : dynamicLayout(keys, isArabic);
}

const BRAND = {
  navy: '#071A2E',
  gold: '#C9A46A',
  ivory: '#F8F5F0',
  charcoal: '#2B2B2B',
};

// The locked brand logo file, never redrawn or regenerated. The deployed app
// is just the quotes-system/ folder on its own (see README "Get the code
// onto the server"), not a checkout of the whole repo, so this must point at
// the copy shipped inside quotes-system/public/assets/, not at
// marketing/brand/logos/ two directories up — that path only exists in a
// full monorepo checkout and silently resolves to nothing on the server.
const LOGO_PATH = path.join(__dirname, '..', 'public', 'assets', 'logo-navy-gold-light-bg.png');
// Cairo covers both Arabic and Latin/digits in one font file, which is what
// lets item codes, PO numbers and totals stay in normal left-to-right order
// inside an Arabic-shaped line (see lib/bidi.js).
const ARABIC_FONT_PATH = path.join(__dirname, '..', 'assets', 'fonts', 'Cairo-Regular.ttf');

// Linguative's own public contact details — not client data, so it's fine
// to keep in code. The tax ID, registration number and bank accounts are
// admin-editable (Settings screen, lib/settings.js) rather than hardcoded
// here, since Ala needs to change bank details himself without a code change.
const COMPANY = {
  address: 'Khilda – Wasfi Al-Tall Street, Amman, Jordan',
  phones: '+962 79 290 9080   |   +962 79 737 5914',
  email: 'info@linguative.net',
  website: 'linguative.net',
};

// JOD is conventionally quoted to 3 decimals (fils); other currencies to 2.
// Keep in sync with lib/calc.js's decimalsFor().
function fmtMoney(n, currency) {
  const decimals = currency === 'JOD' ? 3 : 2;
  return `${currency} ${Number(n).toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// Renders a quote or invoice document (with its items) to a PDF stream.
function renderDocumentPdf(doc, items, res) {
  if (doc.language === 'ar') return renderDocumentPdfAr(doc, items, res);

  // bufferPages lets us go back and stamp the footer on every page once we
  // know how many pages the content actually produced (see the
  // bufferedPageRange() loop at the end) — otherwise the footer can only
  // ever be drawn on whichever page happens to be "current" when the
  // function finishes, i.e. only the last one.
  const pdf = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
  pdf.pipe(res);

  // Header
  if (fs.existsSync(LOGO_PATH)) {
    pdf.image(LOGO_PATH, 40, 36, { width: 160 });
  }
  // Company address/contact block, under the logo — fills what was otherwise
  // blank header space and gives the recipient a way to reach Linguative directly.
  pdf.fillColor('#555555').fontSize(8.5).font('Helvetica')
    .text(COMPANY.address, 40, 100, { width: 260 })
    .text(`${COMPANY.phones}   |   ${COMPANY.email}`, 40, pdf.y, { width: 260 });
  // Bold and larger, matching the agreed reference design (Q-2026-109 /
  // FHI 360 STRIDES quote, 2026-11-18) — this was previously thin/smaller
  // because no bold font was set before it.
  pdf.fillColor(BRAND.navy).font('Helvetica-Bold')
    .fontSize(26)
    .text(doc.kind === 'invoice' ? 'INVOICE' : 'QUOTATION', 0, 40, { align: 'right' });
  pdf.fillColor(BRAND.charcoal).font('Helvetica')
    .fontSize(11)
    .text(`${doc.number}${doc.version > 1 ? `  (v${doc.version})` : ''}`, { align: 'right' })
    .text(new Date(doc.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), { align: 'right' });
  // Cash/Payable — bold and right under the date so it's seen at a glance,
  // not just buried as one more row in the BILL TO block below (Ala
  // couldn't find it there, 2026-11-18).
  if (doc.kind === 'invoice') {
    pdf.fillColor(BRAND.gold).font('Helvetica-Bold').fontSize(11)
      .text(paymentTypeLabel(doc.payment_type, 'en').toUpperCase(), { align: 'right' });
  }
  if (doc.prepared_by) {
    pdf.fillColor(BRAND.charcoal).font('Helvetica').fontSize(11)
      .text(`Prepared By: ${doc.prepared_by}`, { align: 'right' });
  }

  pdf.moveDown(3);
  pdf.moveTo(40, pdf.y).lineTo(555, pdf.y).strokeColor(BRAND.gold).lineWidth(2).stroke();
  pdf.moveDown(1);

  // Client block — explicit x=40 here matters: the header above left the
  // text cursor parked at x=0 (from the right-aligned title block), so
  // without it this heading and the whole block under it render flush with
  // the page edge, outside the left margin. Laid out as a 2-column
  // label/value table (bold navy label | charcoal value), matching the
  // reference design, rather than single "Label: value" lines.
  pdf.fillColor(BRAND.navy).font('Helvetica-Bold').fontSize(13).text(doc.kind === 'invoice' ? 'BILL TO' : 'PREPARED FOR', 40, pdf.y, { continued: false });
  pdf.moveDown(0.5);
  const preparedForRows = [['Client / Organization:', doc.client_name || '']];
  if (doc.contact_person) preparedForRows.push(['Contact Person:', doc.contact_person]);
  if (doc.project_title) preparedForRows.push(['Project / Event:', doc.project_title]);
  if (doc.venue) preparedForRows.push(['Venue:', doc.venue]);
  if (doc.po_number) preparedForRows.push(['PO Number:', doc.po_number]);
  if (doc.service_dates) preparedForRows.push(['Service Dates:', doc.service_dates]);
  if (doc.kind === 'invoice' && doc.due_date) {
    preparedForRows.push(['Due Date:', new Date(doc.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })]);
  }
  if (doc.kind === 'invoice') {
    preparedForRows.push(['Invoice Type:', paymentTypeLabel(doc.payment_type, 'en')]);
  }
  if (doc.kind === 'quote' && doc.valid_until) {
    preparedForRows.push(['Valid Until:', new Date(doc.valid_until).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })]);
  }
  drawLabelValueTable(pdf, preparedForRows, 40, pdf.y, 140, 375);
  pdf.moveDown(1);

  pdf.fillColor(BRAND.navy).font('Helvetica-Bold').fontSize(13).text('SCOPE & PRICING', 40, pdf.y);
  pdf.moveDown(0.5);

  // Items table — all header cells share one explicit y so they can never
  // drift apart, instead of each one re-deriving it from pdf.y after the
  // previous cell's own .text() call already advanced it. Price/Total get a
  // wider column than the format's own columns — a 4-digit amount like
  // "JOD 1,000.00" doesn't fit in a narrow column and runs into its
  // neighbor otherwise. Which columns appear (Days/Qty/Unit/Price for an
  // event, or Language Pair/Word Count/Rate for a translation, etc.) comes
  // from the document's item_format — see lib/itemFormats.js.
  const format = doc.item_format || 'event';
  const customCols = doc.column_config ? JSON.parse(doc.column_config) : null;
  const cols = columnsFor(format, 'en', customCols);
  const colX = layoutFor(EN_LAYOUT, format, cols, false, columnsFor(format, 'en').map((c) => c.key));
  const fieldFor = (key) => (key === 'unitPrice' ? 'unit_price' : key);

  // A continuation page used to start blank (no logo/title at all) — just
  // the items-table header band — which read as a stray, unbranded page
  // (Ala, 2026-11-18). Every page past the first now repeats a small logo
  // + number/date — not the full bold title again, just enough to show
  // which document this still is (Ala, 2026-11-18: "doesn't have to repeat
  // the same thing ... logo, the quotation number and date, smaller"). The
  // page number itself is added afterward, once the final page count is
  // known — see the bufferedPageRange() loop at the end.
  function newPage() {
    pdf.addPage();
    if (fs.existsSync(LOGO_PATH)) pdf.image(LOGO_PATH, 40, 30, { width: 85 });
    pdf.fillColor(BRAND.charcoal).font('Helvetica').fontSize(9.5)
      .text(`${doc.number}${doc.version > 1 ? ` (v${doc.version})` : ''}`, 0, 38, { align: 'right' })
      .text(new Date(doc.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), { align: 'right' });
    pdf.moveTo(40, 62).lineTo(555, 62).strokeColor(BRAND.gold).lineWidth(1).stroke();
    pdf.y = 76;
    pdf.font('Helvetica').fontSize(10.5).fillColor(BRAND.charcoal);
  }

  // Solid navy header band with white text, matching the reference quote
  // design's color palette (Ala, 2026-11-18) — previously this row was just
  // navy text on white, which read as inconsistent with the rest of the
  // brand's navy/gold/white usage.
  function drawItemsTableHeader() {
    const tableHeaderY = pdf.y;
    pdf.rect(40, tableHeaderY - 4, 515, 20).fill(BRAND.navy);
    pdf.fillColor('#FFFFFF').fontSize(10).font('Helvetica-Bold');
    pdf.text('Description', colX.desc, tableHeaderY);
    for (const { key, label } of cols) pdf.text(label, colX[key], tableHeaderY);
    pdf.text('Total', colX.total, tableHeaderY);
    pdf.y = tableHeaderY + 20;
    pdf.moveDown(0.3);
    pdf.font('Helvetica').fillColor(BRAND.charcoal).fontSize(10.5);
  }
  drawItemsTableHeader();

  // A long item list used to just run off the bottom of the page: pdfkit's
  // own overflow handling only kicks in per individual .text() call, which
  // for a row drawn cell-by-cell at explicit x/y meant each cell silently
  // started its own new, mostly-blank page once it crossed the margin — a
  // 40-item quote produced 122 pages this way (Ala, 2026-11-18). Checking
  // remaining space ourselves and starting the page (with the table header
  // repeated) before a row is drawn, instead of mid-row, fixes that.
  // -40 leaves clear room for drawPageFooter's own ~34px-tall band (divider
  // + two text lines) that gets stamped onto every page afterward — without
  // it, a row right at the old limit visually ran into the footer text.
  const BOTTOM_LIMIT = pdf.page.height - pdf.page.margins.bottom - 40;
  items.forEach((it, idx) => {
    const rowHeight = Math.max(pdf.heightOfString(it.description, { width: colX.descW }), 15);
    if (pdf.y + rowHeight + 4 > BOTTOM_LIMIT) {
      newPage();
      drawItemsTableHeader();
    }
    const y = pdf.y;
    // Zebra striping with the brand's ivory, matching the reference quote
    // design's color palette (Ala, 2026-11-18) — alternate rows only.
    if (idx % 2 === 1) {
      pdf.rect(40, y - 2, 515, rowHeight + 4).fill(BRAND.ivory);
      pdf.fillColor(BRAND.charcoal);
    }
    pdf.text(it.description, colX.desc, y, { width: colX.descW });
    const afterDescY = pdf.y;
    for (const { key } of cols) {
      const field = fieldFor(key);
      const value = field === 'unit_price' ? fmtMoney(it.unit_price, doc.currency) : String(it[field]);
      pdf.text(value, colX[key], y);
    }
    pdf.text(fmtMoney(it.line_total, doc.currency), colX.total, y);
    pdf.y = Math.max(afterDescY, y + 15);
  });

  pdf.moveDown(1);
  // The summary block is short but still drawn at explicit x/y like the item
  // rows above — give it a fresh page rather than letting it run off the
  // bottom of a nearly-full one.
  if (pdf.y + 90 > BOTTOM_LIMIT) newPage();
  pdf.moveTo(40, pdf.y).lineTo(555, pdf.y).strokeColor(BRAND.gold).lineWidth(1).stroke();
  pdf.moveDown(0.5);
  pdf.fillColor(BRAND.navy).font('Helvetica-Bold').fontSize(13).text('CALCULATION SUMMARY', 40, pdf.y);
  pdf.moveDown(0.5);

  // Totals
  const totalsX = 260;
  const totalsW = 295;
  pdf.fontSize(11).fillColor(BRAND.charcoal);
  pdf.text(`Subtotal: ${fmtMoney(doc.subtotal, doc.currency)}`, totalsX, pdf.y, { width: totalsW, align: 'right' });
  if (doc.discount_amount > 0) {
    pdf.text(`Discount: -${fmtMoney(doc.discount_amount, doc.currency)}`, totalsX, pdf.y, { width: totalsW, align: 'right' });
  }
  pdf.text(`Tax (${taxLabel(doc.tax_type, 'en')}): ${fmtMoney(doc.tax_amount, doc.currency)}`, totalsX, pdf.y, { width: totalsW, align: 'right' });
  pdf.font('Helvetica-Bold').fillColor(BRAND.navy).fontSize(14)
    .text(`Grand Total: ${fmtMoney(doc.grand_total, doc.currency)}`, totalsX, pdf.y, { width: totalsW, align: 'right' });

  // Everything from here down is drawn line-by-line at explicit x/y like the
  // items table was, so it needs the same per-line page-break check — a
  // single long block (cancellation policy, bank rows) can still run into
  // the footer otherwise, same root cause as the items table.
  function ensureSpace(neededHeight) {
    if (pdf.y + neededHeight > BOTTOM_LIMIT) newPage();
  }

  if (doc.notes) {
    const notesHeight = pdf.font('Helvetica').fontSize(10.5).heightOfString(doc.notes, { width: 515 });
    pdf.moveDown(2);
    ensureSpace(notesHeight);
    pdf.fillColor(BRAND.charcoal).text(doc.notes, 40, pdf.y, { width: 515 });
  }

  // Standard cancellation policy — event/interpretation quotes only, shown
  // automatically rather than requiring it be typed into Notes each time.
  // Kept together as one block: starting it right at the bottom of a page
  // and splitting after just the heading read worse than pushing the whole
  // thing to a fresh page (Ala, 2026-11-18).
  if (doc.kind === 'quote' && format === 'event') {
    const L = labelsFor('en');
    pdf.moveDown(1.5);
    const headingH = pdf.font('Helvetica-Bold').fontSize(11).heightOfString(L.cancellationHeading, { width: 515 });
    pdf.font('Helvetica').fontSize(9.5);
    const linesH = L.cancellationLines.reduce((sum, line) => sum + pdf.heightOfString(`•  ${line}`, { width: 515 }) + pdf.currentLineHeight() * 0.15, 0);
    ensureSpace(headingH * 1.3 + linesH);
    pdf.font('Helvetica-Bold').fontSize(11).fillColor(BRAND.navy).text(L.cancellationHeading, 40, pdf.y, { width: 515 });
    pdf.moveDown(0.3).font('Helvetica').fontSize(9.5).fillColor(BRAND.charcoal);
    for (const line of L.cancellationLines) {
      pdf.text(`•  ${line}`, 40, pdf.y, { width: 515 });
      pdf.moveDown(0.15);
    }
  }

  // Signature block — quotes only (every format, not just event/interp.),
  // placed right under the cancellation policy when there is one. Fixed
  // signatory (Ala, GM) rather than doc.prepared_by, which is "who drafted
  // this document" and can be a different person (Ala, 2026-11-18).
  if (doc.kind === 'quote') {
    // No shading (Ala, 2026-11-19) — just labels with colons aligned in
    // one column, every value line left blank for Ala to fill in by hand,
    // each with its own dotted line underneath.
    const sigRows = ['For Linguative', 'Position', 'Signature and stamp'];
    const rowH = 16;
    const labelW = 150, colonX = 40 + labelW, valueX = colonX + 15, valueEnd = 40 + 515 - 10;
    pdf.moveDown(2);
    ensureSpace(90);
    pdf.font('Helvetica-Bold').fontSize(10.5).fillColor(BRAND.charcoal);
    sigRows.forEach((label, i) => {
      if (i === 2) pdf.moveDown(1);
      const y = pdf.y;
      pdf.text(label, 40, y, { width: labelW, lineBreak: false });
      pdf.text(':', colonX, y, { lineBreak: false });
      pdf.save().dash(1, { space: 2 }).moveTo(valueX, y + 11).lineTo(valueEnd, y + 11).strokeColor('#555555').lineWidth(0.75).stroke();
      pdf.undash().restore();
      pdf.y = y + rowH;
    });
  }

  // Payment Details — invoices only, and only once the server's .env has
  // a bank account saved for that currency in the Settings screen (see lib/settings.js).
  if (doc.kind === 'invoice') {
    const bank = bankDetailsFor(doc.currency);
    if (bank) {
      pdf.moveDown(1.5);
      ensureSpace(25);
      pdf.fillColor(BRAND.navy).fontSize(12).font('Helvetica-Bold').text('PAYMENT DETAILS', 40, pdf.y);
      pdf.moveDown(0.4);
      pdf.font('Helvetica').fillColor(BRAND.charcoal).fontSize(10);
      const rows = [
        ['Beneficiary:', bank.beneficiary], ['Account Number:', bank.accountNumber], ['Bank Name:', bank.bankName],
        ['Branch:', bank.branch], ['Bank Address:', bank.bankAddress], ['IBAN:', bank.iban], ['SWIFT Code:', bank.swift],
      ];
      for (const [label, value] of rows) {
        if (!value) continue;
        ensureSpace(14);
        pdf.text(`${label} ${value}`, 40, pdf.y, { width: 515 });
        pdf.moveDown(0.2);
      }
    }
  }

  drawJofotaraQr(pdf, doc);

  // No separate "Communication Beyond Language" tagline here — it's already
  // in the logo file itself (under the wordmark) and in drawPageFooter()
  // below; a third copy read as a stray duplicate (Ala, 2026-11-18).
  //
  // Stamp the footer on every page the content actually produced, not just
  // whichever page happened to be "current" when we got here — needs
  // bufferPages (set above) so we can switch back to earlier pages at all.
  const pageRange = pdf.bufferedPageRange();
  for (let i = pageRange.start; i < pageRange.start + pageRange.count; i++) {
    pdf.switchToPage(i);
    const pageLabel = pageRange.count > 1 ? `Page ${i - pageRange.start + 1} of ${pageRange.count}` : null;
    drawPageFooter(pdf, pageLabel);
  }
  pdf.end();
}

// pdfkit's PNG decoding (via its png-js dependency) decompresses the image
// data on a zlib callback that throws rather than passing an error — with
// no listener on that path, a corrupt PNG crashes the whole Node process
// (confirmed locally: a bad buffer took the entire server down, not just
// this one PDF request). So before ever handing a QR image to pdf.image(),
// decode it ourselves with a synchronous zlib call we can actually catch.
const PNG_SIGNATURE = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

function isValidPng(buffer) {
  // Cheap checks first: PNGJS's own parser has no bounds check on
  // malformed chunk sizes, and fed 500 random bytes it looped for over
  // 17 seconds (tested locally) before finally throwing — far too slow
  // to risk on every PDF render for data that isn't even a PNG to begin with.
  if (!Buffer.isBuffer(buffer) || buffer.length < 8 || buffer.length > 2 * 1024 * 1024) return false;
  if (!buffer.subarray(0, 8).equals(PNG_SIGNATURE)) return false;
  try {
    const png = new PNGJS(buffer);
    const imgData = Buffer.isBuffer(png.imgData) ? png.imgData : Buffer.concat(png.imgData.map((a) => Buffer.from(a)));
    zlib.inflateSync(imgData);
    return true;
  } catch {
    return false;
  }
}

// JoFotara (Jordan e-invoicing) never sends back a rendered QR image —
// confirmed 2026-11-03 against a real exempt-invoice submission (INV-2026-006):
// what it returns (EINV_QR_SOURCE) is TLV-encoded text data (seller, tax
// number, amount, a signature, etc.) that WE have to turn into a QR code
// ourselves, same pattern as ZATCA's e-invoicing QR. We draw it as vector
// rectangles with qrcode-generator (zero dependencies, pure JS — no new
// binary/image library needed) rather than expecting a PNG.
//
// The one case that's still a real image: a QR someone downloaded from the
// JoFotara portal and uploaded by hand (routes/documents.js's
// jofotara/qr-file backfill, used once for INV-2026-005 before this was
// understood) — isValidPng (above) still recognizes and draws that as-is.
function drawJofotaraQrCode(pdf, qr, top) {
  const left = 40;
  const size = 90;
  const cell = size / qr.getModuleCount();
  pdf.save();
  for (let row = 0; row < qr.getModuleCount(); row++) {
    for (let col = 0; col < qr.getModuleCount(); col++) {
      if (!qr.isDark(row, col)) continue;
      pdf.rect(left + col * cell, top + row * cell, cell, cell).fill('#000000');
    }
  }
  pdf.restore();
}

function drawJofotaraQr(pdf, doc) {
  if (doc.kind !== 'invoice' || !doc.jofotara_qr) return;
  try {
    const base64 = doc.jofotara_qr.includes(',') ? doc.jofotara_qr.split(',').pop() : doc.jofotara_qr;
    const buffer = Buffer.from(base64, 'base64');
    pdf.moveDown(1);
    if (pdf.y + 100 > pdf.page.height - pdf.page.margins.bottom - 40) pdf.addPage();
    const top = pdf.y;
    if (isValidPng(buffer)) {
      pdf.image(buffer, 40, top, { width: 90, height: 90 });
    } else {
      const qr = qrcodeGen(0, 'M');
      qr.addData(doc.jofotara_qr);
      qr.make();
      drawJofotaraQrCode(pdf, qr, top);
    }
    pdf.fontSize(8).fillColor('#777777').font('Helvetica')
      .text('JoFotara / ISTD e-invoice QR', 140, top + 38, { width: 200 });
    pdf.y = top + 90 + 10; // .image() doesn't move the cursor itself
  } catch (e) {
    console.error('[pdf] could not render JoFotara QR:', e.message);
  }
}

// Master template's footer, pinned at the very bottom of the page, with a
// thin gold divider above it (Ala, 2026-11-18) — on both quotes and
// invoices alike (Q-2026-002 shows the Registration/Tax line on a quote
// too, not just invoices).
function drawPageFooter(pdf, pageLabel) {
  const { taxNo, registrationNo } = getCompanySettings();
  const bottom = pdf.page.height - pdf.page.margins.bottom;
  const y = bottom - 26;
  pdf.moveTo(40, y - 8).lineTo(555, y - 8).strokeColor(BRAND.gold).lineWidth(1).stroke();
  pdf.fontSize(8.5).fillColor('#777777').font('Helvetica')
    .text(`${registrationNo ? `Registration No. ${registrationNo}   |   ` : ''}Tax No. ${taxNo}`, 40, y, { width: 515, align: 'center', lineBreak: false })
    .text('linguative.net   |   Amman, Jordan   |   Communication Beyond Language', 40, y + 12, { width: 515, align: 'center', lineBreak: false });
  // Page number — only shown once there's more than one page, sitting at
  // the bottom-right next to the footer band so it never collides with
  // page 1's big "QUOTATION/INVOICE" title up top (Ala, 2026-11-18).
  if (pageLabel) {
    pdf.fontSize(8.5).fillColor('#777777').font('Helvetica')
      .text(pageLabel, 40, y + 12, { width: 515, align: 'right', lineBreak: false });
  }
}

// Arabic layout: same brand system and page geometry as the English one,
// but right-aligned and built from bidi-safe lines (see lib/bidi.js) so PO
// numbers, dates and money amounts stay in normal reading order.
function renderDocumentPdfAr(doc, items, res) {
  const L = labelsFor('ar');
  const pdf = new PDFDocument({ size: 'A4', margin: 40, bufferPages: true });
  pdf.pipe(res);
  pdf.registerFont('Cairo', ARABIC_FONT_PATH);
  pdf.font('Cairo');

  const RIGHT = 555;
  const LEFT = 40;
  const FULL = RIGHT - LEFT;

  // Header — logo stays put (brand rule: never repositioned), heading text on the right.
  if (fs.existsSync(LOGO_PATH)) {
    pdf.image(LOGO_PATH, 40, 36, { width: 160 });
  }
  // Company address/contact block, under the logo, kept LTR (addresses/phone
  // numbers read the same in both layouts) — matches the English layout.
  pdf.font('Helvetica').fillColor('#555555').fontSize(8.5)
    .text(COMPANY.address, 40, 100, { width: 260 })
    .text(`${COMPANY.phones}   |   ${COMPANY.email}`, 40, pdf.y, { width: 260 });
  pdf.font('Cairo').fillColor(BRAND.navy).fontSize(26);
  drawBidiLine(pdf, doc.kind === 'invoice' ? L.invoice : L.quotation, LEFT, 40, FULL);
  pdf.fillColor(BRAND.charcoal).fontSize(11);
  drawBidiLine(pdf, `${doc.number}${doc.version > 1 ? `  (v${doc.version})` : ''}`, LEFT, 70, FULL);
  drawBidiLine(pdf, formatDate(doc.created_at, 'ar'), LEFT, 84, FULL);
  if (doc.prepared_by) {
    drawBidiLine(pdf, `${L.preparedBy} ${doc.prepared_by}`, LEFT, 98, FULL);
  }

  pdf.y = 122;
  pdf.moveTo(40, pdf.y).lineTo(555, pdf.y).strokeColor(BRAND.gold).lineWidth(2).stroke();
  pdf.moveDown(1);

  // Client block — 2-column label/value table (see drawBidiLabelValueTable),
  // matching the reference design rather than one "label value" line each.
  pdf.fillColor(BRAND.navy).fontSize(13);
  drawBidiLine(pdf, doc.kind === 'invoice' ? L.billTo : L.preparedFor, LEFT, pdf.y, FULL);
  // drawBidiLine uses lineBreak:false so pdfkit never advances pdf.y for the
  // line it just drew — add that back before moveDown(), or this heading's
  // own text overlaps the content drawn right after it.
  pdf.y += pdf.currentLineHeight();
  pdf.moveDown(0.6);
  pdf.fontSize(10.5);
  const rows = [[L.client, doc.client_name || '']];
  if (doc.contact_person) rows.push([L.contact, doc.contact_person]);
  if (doc.project_title) rows.push([L.project, doc.project_title]);
  if (doc.venue) rows.push([L.venue, doc.venue]);
  if (doc.po_number) rows.push([L.poNumber, doc.po_number]);
  if (doc.service_dates) rows.push([L.serviceDates, doc.service_dates]);
  if (doc.kind === 'invoice' && doc.due_date) rows.push([L.dueDate, formatDate(doc.due_date, 'ar')]);
  if (doc.kind === 'invoice') rows.push([L.paymentType, paymentTypeLabel(doc.payment_type, 'ar')]);
  if (doc.kind === 'quote' && doc.valid_until) rows.push([L.validUntil, formatDate(doc.valid_until, 'ar')]);
  drawBidiLabelValueTable(pdf, rows, LEFT, pdf.y, 140, FULL - 140);
  pdf.moveDown(1);

  pdf.fillColor(BRAND.navy).fontSize(13);
  drawBidiLine(pdf, L.scopePricing, LEFT, pdf.y, FULL);
  pdf.y += pdf.currentLineHeight();
  pdf.moveDown(0.6);

  // Items table — headers right-aligned per column, columns kept in the
  // same left-to-right order as the English layout for consistency. Total/
  // Price get wider columns than Unit/Qty/Days — a 4-digit amount wraps
  // onto a second line in a too-narrow column and throws the row out of
  // alignment with its neighbors otherwise.
  const format = doc.item_format || 'event';
  const customCols = doc.column_config ? JSON.parse(doc.column_config) : null;
  const cols = columnsFor(format, 'ar', customCols);
  const colX = layoutFor(AR_LAYOUT, format, cols, true, columnsFor(format, 'ar').map((c) => c.key));
  const fieldFor = (key) => (key === 'unitPrice' ? 'unit_price' : key);

  // Same "continuation page was blank/unbranded" fix as the English
  // renderer's newPage().
  function newPageAr() {
    pdf.addPage();
    if (fs.existsSync(LOGO_PATH)) pdf.image(LOGO_PATH, 40, 30, { width: 110 });
    pdf.fillColor(BRAND.navy).fontSize(14);
    drawBidiLine(pdf, `${doc.kind === 'invoice' ? L.invoice : L.quotation} ${doc.number}${doc.version > 1 ? ` (v${doc.version})` : ''}`, LEFT, 40, FULL);
    pdf.moveTo(40, 68).lineTo(555, 68).strokeColor(BRAND.gold).lineWidth(1).stroke();
    pdf.y = 82;
    pdf.fillColor(BRAND.charcoal).fontSize(10.5);
  }

  // Solid navy header band with white text, matching the reference quote
  // design's color palette (Ala, 2026-11-18) — see the English render for
  // the same change.
  function drawItemsTableHeaderAr() {
    const headerY = pdf.y;
    pdf.rect(40, headerY - 4, 515, 20).fill(BRAND.navy);
    pdf.fillColor('#FFFFFF').fontSize(10);
    drawBidiLine(pdf, L.col.total, colX.total, headerY, colX.totalW);
    for (const { key, label } of cols) drawBidiLine(pdf, label, colX[key], headerY, colX[`${key}W`]);
    drawBidiLine(pdf, L.col.item, colX.desc, headerY, colX.descW);
    pdf.y = headerY + 20;
    pdf.moveDown(0.3);
    pdf.fillColor(BRAND.charcoal).fontSize(10.5);
  }
  drawItemsTableHeaderAr();

  // Same page-overflow bug and fix as the English renderer — see its
  // comment above the equivalent BOTTOM_LIMIT/items.forEach.
  const BOTTOM_LIMIT = pdf.page.height - pdf.page.margins.bottom - 40;
  items.forEach((it, idx) => {
    // Row height follows the description once wrapped — it's the one
    // field that can run long — so the row (and its zebra background)
    // grows to fit instead of the text overflowing past the page edge,
    // which is what drawBidiLine alone did (Ala, 2026-11-18).
    const descLines = wrapBidiLines(pdf, it.description, colX.descW);
    const rowHeight = Math.max(descLines.length * pdf.currentLineHeight(), 15);
    if (pdf.y + rowHeight + 4 > BOTTOM_LIMIT) {
      newPageAr();
      drawItemsTableHeaderAr();
    }
    const y = pdf.y;
    // Zebra striping with the brand's ivory, matching the reference quote
    // design's color palette (Ala, 2026-11-18) — alternate rows only.
    if (idx % 2 === 1) {
      pdf.rect(40, y - 2, 515, rowHeight + 4).fill(BRAND.ivory);
      pdf.fillColor(BRAND.charcoal);
    }
    drawBidiLine(pdf, fmtMoney(it.line_total, doc.currency), colX.total, y, colX.totalW);
    for (const { key } of cols) {
      const field = fieldFor(key);
      const value = field === 'unit_price' ? fmtMoney(it.unit_price, doc.currency) : String(it[field]);
      drawBidiLine(pdf, value, colX[key], y, colX[`${key}W`]);
    }
    drawBidiWrapped(pdf, it.description, colX.desc, y, colX.descW);
    pdf.y = y + rowHeight + 5;
  });

  pdf.moveDown(1);
  if (pdf.y + 90 > BOTTOM_LIMIT) newPageAr();
  pdf.moveTo(40, pdf.y).lineTo(555, pdf.y).strokeColor(BRAND.gold).lineWidth(1).stroke();
  pdf.moveDown(0.5);
  pdf.fillColor(BRAND.navy).fontSize(13);
  drawBidiLine(pdf, L.calcSummary, LEFT, pdf.y, FULL);
  pdf.y += pdf.currentLineHeight();
  pdf.moveDown(0.6);

  // Totals
  const totalsW = 295;
  pdf.fontSize(11).fillColor(BRAND.charcoal);
  drawBidiLine(pdf, `${L.subtotal}: ${fmtMoney(doc.subtotal, doc.currency)}`, LEFT + FULL - totalsW, pdf.y, totalsW);
  pdf.moveDown(1);
  if (doc.discount_amount > 0) {
    drawBidiLine(pdf, `${L.discount}: -${fmtMoney(doc.discount_amount, doc.currency)}`, LEFT + FULL - totalsW, pdf.y, totalsW);
    pdf.moveDown(1);
  }
  drawBidiLine(pdf, `${L.taxStatus} (${taxLabel(doc.tax_type, 'ar')}): ${fmtMoney(doc.tax_amount, doc.currency)}`, LEFT + FULL - totalsW, pdf.y, totalsW);
  pdf.moveDown(1);
  pdf.fillColor(BRAND.navy).fontSize(14);
  drawBidiLine(pdf, `${L.grandTotal}: ${fmtMoney(doc.grand_total, doc.currency)}`, LEFT + FULL - totalsW, pdf.y, totalsW);

  // Same per-line page-break guard as the English renderer — see its
  // ensureSpace() comment above.
  function ensureSpaceAr(neededHeight) {
    if (pdf.y + neededHeight > BOTTOM_LIMIT) newPageAr();
  }

  if (doc.notes) {
    pdf.moveDown(2).fontSize(10.5).fillColor(BRAND.charcoal);
    doc.notes.split('\n').forEach((line) => {
      ensureSpaceAr(pdf.currentLineHeight());
      drawBidiLine(pdf, line, LEFT, pdf.y, FULL);
      pdf.moveDown(1);
    });
  }

  // Standard cancellation policy — event/interpretation quotes only, shown
  // automatically rather than requiring it be typed into Notes each time.
  // Kept together as one block — see the English renderer's comment above.
  if (doc.kind === 'quote' && format === 'event') {
    pdf.moveDown(1.5);
    pdf.fontSize(11);
    const headingLH = pdf.currentLineHeight();
    pdf.fontSize(9.5);
    const lineLH = pdf.currentLineHeight();
    ensureSpaceAr(headingLH * 2 + L.cancellationLines.length * lineLH);
    pdf.fillColor(BRAND.navy).fontSize(11);
    drawBidiLine(pdf, L.cancellationHeading, LEFT, pdf.y, FULL);
    pdf.moveDown(1).fillColor(BRAND.charcoal).fontSize(9.5);
    for (const line of L.cancellationLines) {
      drawBidiLine(pdf, `•  ${line}`, LEFT, pdf.y, FULL);
      pdf.moveDown(1);
    }
  }

  // Payment Details — invoices only, and only once the server's .env has
  // a bank account saved for that currency in the Settings screen (see lib/settings.js).
  if (doc.kind === 'invoice') {
    const bank = bankDetailsFor(doc.currency);
    if (bank) {
      pdf.moveDown(1.5);
      ensureSpaceAr(25);
      pdf.fillColor(BRAND.navy).fontSize(12);
      drawBidiLine(pdf, L.paymentDetails, LEFT, pdf.y, FULL);
      pdf.y += pdf.currentLineHeight();
      pdf.moveDown(0.5);
      pdf.fillColor(BRAND.charcoal).fontSize(10);
      const rows = [
        [L.bank.beneficiary, bank.beneficiary], [L.bank.accountNumber, bank.accountNumber], [L.bank.bankName, bank.bankName],
        [L.bank.branch, bank.branch], [L.bank.bankAddress, bank.bankAddress], [L.bank.iban, bank.iban], [L.bank.swift, bank.swift],
      ];
      for (const [label, value] of rows) {
        if (!value) continue;
        ensureSpaceAr(pdf.currentLineHeight());
        drawBidiLine(pdf, `${label} ${value}`, LEFT, pdf.y, FULL);
        pdf.moveDown(1);
      }
    }
  }

  drawJofotaraQr(pdf, doc);

  // No separate tagline here — see the English render's comment; it's
  // already in the logo file and in drawPageFooter() below.
  const pageRangeAr = pdf.bufferedPageRange();
  for (let i = pageRangeAr.start; i < pageRangeAr.start + pageRangeAr.count; i++) {
    pdf.switchToPage(i);
    drawPageFooter(pdf);
  }
  pdf.end();
}

module.exports = { renderDocumentPdf };
