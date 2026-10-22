const TAX_RATES = { '16': 0.16, '0': 0, exempt: 0 };

function round2(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function lineTotal(item) {
  const days = Number(item.days) || 0;
  const qty = Number(item.qty) || 0;
  const unitPrice = Number(item.unit_price) || 0;
  return round2(days * qty * unitPrice);
}

function calcTotals({ items, discountType, discountValue, taxType }) {
  const subtotal = round2(items.reduce((sum, it) => sum + lineTotal(it), 0));

  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = round2(subtotal * ((Number(discountValue) || 0) / 100));
  } else {
    discountAmount = round2(Number(discountValue) || 0);
  }
  discountAmount = Math.min(discountAmount, subtotal);

  const taxable = subtotal - discountAmount;
  const rate = TAX_RATES[taxType] ?? 0.16;
  const taxAmount = round2(taxable * rate);
  const grandTotal = round2(taxable + taxAmount);

  return { subtotal, discountAmount, taxAmount, grandTotal };
}

module.exports = { calcTotals, lineTotal, round2, TAX_RATES };
