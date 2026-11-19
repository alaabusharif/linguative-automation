// Per-document line-item layout. Added 2026-11-18 — Ala needed a different
// invoice/quote table for translation-style and hourly-rate work instead of
// forcing everything through the interpretation/event Days×Qty×Unit×Price
// table (which is how a 13,017-word translation line ended up with "13017"
// typed into a "Qty" box meant for headcount).
//
// All three formats reuse the SAME underlying document_items columns
// (days/qty/unit/unit_price) and the SAME line_total = days*qty*unit_price
// formula in lib/calc.js — only the on-screen/PDF/DOCX labels change, and
// which of those columns are shown. "days" is forced to 1 and hidden for
// any format that doesn't use it, so the math never changes, just the labels.
const FORMATS = {
  event: {
    id: 'event',
    label: { en: 'Event / Interpretation', ar: 'الفعاليات والترجمة الفورية' },
    cols: ['days', 'qty', 'unit', 'unitPrice'],
    labels: {
      // "Price", not "Unit Price" — matches the reference design's column
      // header exactly (Q-2026-109 / FHI 360 STRIDES quote, 2026-11-18).
      en: { days: 'Days', qty: 'Qty', unit: 'Unit', unitPrice: 'Price' },
      ar: { days: 'الأيام', qty: 'الكمية', unit: 'الوحدة', unitPrice: 'السعر' },
    },
  },
  translation: {
    id: 'translation',
    label: { en: 'Translation & Similar', ar: 'الترجمة وما شابه' },
    cols: ['unit', 'qty', 'unitPrice'],
    labels: {
      en: { unit: 'Language Pair', qty: 'Word Count', unitPrice: 'Rate / Word' },
      ar: { unit: 'زوج اللغات', qty: 'عدد الكلمات', unitPrice: 'السعر / كلمة' },
    },
  },
  hourly: {
    id: 'hourly',
    label: { en: 'Hourly', ar: 'بالساعة' },
    cols: ['qty', 'unitPrice'],
    labels: {
      en: { qty: 'Hours', unitPrice: 'Hourly Rate' },
      ar: { qty: 'الساعات', unitPrice: 'السعر بالساعة' },
    },
  },
};

function formatFor(id) {
  return FORMATS[id] || FORMATS.event;
}

// The only 4 underlying fields any line item has (see document_items'
// schema) — a custom column selection can only reorder/relabel/hide among
// these, not invent a new one, since there's nowhere to store extra data.
const ALL_FIELDS = ['days', 'qty', 'unit', 'unitPrice'];

// Ordered list of { key, label } for the columns this format shows
// (excluding Description and Total, which every format always shows).
// `customCols` (added 2026-11-18) is an optional per-document override —
// an ordered array of { field, label } from a document's column_config —
// letting a user show/hide/relabel/reorder the 4 underlying fields
// instead of being stuck with one of the 3 fixed presets.
function columnsFor(id, language, customCols) {
  if (Array.isArray(customCols) && customCols.length) {
    const f = formatFor(id);
    const defaultLabels = f.labels[language] || f.labels.en;
    return customCols
      .filter((c) => c && ALL_FIELDS.includes(c.field))
      .map((c) => ({ key: c.field, label: c.label || defaultLabels[c.field] || c.field }));
  }
  const f = formatFor(id);
  const labels = f.labels[language] || f.labels.en;
  return f.cols.map((key) => ({ key, label: labels[key] }));
}

function allFormats(language) {
  return Object.values(FORMATS).map((f) => ({ id: f.id, label: f.label[language] || f.label.en }));
}

module.exports = { FORMATS, ALL_FIELDS, formatFor, columnsFor, allFormats };
