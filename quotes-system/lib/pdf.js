const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const { drawBidiLine } = require('./bidi');
const { labelsFor, formatDate, taxLabel } = require('./labels');

const BRAND = {
  navy: '#071A2E',
  gold: '#C9A46A',
  ivory: '#F8F5F0',
  charcoal: '#2B2B2B',
};

// The locked brand logo file, shipped with the repo — never redrawn or regenerated.
const LOGO_PATH = path.join(__dirname, '..', '..', 'marketing', 'brand', 'logos', 'logo-navy-gold-light-bg.png');
// Cairo covers both Arabic and Latin/digits in one font file, which is what
// lets item codes, PO numbers and totals stay in normal left-to-right order
// inside an Arabic-shaped line (see lib/bidi.js).
const ARABIC_FONT_PATH = path.join(__dirname, '..', 'assets', 'fonts', 'Cairo-Regular.ttf');

function fmtMoney(n, currency) {
  return `${currency} ${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// Renders a quote or invoice document (with its items) to a PDF stream.
function renderDocumentPdf(doc, items, res) {
  if (doc.language === 'ar') return renderDocumentPdfAr(doc, items, res);

  const pdf = new PDFDocument({ size: 'A4', margin: 40 });
  pdf.pipe(res);

  // Header
  if (fs.existsSync(LOGO_PATH)) {
    pdf.image(LOGO_PATH, 40, 36, { width: 160 });
  }
  pdf.fillColor(BRAND.navy)
    .fontSize(22)
    .text(doc.kind === 'invoice' ? 'INVOICE' : 'QUOTATION', 0, 40, { align: 'right' });
  pdf.fillColor(BRAND.charcoal)
    .fontSize(11)
    .text(`${doc.number}${doc.version > 1 ? `  (v${doc.version})` : ''}`, { align: 'right' })
    .text(new Date(doc.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), { align: 'right' });
  if (doc.prepared_by) {
    pdf.text(`Prepared By: ${doc.prepared_by}`, { align: 'right' });
  }

  pdf.moveDown(3);
  pdf.moveTo(40, pdf.y).lineTo(555, pdf.y).strokeColor(BRAND.gold).lineWidth(1).stroke();
  pdf.moveDown(1);

  // Client block
  pdf.fillColor(BRAND.navy).fontSize(13).text('PREPARED FOR', { continued: false });
  pdf.fillColor(BRAND.charcoal).fontSize(11);
  pdf.text(`Client / Organization: ${doc.client_name || ''}`);
  if (doc.contact_person) pdf.text(`Contact Person: ${doc.contact_person}`);
  if (doc.project_title) pdf.text(`Project / Event: ${doc.project_title}`);
  if (doc.venue) pdf.text(`Venue: ${doc.venue}`);
  if (doc.po_number) pdf.text(`PO Number: ${doc.po_number}`);
  if (doc.service_dates) pdf.text(`Service Dates: ${doc.service_dates}`);
  if (doc.kind === 'invoice' && doc.due_date) {
    pdf.text(`Due Date: ${new Date(doc.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`);
  }
  if (doc.kind === 'quote' && doc.valid_until) {
    pdf.text(`Valid Until: ${new Date(doc.valid_until).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`);
  }
  pdf.moveDown(1.2);

  // Items table
  const colX = { desc: 40, days: 300, qty: 335, unit: 375, price: 425, total: 490 };
  pdf.fillColor(BRAND.navy).fontSize(10).font('Helvetica-Bold');
  pdf.text('Description', colX.desc, pdf.y);
  pdf.text('Days', colX.days, pdf.y - pdf.currentLineHeight());
  pdf.text('Qty', colX.qty, pdf.y - pdf.currentLineHeight());
  pdf.text('Unit', colX.unit, pdf.y - pdf.currentLineHeight());
  pdf.text('Price', colX.price, pdf.y - pdf.currentLineHeight());
  pdf.text('Total', colX.total, pdf.y - pdf.currentLineHeight());
  pdf.moveDown(0.5);
  pdf.moveTo(40, pdf.y).lineTo(555, pdf.y).strokeColor(BRAND.charcoal).lineWidth(0.5).stroke();
  pdf.moveDown(0.3);

  pdf.font('Helvetica').fillColor(BRAND.charcoal).fontSize(10.5);
  for (const it of items) {
    const y = pdf.y;
    pdf.text(it.description, colX.desc, y, { width: 250 });
    const afterDescY = pdf.y;
    pdf.text(String(it.days), colX.days, y);
    pdf.text(String(it.qty), colX.qty, y);
    pdf.text(it.unit, colX.unit, y);
    pdf.text(fmtMoney(it.unit_price, doc.currency), colX.price, y);
    pdf.text(fmtMoney(it.line_total, doc.currency), colX.total, y);
    pdf.y = Math.max(afterDescY, y + 15);
  }

  pdf.moveDown(1);
  pdf.moveTo(40, pdf.y).lineTo(555, pdf.y).strokeColor(BRAND.gold).lineWidth(1).stroke();
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

  if (doc.notes) {
    pdf.moveDown(2).font('Helvetica').fontSize(10.5).fillColor(BRAND.charcoal).text(doc.notes, 40, pdf.y, { width: 515 });
  }

  pdf.moveDown(2);
  pdf.fontSize(9.5).fillColor(BRAND.gold).text('COMMUNICATION BEYOND LANGUAGE.', 40, pdf.y);

  drawPageFooter(pdf);
  pdf.end();
}

// Master template's footer line, pinned near the bottom of the page.
// Stays just above the page's bottom margin — pdfkit silently starts a new
// page if text would land inside the margin, even with an explicit y.
function drawPageFooter(pdf) {
  const y = pdf.page.height - pdf.page.margins.bottom - 12;
  pdf.fontSize(8.5).fillColor('#777777').font('Helvetica')
    .text('linguative.net   |   Amman, Jordan   |   Communication Beyond Language', 40, y, { width: 515, align: 'center', lineBreak: false });
}

// Arabic layout: same brand system and page geometry as the English one,
// but right-aligned and built from bidi-safe lines (see lib/bidi.js) so PO
// numbers, dates and money amounts stay in normal reading order.
function renderDocumentPdfAr(doc, items, res) {
  const L = labelsFor('ar');
  const pdf = new PDFDocument({ size: 'A4', margin: 40 });
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
  pdf.fillColor(BRAND.navy).fontSize(22);
  drawBidiLine(pdf, doc.kind === 'invoice' ? L.invoice : L.quotation, LEFT, 40, FULL);
  pdf.fillColor(BRAND.charcoal).fontSize(11);
  drawBidiLine(pdf, `${doc.number}${doc.version > 1 ? `  (v${doc.version})` : ''}`, LEFT, 66, FULL);
  drawBidiLine(pdf, formatDate(doc.created_at, 'ar'), LEFT, 80, FULL);
  if (doc.prepared_by) {
    drawBidiLine(pdf, `${L.preparedBy} ${doc.prepared_by}`, LEFT, 94, FULL);
  }

  pdf.y = 118;
  pdf.moveTo(40, pdf.y).lineTo(555, pdf.y).strokeColor(BRAND.gold).lineWidth(1).stroke();
  pdf.moveDown(1);

  // Client block
  pdf.fillColor(BRAND.navy).fontSize(13);
  drawBidiLine(pdf, L.preparedFor, LEFT, pdf.y, FULL);
  pdf.moveDown(0.6);
  pdf.fillColor(BRAND.charcoal).fontSize(11);
  const rows = [[L.client, doc.client_name || '']];
  if (doc.contact_person) rows.push([L.contact, doc.contact_person]);
  if (doc.project_title) rows.push([L.project, doc.project_title]);
  if (doc.venue) rows.push([L.venue, doc.venue]);
  if (doc.po_number) rows.push([L.poNumber, doc.po_number]);
  if (doc.service_dates) rows.push([L.serviceDates, doc.service_dates]);
  if (doc.kind === 'invoice' && doc.due_date) rows.push([L.dueDate, formatDate(doc.due_date, 'ar')]);
  if (doc.kind === 'quote' && doc.valid_until) rows.push([L.validUntil, formatDate(doc.valid_until, 'ar')]);
  for (const [label, value] of rows) {
    drawBidiLine(pdf, `${label} ${value}`, LEFT, pdf.y, FULL);
    pdf.moveDown(0.5);
  }
  pdf.moveDown(0.7);

  // Items table — headers right-aligned per column, columns kept in the
  // same left-to-right order as the English layout for consistency.
  const colX = { total: 40, price: 105, unit: 175, qty: 225, days: 270, desc: 315 };
  const colW = { total: 60, price: 65, unit: 45, qty: 40, days: 40, desc: 240 };
  pdf.fillColor(BRAND.navy).fontSize(10);
  const headerY = pdf.y;
  drawBidiLine(pdf, L.col.total, colX.total, headerY, colW.total);
  drawBidiLine(pdf, L.col.unitPrice, colX.price, headerY, colW.price);
  drawBidiLine(pdf, L.col.unit, colX.unit, headerY, colW.unit);
  drawBidiLine(pdf, L.col.qty, colX.qty, headerY, colW.qty);
  drawBidiLine(pdf, L.col.days, colX.days, headerY, colW.days);
  drawBidiLine(pdf, L.col.item, colX.desc, headerY, colW.desc);
  pdf.y = headerY + 14;
  pdf.moveTo(40, pdf.y).lineTo(555, pdf.y).strokeColor(BRAND.charcoal).lineWidth(0.5).stroke();
  pdf.moveDown(0.3);

  pdf.fillColor(BRAND.charcoal).fontSize(10.5);
  for (const it of items) {
    const y = pdf.y;
    drawBidiLine(pdf, fmtMoney(it.line_total, doc.currency), colX.total, y, colW.total);
    drawBidiLine(pdf, fmtMoney(it.unit_price, doc.currency), colX.price, y, colW.price);
    drawBidiLine(pdf, it.unit, colX.unit, y, colW.unit);
    drawBidiLine(pdf, String(it.qty), colX.qty, y, colW.qty);
    drawBidiLine(pdf, String(it.days), colX.days, y, colW.days);
    drawBidiLine(pdf, it.description, colX.desc, y, colW.desc);
    pdf.y = Math.max(pdf.y, y + 15);
  }

  pdf.moveDown(1);
  pdf.moveTo(40, pdf.y).lineTo(555, pdf.y).strokeColor(BRAND.gold).lineWidth(1).stroke();
  pdf.moveDown(0.5);

  // Totals
  const totalsW = 295;
  pdf.fontSize(11).fillColor(BRAND.charcoal);
  drawBidiLine(pdf, `${L.subtotal}: ${fmtMoney(doc.subtotal, doc.currency)}`, LEFT + FULL - totalsW, pdf.y, totalsW);
  pdf.moveDown(0.5);
  if (doc.discount_amount > 0) {
    drawBidiLine(pdf, `${L.discount}: -${fmtMoney(doc.discount_amount, doc.currency)}`, LEFT + FULL - totalsW, pdf.y, totalsW);
    pdf.moveDown(0.5);
  }
  drawBidiLine(pdf, `${L.taxStatus} (${taxLabel(doc.tax_type, 'ar')}): ${fmtMoney(doc.tax_amount, doc.currency)}`, LEFT + FULL - totalsW, pdf.y, totalsW);
  pdf.moveDown(0.5);
  pdf.fillColor(BRAND.navy).fontSize(14);
  drawBidiLine(pdf, `${L.grandTotal}: ${fmtMoney(doc.grand_total, doc.currency)}`, LEFT + FULL - totalsW, pdf.y, totalsW);

  if (doc.notes) {
    pdf.moveDown(2).fontSize(10.5).fillColor(BRAND.charcoal);
    doc.notes.split('\n').forEach((line) => {
      drawBidiLine(pdf, line, LEFT, pdf.y, FULL);
      pdf.moveDown(0.5);
    });
  }

  pdf.moveDown(2);
  // Tagline stays in English exactly as locked in the brand guide.
  pdf.fontSize(9.5).fillColor(BRAND.gold).font('Helvetica').text('COMMUNICATION BEYOND LANGUAGE.', 40, pdf.y);

  drawPageFooter(pdf);
  pdf.end();
}

module.exports = { renderDocumentPdf };
