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

const NAVY = '071A2E';
const GOLD = 'C9A46A';
const CHARCOAL = '2B2B2B';
const IVORY = 'F8F5F0';

const LOGO_PATH = path.join(__dirname, '..', '..', 'marketing', 'brand', 'logos', 'logo-navy-gold-light-bg.png');

function fmtMoney(n, currency) {
  return `${currency} ${Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`;
}

function taxLabel(taxType) {
  if (taxType === 'exempt') return 'Exempt';
  if (taxType === '0') return '0%';
  return '16%';
}

function cell(text, opts = {}) {
  return new TableCell({
    width: opts.width ? { size: opts.width, type: WidthType.PERCENTAGE } : undefined,
    shading: opts.shade ? { type: ShadingType.CLEAR, fill: opts.shade } : undefined,
    children: [new Paragraph({
      alignment: opts.align || AlignmentType.LEFT,
      children: [new TextRun({ text: text ?? '', bold: !!opts.bold, color: opts.color || CHARCOAL, size: opts.size || 18 })],
    })],
  });
}

async function buildDocumentDocx(doc, items) {
  const headerChildren = [];
  if (fs.existsSync(LOGO_PATH)) {
    headerChildren.push(new ImageRun({ type: 'png', data: fs.readFileSync(LOGO_PATH), transformation: { width: 160, height: 50 } }));
  }

  const kindLabel = doc.kind === 'invoice' ? 'INVOICE' : 'QUOTATION';
  const dateStr = new Date(doc.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  const preparedForRows = [
    ['Client / Organization:', doc.client_name || ''],
    ['Contact Person', doc.contact_person || ''],
    ['Project / Event', doc.project_title || ''],
    ['Venue', doc.venue || ''],
  ];
  const detailsRows = [
    [doc.kind === 'invoice' ? 'Invoice No.' : 'Quotation No.', `${doc.number}${doc.version > 1 ? ` (v${doc.version})` : ''}`],
    ['Date', dateStr],
    ['PO Number', doc.po_number || 'N/A'],
  ];
  if (doc.kind === 'invoice' && doc.due_date) {
    detailsRows.push(['Due Date', new Date(doc.due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })]);
  }

  const infoTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: { top: { style: BorderStyle.NONE }, bottom: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE }, insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE } },
    rows: [
      new TableRow({ children: [
        cell('PREPARED FOR', { width: 50, bold: true, color: NAVY, size: 20 }),
        cell(kindLabel + ' DETAILS', { width: 50, bold: true, color: NAVY, size: 20 }),
      ]}),
      ...Array.from({ length: Math.max(preparedForRows.length, detailsRows.length) }).map((_, i) => new TableRow({ children: [
        cell(preparedForRows[i] ? `${preparedForRows[i][0]}  ${preparedForRows[i][1]}` : '', { width: 50 }),
        cell(detailsRows[i] ? `${detailsRows[i][0]}  ${detailsRows[i][1]}` : '', { width: 50 }),
      ]})),
    ],
  });

  const itemHeader = new TableRow({
    children: ['#', 'Item', 'Days', 'Qty', 'Unit', 'Unit Price', 'Total Price'].map(h =>
      cell(h, { bold: true, color: 'FFFFFF', shade: NAVY, size: 16 })),
  });
  const itemRows = items.map((it, idx) => new TableRow({
    children: [
      cell(String(idx + 1), { size: 16 }),
      cell(it.description, { size: 16 }),
      cell(String(it.days), { size: 16 }),
      cell(String(it.qty), { size: 16 }),
      cell(it.unit, { size: 16 }),
      cell(fmtMoney(it.unit_price, doc.currency), { size: 16 }),
      cell(fmtMoney(it.line_total, doc.currency), { size: 16 }),
    ],
  }));
  const itemsTable = new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [itemHeader, ...itemRows] });

  const summaryRows = [
    ['Currency', doc.currency],
    ['Subtotal', fmtMoney(doc.subtotal, doc.currency)],
    ['Discount', fmtMoney(doc.discount_amount, doc.currency)],
    ['Tax Status', taxLabel(doc.tax_type)],
    ['Tax Amount', fmtMoney(doc.tax_amount, doc.currency)],
    ['Grand Total', fmtMoney(doc.grand_total, doc.currency)],
  ];
  const summaryTable = new Table({
    width: { size: 60, type: WidthType.PERCENTAGE },
    alignment: AlignmentType.RIGHT,
    rows: summaryRows.map(([label, value], i) => new TableRow({
      children: [
        cell(label, { width: 50, bold: i === summaryRows.length - 1, color: i === summaryRows.length - 1 ? NAVY : CHARCOAL }),
        cell(value, { width: 50, bold: i === summaryRows.length - 1, color: i === summaryRows.length - 1 ? NAVY : CHARCOAL, align: AlignmentType.RIGHT }),
      ],
    })),
  });

  const children = [
    new Paragraph({ children: headerChildren, alignment: AlignmentType.LEFT }),
    new Paragraph({ children: [new TextRun({ text: kindLabel, bold: true, size: 40, color: NAVY })], alignment: AlignmentType.RIGHT }),
    new Paragraph({ text: '' }),
    infoTable,
    new Paragraph({ text: '' }),
    new Paragraph({ children: [new TextRun({ text: 'SCOPE & PRICING', bold: true, size: 22, color: NAVY })] }),
    itemsTable,
    new Paragraph({ text: '' }),
    new Paragraph({ children: [new TextRun({ text: 'CALCULATION SUMMARY', bold: true, size: 22, color: NAVY })] }),
    summaryTable,
  ];

  if (doc.notes) {
    children.push(new Paragraph({ text: '' }), new Paragraph({ children: [new TextRun({ text: doc.notes, size: 18, color: CHARCOAL })] }));
  }
  children.push(new Paragraph({ text: '' }), new Paragraph({ children: [new TextRun({ text: 'COMMUNICATION BEYOND LANGUAGE.', bold: true, size: 16, color: GOLD })] }));

  const document = new Document({ sections: [{ children }] });
  return Packer.toBuffer(document);
}

module.exports = { buildDocumentDocx };
