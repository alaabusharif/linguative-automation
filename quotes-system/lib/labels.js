// Field labels for the two supported document languages. The Arabic side
// uses the terms an Arabic-speaking business actually uses on a real
// quotation/invoice (native business Arabic), not a literal word-for-word
// translation of the English labels.
const EN = {
  quotation: 'QUOTATION',
  invoice: 'INVOICE',
  preparedFor: 'PREPARED FOR',
  billTo: 'BILL TO',
  paymentDetails: 'PAYMENT DETAILS',
  bank: { beneficiary: 'Beneficiary:', accountNumber: 'Account Number:', bankName: 'Bank Name:', branch: 'Branch:', bankAddress: 'Bank Address:', iban: 'IBAN:', swift: 'SWIFT Code:' },
  registrationNo: 'Registration No.',
  taxNo: 'Tax No.',
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
  paymentType: 'Invoice Type:',
  paymentTypeCash: 'Cash',
  paymentTypePayable: 'Payable (Credit)',
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
  cancellationHeading: 'CANCELLATION POLICY',
  cancellationLines: [
    'More than 72 hours (3 working days) before the event: no charge.',
    '24 to 72 hours before the event: 50% of quoted fees.',
    'Less than 24 hours’ notice, or no-show: 100% of quoted fees.',
    'Costs already incurred for equipment, transport or setup are billed at cost regardless of when cancelled.',
    'Rescheduling with at least 48 hours’ notice is free of charge, subject to interpreter availability.',
    'All cancellations must be submitted in writing by email.',
  ],
};

const AR = {
  quotation: 'عرض سعر',
  invoice: 'فاتورة',
  preparedFor: 'بيانات العميل',
  billTo: 'فاتورة إلى',
  paymentDetails: 'تفاصيل الدفع',
  bank: { beneficiary: 'المستفيد:', accountNumber: 'رقم الحساب:', bankName: 'اسم البنك:', branch: 'الفرع:', bankAddress: 'عنوان البنك:', iban: 'آيبان:', swift: 'رمز السويفت:' },
  registrationNo: 'رقم السجل',
  taxNo: 'الرقم الضريبي',
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
  paymentType: 'نوع الفاتورة:',
  paymentTypeCash: 'نقدًا',
  paymentTypePayable: 'آجل (على الحساب)',
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
  cancellationHeading: 'سياسة الإلغاء',
  cancellationLines: [
    'الإلغاء قبل الفعالية بأكثر من 72 ساعة (3 أيام عمل): دون أي رسوم.',
    'الإلغاء قبل الفعالية بـ 24 إلى 72 ساعة: تُستحق 50% من الرسوم المتفق عليها.',
    'الإلغاء بإشعار أقل من 24 ساعة، أو عدم الحضور: تُستحق 100% من الرسوم المتفق عليها.',
    'التكاليف المتحملة فعليًا للمعدات أو النقل أو التجهيز تُحتسب بالكامل بغض النظر عن وقت الإلغاء.',
    'يمكن تأجيل الموعد دون أي رسوم بإشعار مسبق لا يقل عن 48 ساعة، وذلك حسب توافر المترجمين.',
    'يجب تقديم أي طلب إلغاء كتابيًا عبر البريد الإلكتروني.',
  ],
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

function paymentTypeLabel(paymentType, language) {
  const L = labelsFor(language);
  return paymentType === 'cash' ? L.paymentTypeCash : L.paymentTypePayable;
}

module.exports = { EN, AR, labelsFor, formatDate, taxLabel, paymentTypeLabel };
