// Generates a .docx in the same layout as Linguative's master quotation
// template (QUOTATION header / PREPARED FOR + QUOTATION DETAILS / SCOPE &
// PRICING table / CALCULATION SUMMARY) — recreated generically here so the
// app never needs the private master file (with real client data) at
// runtime. Same structure, this document's own data.
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, BorderStyle, ImageRun, ShadingType,
} = require('docx');
const { labelsFor, formatDate, taxLabel } = require('./labels');

const NAVY = '071A2E';
const GOLD = 'C9A46A';
const CHARCOAL = '2B2B2B';
const IVORY = 'F8F5F0';

const LOGO_PATH = path.join(__dirname, '..', '..', 'marketing', 'brand', 'logos', 'logo-navy-gold-light-bg.png');

function fmtMoney(n, currency) {
  return `${currency} ${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

// `rtl` marks the paragraph bidirectional so Word applies its own (correct)
// Arabic shaping and bidi reordering — mixed Arabic/number text needs no
// special handling here, unlike the PDF path (see lib/bidi.js).
function cell(text, opts = {}) {
  const align = opts.align || (opts.rtl ? AlignmentType.RIGHT : AlignmentType.LEFT);
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shade ? { type: ShadingType.CLEAR, fill: opts.shade } : undefined,
    children: [new Paragraph({
      alignment: align,
      bidirectional: !!opts.rtl,
      children: [new TextRun({ text: text ?? '', bold: !!opts.bold, color: opts.color || CHARCOAL, size: opts.size || 18, rightToLeft: !!opts.rtl })],
    })],
  });
}

async function buildDocumentDocx(doc, items) {
  const language = doc.language === 'ar' ? 'ar' : 'en';
  const rtl = language === 'ar';
  const L = labelsFor(language);
  const align = rtl ? AlignmentType.RIGHT : AlignmentType.LEFT;

  const headerChildren = [];
  if (fs.existsSync(LOGO_PATH)) {
    headerChildren.push(new ImageRun({ type: 'png', data: fs.readFileSync(LOGO_PATH), transformation: { width: 160, height: 50 } }));
  }

  const kindLabel = doc.kind === 'invoice' ? L.invoice : L.quotation;
  const detailsLabel = doc.kind === 'invoice' ? L.invoiceDetails : L.quotationDetails;
  const dateStr = formatDate(doc.created_at, language);

  const preparedForRows = [
    [L.client, doc.client_name || ''],
    [L.contact, doc.contact_person || ''],
    [L.project, doc.project_title || ''],
    [L.venue, doc.venue || ''],
  ];
  const detailsRows = [
    [doc.kind === 'invoice' ? L.invoiceNo : L.quotationNo, `${doc.number}${doc.version > 1 ? ` (v${doc.version})` : ''}`],
    [L.date, dateStr],
    [L.poNumber, doc.po_number || L.notFilled],
  ];
  if (doc.kind === 'invoice' && doc.due_date) {
    detailsRows.push([L.dueDate, formatDate(doc.due_date, language)]);
  }

  // In the Arabic layout the "prepared for" column reads right-to-left, so
  // it goes on the right (first table cell in RTL reading order is visually
  // the rightmost) — swap the two columns' order for that layout.
  const leftCol = rtl ? [detailsLabel, detailsRows] : [L.preparedFor, preparedForRows];
  const rightCol = rtl ? [L.preparedFor, preparedForRows] : [detailsLabel, detailsRows];

  const infoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
    rows: [
      new TableRow({ children: [
        cell(leftCol[0], { width: 50, bold: true, color: NAVY, size: 20, rtl }),
        cell(rightCol[0], { width: 50, bold: true, color: NAVY, size: 20, rtl }),
      ]}),
      ...Array.from({ length: Math.max(leftCol[1].length, rightCol[1].length) }).map((_, i) => new TableRow({ children: [
        cell(leftCol[1][i] ? `${leftCol[1][i][0]}  ${leftCol[1][i][1]}` : '', { width: 50, rtl }),
        cell(rightCol[1][i] ? `${rightCol[1][i][0]}  ${rightCol[1][i][1]}` : '', { width: 50, rtl }),
      ]})),
    ],
  });

  const itemHeader = new TableRow({
    children: [L.col.no, L.col.item, L.col.days, L.col.qty, L.col.unit, L.col.unitPrice, L.col.total].map(h =>
      cell(h, { bold: true, color: 'FFFFFF', shade: NAVY, size: 16, rtl })),
  });
  const itemRows = items.map((it, idx) => new TableRow({
    children: [
      cell(String(idx + 1), { size: 16, rtl }),
      cell(it.description, { size: 16, rtl }),
      cell(String(it.days), { size: 16, rtl }),
      cell(String(it.qty), { size: 16, rtl }),
      cell(it.unit, { size: 16, rtl }),
      cell(fmtMoney(it.unit_price, doc.currency), { size: 16, rtl }),
      cell(fmtMoney(it.line_total, doc.currency), { size: 16, rtl }),
    ],
  }));
  const itemsTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [itemHeader, ...itemRows] });

  const summaryRows = [
    [L.currency, doc.currency],
    [L.subtotal, fmtMoney(doc.subtotal, doc.currency)],
    [L.discount, fmtMoney(doc.discount_amount, doc.currency)],
    [L.taxStatus, taxLabel(doc.tax_type, language)],
    [L.taxAmount, fmtMoney(doc.tax_amount, doc.currency)],
    [L.grandTotal, fmtMoney(doc.grand_total, doc.currency)],
  ];
  const summaryTable = new Table({
    width: { size: 60, type: WidthType.PERCENTAGE },
    alignment: rtl ? AlignmentType.LEFT : AlignmentType.RIGHT,
    rows: summaryRows.map(([label, value], i) => new TableRow({
      children: [
        cell(label, { width: 50, bold: i === summaryRows.length - 1, color: i === summaryRows.length - 1 ? NAVY : CHARCOAL, rtl }),
        cell(value, { width: 50, bold: i === summaryRows.length - 1, color: i === summaryRows.length - 1 ? NAVY : CHARCOAL, align: rtl ? AlignmentType.LEFT : AlignmentType.RIGHT, rtl }),
      ],
    })),
  });

  const children = [
    new Paragraph({ children: headerChildren, alignment: AlignmentType.LEFT }),
    new Paragraph({ children: [new TextRun({ text: kindLabel, bold: true, size: 40, color: NAVY, rightToLeft: rtl })], alignment: align, bidirectional: rtl }),
    new Paragraph({ text: '' }),
    infoTable,
    new Paragraph({ text: '' }),
    new Paragraph({ children: [new TextRun({ text: L.scopePricing, bold: true, size: 22, color: NAVY, rightToLeft: rtl })], alignment: align, bidirectional: rtl }),
    itemsTable,
    new Paragraph({ text: '' }),
    new Paragraph({ children: [new TextRun({ text: L.calcSummary, bold: true, size: 22, color: NAVY, rightToLeft: rtl })], alignment: align, bidirectional: rtl }),
    summaryTable,
  ];

  if (doc.notes) {
    children.push(new Paragraph({ text: '' }), new Paragraph({ children: [new TextRun({ text: doc.notes, size: 18, color: CHARCOAL, rightToLeft: rtl })], alignment: align, bidirectional: rtl }));
  }
  // Tagline stays in English exactly as locked in the brand guide, regardless of document language.
  children.push(new Paragraph({ text: '' }), new Paragraph({ children: [new TextRun({ text: 'COMMUNICATION BEYOND LANGUAGE.', bold: true, size: 16, color: GOLD })] }));

  const document = new Document({ sections: [{ children }] });
  return Packer.toBuffer(document);
}

module.exports = { buildDocumentDocx };
