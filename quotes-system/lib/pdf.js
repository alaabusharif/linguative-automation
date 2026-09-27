const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

const BRAND = {
  navy: '#071A2E',
  gold: '#C9A46A',
  ivory: '#F8F5F0',
  charcoal: '#2B2B2B',
};

// The locked brand logo file, shipped with the repo — never redrawn or regenerated.
const LOGO_PATH = path.join(__dirname, '..', '..', 'marketing', 'brand', 'logos', 'logo-navy-gold-light-bg.png');

function fmtMoney(n, currency) {
  return `${currency} ${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function taxLabel(taxType) {
  if (taxType === 'exempt') return 'Exempt';
  if (taxType === '0') return '0%';
  return '16%';
}

// Renders a quote or invoice document (with its items) to a PDF stream.
function renderDocumentPdf(doc, items, res) {
  const pdf = new PDFDocument({ size: 'A4', margin: 40 });
  pdf.pipe(res);

  // Header
  if (fs.existsSync(LOGO_PATH)) {
    pdf.image(LOGO_PATH, 40, 36, { width: 160 });
  }
  pdf.fillColor(BRAND.navy)
    .fontSize(20)
    .text(doc.kind === 'invoice' ? 'INVOICE' : 'QUOTATION', 0, 40, { align: 'right' });
  pdf.fillColor(BRAND.charcoal)
    .fontSize(10)
    .text(`${doc.number}${doc.version > 1 ? `  (v${doc.version})` : ''}`, { align: 'right' })
    .text(new Date(doc.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }), { align: 'right' });

  pdf.moveDown(3);
  pdf.moveTo(40, pdf.y).lineTo(555, pdf.y).strokeColor(BRAND.gold).lineWidth(1).stroke();
  pdf.moveDown(1);

  // Client block
  pdf.fillColor(BRAND.navy).fontSize(11).text('PREPARED FOR', { continued: false });
  pdf.fillColor(BRAND.charcoal).fontSize(10);
  pdf.text(`Client / Organization: ${doc.client_name || ''}`);
  if (doc.contact_person) pdf.text(`Contact Person: ${doc.contact_person}`);
  if (doc.project_title) pdf.text(`Project / Event: ${doc.project_title}`);
  if (doc.venue) pdf.text(`Venue: ${doc.venue}`);
  if (doc.po_number) pdf.text(`PO Number: ${doc.po_number}`);
  if (doc.kind === 'invoice' && doc.due_date) {
    pdf.text(`Due Date: ${new Date(doc.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`);
  }
  pdf.moveDown(1.2);

  // Items table
  const colX = { desc: 40, days: 300, qty: 335, unit: 375, price: 425, total: 490 };
  pdf.fillColor(BRAND.navy).fontSize(9).font('Helvetica-Bold');
  pdf.text('Description', colX.desc, pdf.y);
  pdf.text('Days', colX.days, pdf.y - pdf.currentLineHeight());
  pdf.text('Qty', colX.qty, pdf.y - pdf.currentLineHeight());
  pdf.text('Unit', colX.unit, pdf.y - pdf.currentLineHeight());
  pdf.text('Price', colX.price, pdf.y - pdf.currentLineHeight());
  pdf.text('Total', colX.total, pdf.y - pdf.currentLineHeight());
  pdf.moveDown(0.5);
  pdf.moveTo(40, pdf.y).lineTo(555, pdf.y).strokeColor(BRAND.charcoal).lineWidth(0.5).stroke();
  pdf.moveDown(0.3);

  pdf.font('Helvetica').fillColor(BRAND.charcoal).fontSize(9);
  for (const it of items) {
    const y = pdf.y;
    pdf.text(it.description, colX.desc, y, { width: 250 });
    const afterDescY = pdf.y;
    pdf.text(String(it.days), colX.days, y);
    pdf.text(String(it.qty), colX.qty, y);
    pdf.text(it.unit, colX.unit, y);
    pdf.text(fmtMoney(it.unit_price, doc.currency), colX.price, y);
    pdf.text(fmtMoney(it.line_total, doc.currency), colX.total, y);
    pdf.y = Math.max(afterDescY, y + 12);
  }

  pdf.moveDown(1);
  pdf.moveTo(40, pdf.y).lineTo(555, pdf.y).strokeColor(BRAND.gold).lineWidth(1).stroke();
  pdf.moveDown(0.5);

  // Totals
  const totalsX = 400;
  pdf.fontSize(10).fillColor(BRAND.charcoal);
  pdf.text(`Subtotal: ${fmtMoney(doc.subtotal, doc.currency)}`, totalsX, pdf.y, { align: 'right' });
  if (doc.discount_amount > 0) {
    pdf.text(`Discount: -${fmtMoney(doc.discount_amount, doc.currency)}`, totalsX, pdf.y, { align: 'right' });
  }
  pdf.text(`Tax (${taxLabel(doc.tax_type)}): ${fmtMoney(doc.tax_amount, doc.currency)}`, totalsX, pdf.y, { align: 'right' });
  pdf.font('Helvetica-Bold').fillColor(BRAND.navy).fontSize(12)
    .text(`Grand Total: ${fmtMoney(doc.grand_total, doc.currency)}`, totalsX, pdf.y, { align: 'right' });

  if (doc.notes) {
    pdf.moveDown(2).font('Helvetica').fontSize(9).fillColor(BRAND.charcoal).text(doc.notes, 40, pdf.y, { width: 515 });
  }

  pdf.moveDown(2);
  pdf.fontSize(8).fillColor(BRAND.gold).text('COMMUNICATION BEYOND LANGUAGE.', 40, pdf.y);

  pdf.end();
}

module.exports = { renderDocumentPdf };
