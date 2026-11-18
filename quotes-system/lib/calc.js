const TAX_RATES = { '16': 0.16, '0': 0, exempt: 0 };

// JOD's official subdivision is the fils (1 JOD = 1000 fils), so Jordanian
// amounts are conventionally quoted to 3 decimals, not 2. Rounding to 2
// decimals is invisible on small, round-number quotes but can drift far
// enough on large-quantity line items (e.g. per-word translation pricing)
// to fail JoFotara's own tax-amount check on submission.
function decimalsFor(currency) {
  return currency === 'JOD' ? 3 : 2;
}

function roundMoney(n, currency) {
  const d = Math.pow(10, decimalsFor(currency));
  return Math.round((n + Number.EPSILON) * d) / d;
}

function lineTotal(item, currency) {
  const days = Number(item.days) || 0;
  const qty = Number(item.qty) || 0;
  const unitPrice = Number(item.unit_price) || 0;
  return roundMoney(days * qty * unitPrice, currency);
}

function calcTotals({ items, discountType, discountValue, taxType, currency }) {
  const subtotal = roundMoney(items.reduce((sum, it) => sum + lineTotal(it, currency), 0), currency);

  let discountAmount = 0;
  if (discountType === 'percent') {
    discountAmount = roundMoney(subtotal * ((Number(discountValue) || 0) / 100), currency);
  } else {
    discountAmount = roundMoney(Number(discountValue) || 0, currency);
  }
  discountAmount = Math.min(discountAmount, subtotal);

  const taxable = subtotal - discountAmount;
  const rate = TAX_RATES[taxType] ?? 0.16;
  const taxAmount = roundMoney(taxable * rate, currency);
  const grandTotal = roundMoney(taxable + taxAmount, currency);

  return { subtotal, discountAmount, taxAmount, grandTotal };
}

module.exports = { calcTotals, lineTotal, roundMoney, decimalsFor, TAX_RATES };
