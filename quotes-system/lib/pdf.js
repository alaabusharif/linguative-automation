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

// Linguative's own public company details — legal/contact info that belongs
// on every invoice and quote, not client data, so it's fine to keep in code.
const COMPANY = {
  address: 'Khilda – Wasfi Al-Tall Street, Amman, Jordan',
  phones: '+962 79 290 9080   |   +962 79 737 5914',
  email: 'info@linguative.net',
  website: 'linguative.net',
  registrationNo: '54517',
  taxNo: '178170917',
};

// Bank details for the "Payment Details" block on invoices — one account per
// currency (JOD/USD), picked automatically by the invoice's own Currency
// field. Real banking info, so it's read from the server's own .env rather
// than hardcoded here (never commit real values; see .env.example). Left
// unset for a given currency, that currency's block is simply skipped —
// including for a currency (e.g. EUR) with no account configured at all.
function bankDetails(currency) {
  const prefix = currency === 'USD' ? 'BANK_USD_' : currency === 'JOD' ? 'BANK_JOD_' : null;
  if (!prefix) return null;
  const d = {
    beneficiary: process.env[`${prefix}BENEFICIARY`],
    accountNumber: process.env[`${prefix}ACCOUNT_NUMBER`],
    bankName: process.env[`${prefix}NAME`],
    branch: process.env[`${prefix}BRANCH`],
    bankAddress: process.env[`${prefix}ADDRESS`],
    iban: process.env[`${prefix}IBAN`],
    swift: process.env[`${prefix}SWIFT`],
  };
  return Object.values(d).some(Boolean) ? d : null;
}

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
  // Company address/contact block, under the logo — fills what was otherwise
  // blank header space and gives the recipient a way to reach Linguative directly.
  pdf.fillColor('#555555').fontSize(8.5).font('Helvetica')
    .text(COMPANY.address, 40, 100, { width: 260 })
    .text(`${COMPANY.phones}   |   ${COMPANY.email}`, 40, pdf.y, { width: 260 });
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

  // Client block — explicit x=40 here matters: the header above left the
  // text cursor parked at x=0 (from the right-aligned title block), so
  // without it this heading and the whole block under it render flush with
  // the page edge, outside the left margin.
  pdf.fillColor(BRAND.navy).fontSize(13).text(doc.kind === 'invoice' ? 'BILL TO' : 'PREPARED FOR', 40, pdf.y, { continued: false });
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

  // Items table — all six header cells share one explicit y so they can
  // never drift apart, instead of each one re-deriving it from pdf.y after
  // the previous cell's own .text() call already advanced it. Price/Total
  // get a wider column than Days/Qty/Unit — a 4-digit amount like
  // "JOD 1,000.00" doesn't fit in a narrow column and runs into its
  // neighbor otherwise.
  const colX = { desc: 40, days: 260, qty: 290, unit: 320, price: 365, total: 465 };
  const tableHeaderY = pdf.y;
  pdf.fillColor(BRAND.navy).fontSize(10).font('Helvetica-Bold');
  pdf.text('Description', colX.desc, tableHeaderY);
  pdf.text('Days', colX.days, tableHeaderY);
  pdf.text('Qty', colX.qty, tableHeaderY);
  pdf.text('Unit', colX.unit, tableHeaderY);
  pdf.text('Price', colX.price, tableHeaderY);
  pdf.text('Total', colX.total, tableHeaderY);
  pdf.y = tableHeaderY + pdf.currentLineHeight();
  pdf.moveDown(0.5);
  pdf.moveTo(40, pdf.y).lineTo(555, pdf.y).strokeColor(BRAND.charcoal).lineWidth(0.5).stroke();
  pdf.moveDown(0.3);

  pdf.font('Helvetica').fillColor(BRAND.charcoal).fontSize(10.5);
  for (const it of items) {
    const y = pdf.y;
    pdf.text(it.description, colX.desc, y, { width: 210 });
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

  // Payment Details — invoices only, and only once the server's .env has
  // real bank values configured (see bankDetails() above).
  if (doc.kind === 'invoice') {
    const bank = bankDetails(doc.currency);
    if (bank) {
      pdf.moveDown(1.5);
      pdf.fillColor(BRAND.navy).fontSize(12).font('Helvetica-Bold').text('PAYMENT DETAILS', 40, pdf.y);
      pdf.moveDown(0.4);
      pdf.font('Helvetica').fillColor(BRAND.charcoal).fontSize(10);
      const rows = [
        ['Beneficiary:', bank.beneficiary], ['Account Number:', bank.accountNumber], ['Bank Name:', bank.bankName],
        ['Branch:', bank.branch], ['Bank Address:', bank.bankAddress], ['IBAN:', bank.iban], ['SWIFT Code:', bank.swift],
      ];
      for (const [label, value] of rows) {
        if (!value) continue;
        pdf.text(`${label} ${value}`, 40, pdf.y, { width: 515 });
        pdf.moveDown(0.2);
      }
    }
  }

  pdf.moveDown(2);
  pdf.fontSize(9.5).fillColor(BRAND.gold).text('COMMUNICATION BEYOND LANGUAGE.', 40, pdf.y);

  drawPageFooter(pdf);
  pdf.end();
}

// Master template's footer, pinned near the bottom of the page. Stays just
// above the page's bottom margin — pdfkit silently starts a new page if
// text would land inside the margin, even with an explicit y.
function drawPageFooter(pdf) {
  const y = pdf.page.height - pdf.page.margins.bottom - 24;
  pdf.fontSize(8.5).fillColor('#777777').font('Helvetica')
    .text(`${COMPANY.registrationNo ? `Registration No. ${COMPANY.registrationNo}   |   ` : ''}Tax No. ${COMPANY.taxNo}`, 40, y, { width: 515, align: 'center', lineBreak: false })
    .text('linguative.net   |   Amman, Jordan   |   Communication Beyond Language', 40, y + 12, { width: 515, align: 'center', lineBreak: false });
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
  // Company address/contact block, under the logo, kept LTR (addresses/phone
  // numbers read the same in both layouts) — matches the English layout.
  pdf.font('Helvetica').fillColor('#555555').fontSize(8.5)
    .text(COMPANY.address, 40, 100, { width: 260 })
    .text(`${COMPANY.phones}   |   ${COMPANY.email}`, 40, pdf.y, { width: 260 });
  pdf.font('Cairo').fillColor(BRAND.navy).fontSize(22);
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
  drawBidiLine(pdf, doc.kind === 'invoice' ? L.billTo : L.preparedFor, LEFT, pdf.y, FULL);
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
  // same left-to-right order as the English layout for consistency. Total/
  // Price get wider columns than Unit/Qty/Days — a 4-digit amount wraps
  // onto a second line in a too-narrow column and throws the row out of
  // alignment with its neighbors otherwise.
  const colX = { total: 40, price: 130, unit: 215, qty: 265, days: 305, desc: 345 };
  const colW = { total: 85, price: 80, unit: 45, qty: 35, days: 35, desc: 210 };
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

  // Payment Details — invoices only, and only once the server's .env has
  // real bank values configured (see bankDetails() above).
  if (doc.kind === 'invoice') {
    const bank = bankDetails(doc.currency);
    if (bank) {
      pdf.moveDown(1.5);
      pdf.fillColor(BRAND.navy).fontSize(12);
      drawBidiLine(pdf, L.paymentDetails, LEFT, pdf.y, FULL);
      pdf.moveDown(0.5);
      pdf.fillColor(BRAND.charcoal).fontSize(10);
      const rows = [
        [L.bank.beneficiary, bank.beneficiary], [L.bank.accountNumber, bank.accountNumber], [L.bank.bankName, bank.bankName],
        [L.bank.branch, bank.branch], [L.bank.bankAddress, bank.bankAddress], [L.bank.iban, bank.iban], [L.bank.swift, bank.swift],
      ];
      for (const [label, value] of rows) {
        if (!value) continue;
        drawBidiLine(pdf, `${label} ${value}`, LEFT, pdf.y, FULL);
        pdf.moveDown(0.5);
      }
    }
  }

  pdf.moveDown(2);
  // Tagline stays in English exactly as locked in the brand guide.
  pdf.fontSize(9.5).fillColor(BRAND.gold).font('Helvetica').text('COMMUNICATION BEYOND LANGUAGE.', 40, pdf.y);

  drawPageFooter(pdf);
  pdf.end();
}

module.exports = { renderDocumentPdf };
