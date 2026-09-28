// Field labels for the two supported document languages. The Arabic side
// uses the terms an Arabic-speaking business actually uses on a real
// quotation/invoice (native business Arabic), not a literal word-for-word
// translation of the English labels.
const EN = {
  quotation: 'QUOTATION',
  invoice: 'INVOICE',
  preparedFor: 'PREPARED FOR',
  quotationDetails: 'QUOTATION DETAILS',
  invoiceDetails: 'INVOICE DETAILS',
  client: 'Client / Organization:',
  contact: 'Contact Person:',
  project: 'Project / Event:',
  venue: 'Venue:',
  poNumber: 'PO Number:',
  quotationNo: 'Quotation No.:',
  invoiceNo: 'Invoice No.:',
  date: 'Date:',
  dueDate: 'Due Date:',
  validUntil: 'Valid Until:',
  serviceDates: 'Service Dates:',
  preparedBy: 'Prepared By:',
  scopePricing: 'SCOPE & PRICING',
  col: { no: '#', item: 'Item', days: 'Days', qty: 'Qty', unit: 'Unit', unitPrice: 'Unit Price', total: 'Total Price' },
  calcSummary: 'CALCULATION SUMMARY',
  currency: 'Currency',
  subtotal: 'Subtotal',
  discount: 'Discount',
  taxStatus: 'Tax Status',
  taxAmount: 'Tax Amount',
  grandTotal: 'Grand Total',
  taxExempt: 'Exempt',
  notFilled: 'N/A',
  months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
};

const AR = {
  quotation: 'عرض سعر',
  invoice: 'فاتورة',
  preparedFor: 'بيانات العميل',
  quotationDetails: 'تفاصيل العرض',
  invoiceDetails: 'تفاصيل الفاتورة',
  client: 'الجهة / الشركة:',
  contact: 'الشخص المسؤول:',
  project: 'المشروع / الفعالية:',
  venue: 'المكان:',
  poNumber: 'رقم أمر الشراء:',
  quotationNo: 'رقم العرض:',
  invoiceNo: 'رقم الفاتورة:',
  date: 'التاريخ:',
  dueDate: 'تاريخ الاستحقاق:',
  validUntil: 'صالح حتى:',
  serviceDates: 'تاريخ الخدمة:',
  preparedBy: 'أعده:',
  scopePricing: 'نطاق الخدمات والأسعار',
  col: { no: '#', item: 'البند', days: 'الأيام', qty: 'الكمية', unit: 'الوحدة', unitPrice: 'سعر الوحدة', total: 'المجموع' },
  calcSummary: 'ملخص الحساب',
  currency: 'العملة',
  subtotal: 'المجموع الفرعي',
  discount: 'الخصم',
  taxStatus: 'حالة الضريبة',
  taxAmount: 'قيمة الضريبة',
  grandTotal: 'الإجمالي الكلي',
  taxExempt: 'معفى',
  notFilled: 'لا يوجد',
  // Standard international Arabic month names (not the Levantine Aramaic-origin
  // set), matching the formal/official register Linguative's clients expect.
  months: ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'],
};

function labelsFor(language) {
  return language === 'ar' ? AR : EN;
}

// Date formatted "27 September 2026" / "27 سبتمبر 2026" — day/year always in
// plain Western digits, per Ala's instruction to keep numbers as-is.
function formatDate(dateStr, language) {
  const d = new Date(dateStr);
  const L = labelsFor(language);
  return `${d.getDate()} ${L.months[d.getMonth()]} ${d.getFullYear()}`;
}

function taxLabel(taxType, language) {
  const L = labelsFor(language);
  if (taxType === 'exempt') return L.taxExempt;
  if (taxType === '0') return '0%';
  return '16%';
}

module.exports = { EN, AR, labelsFor, formatDate, taxLabel };
