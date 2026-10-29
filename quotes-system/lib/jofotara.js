// Integration with JoFotara, Jordan's national e-invoicing system run by
// the Income and Sales Tax Department (ISTD). This is OPTIONAL per
// invoice — see routes/documents.js's jofotara-toggle/submit endpoints —
// and only ever runs for a document Ala has turned it on for.
//
// IMPORTANT — before relying on this in production: this was built from
// public secondary/vendor write-ups (Qoyod, Odoo's Jordan localization
// docs, third-party integration guides), not from ISTD's own technical
// guide PDF, which isn't publicly indexed. The endpoint, headers and
// envelope below match what every source agrees on, but the UBL field
// mapping (tax scheme codes, item classification, the exact extension
// elements ISTD expects) should be treated as a first draft. The first
// real submission will very likely come back with validation error
// messages (JoFotara returns these in plain text) — use those to correct
// buildInvoiceXml() rather than assuming this is final.
const crypto = require('crypto');
const { getCompanySettings, bankDetailsFor, getJofotaraSecret } = require('./settings');

const API_URL = process.env.JOFOTARA_API_URL || 'https://backend.jofotara.gov.jo/core/invoices/';

function xmlEscape(s) {
  return String(s ?? '').replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));
}

// JoFotara's invoice-type-code "name" attribute encodes payment means:
// 011/021 cash/credit income, 012/022 cash/credit sales — Linguative's
// invoices are services on credit terms (due date, bank transfer), so 022.
const INVOICE_TYPE_NAME = '022';

// Only these rates are accepted for a standard ("S") tax category line —
// 0% uses category Z (exempt) or O (zero-rated) instead, never S.
const VAT_RATE = 16;

function buildInvoiceXml(doc, items) {
  const company = getCompanySettings();
  const { incomeSource } = getJofotaraSecret();
  const issueDate = (doc.created_at || new Date().toISOString()).slice(0, 10);
  const uuid = doc.jofotara_uuid || crypto.randomUUID();
  const taxed = doc.tax_type === '16';
  const cur = doc.currency;

  const lines = items.map((it, idx) => {
    const lineExtension = Number(it.line_total) || 0;
    const taxAmount = taxed ? lineExtension * (VAT_RATE / 100) : 0;
    const roundingAmount = lineExtension + taxAmount;
    const taxCategoryId = taxed ? 'S' : 'O';
    return `
  <cac:InvoiceLine>
    <cbc:ID>${idx + 1}</cbc:ID>
    <cbc:InvoicedQuantity unitCode="PCE">${(Number(it.qty) || 1).toFixed(2)}</cbc:InvoicedQuantity>
    <cbc:LineExtensionAmount currencyID="${cur}">${lineExtension.toFixed(2)}</cbc:LineExtensionAmount>
    <cac:TaxTotal>
      <cbc:TaxAmount currencyID="${cur}">${taxAmount.toFixed(2)}</cbc:TaxAmount>
      <cbc:RoundingAmount currencyID="${cur}">${roundingAmount.toFixed(2)}</cbc:RoundingAmount>
      <cac:TaxSubtotal>
        <cbc:TaxAmount currencyID="${cur}">${taxAmount.toFixed(2)}</cbc:TaxAmount>
        <cac:TaxCategory>
          <cbc:ID schemeAgencyID="6" schemeID="UN/ECE 5305">${taxCategoryId}</cbc:ID>
          ${taxed ? `<cbc:Percent>${VAT_RATE.toFixed(2)}</cbc:Percent>` : ''}
          <cac:TaxScheme><cbc:ID schemeAgencyID="6" schemeID="UN/ECE 5153">VAT</cbc:ID></cac:TaxScheme>
        </cac:TaxCategory>
      </cac:TaxSubtotal>
    </cac:TaxTotal>
    <cac:Item>
      <cbc:Name>${xmlEscape(it.description)}</cbc:Name>
    </cac:Item>
    <cac:Price>
      <cbc:PriceAmount currencyID="${cur}">${Number(it.unit_price).toFixed(2)}</cbc:PriceAmount>
      <cac:AllowanceCharge>
        <cbc:ChargeIndicator>false</cbc:ChargeIndicator>
        <cbc:AllowanceChargeReason>DISCOUNT</cbc:AllowanceChargeReason>
        <cbc:Amount currencyID="${cur}">0.00</cbc:Amount>
      </cac:AllowanceCharge>
    </cac:Price>
  </cac:InvoiceLine>`;
  }).join('');

  // JoFotara's own invoice counter — see the comment on submitInvoice's
  // caller; we reuse the document's own (monotonic, unique) row id since
  // there's no separate JoFotara-specific sequence kept today.
  const icv = doc.id;

  return `<?xml version="1.0" encoding="UTF-8"?>
<Invoice xmlns="urn:oasis:names:specification:ubl:schema:xsd:Invoice-2" xmlns:cac="urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2" xmlns:cbc="urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2">
  <cbc:ProfileID>reporting:1.0</cbc:ProfileID>
  <cbc:ID>${xmlEscape(doc.number)}</cbc:ID>
  <cbc:UUID>${uuid}</cbc:UUID>
  <cbc:IssueDate>${issueDate}</cbc:IssueDate>
  <cbc:InvoiceTypeCode name="${INVOICE_TYPE_NAME}">388</cbc:InvoiceTypeCode>
  <cbc:Note></cbc:Note>
  <cbc:DocumentCurrencyCode>${cur}</cbc:DocumentCurrencyCode>
  <cbc:TaxCurrencyCode>${cur}</cbc:TaxCurrencyCode>
  <cac:AdditionalDocumentReference>
    <cbc:ID>ICV</cbc:ID>
    <cbc:UUID>${icv}</cbc:UUID>
  </cac:AdditionalDocumentReference>
  <cac:AccountingSupplierParty>
    <cac:Party>
      <cac:PostalAddress><cac:Country><cbc:IdentificationCode>JO</cbc:IdentificationCode></cac:Country></cac:PostalAddress>
      <cac:PartyTaxScheme>
        <cbc:CompanyID>${xmlEscape(company.taxNo)}</cbc:CompanyID>
        <cac:TaxScheme><cbc:ID>VAT</cbc:ID></cac:TaxScheme>
      </cac:PartyTaxScheme>
      <cac:PartyLegalEntity><cbc:RegistrationName>Linguative</cbc:RegistrationName></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingSupplierParty>
  <cac:AccountingCustomerParty>
    <cac:Party>
      <cac:PartyIdentification><cbc:ID schemeID="TN">0</cbc:ID></cac:PartyIdentification>
      <cac:PostalAddress><cac:Country><cbc:IdentificationCode>JO</cbc:IdentificationCode></cac:Country></cac:PostalAddress>
      <cac:PartyLegalEntity><cbc:RegistrationName>${xmlEscape(doc.client_name)}</cbc:RegistrationName></cac:PartyLegalEntity>
    </cac:Party>
  </cac:AccountingCustomerParty>
  <cac:SellerSupplierParty>
    <cac:Party>
      <cac:PartyIdentification><cbc:ID>${xmlEscape(incomeSource)}</cbc:ID></cac:PartyIdentification>
    </cac:Party>
  </cac:SellerSupplierParty>
  <cac:PaymentMeans>
    <cbc:PaymentMeansCode listID="UN/ECE 4461">${doc.payment_status === 'paid' ? '10' : '30'}</cbc:PaymentMeansCode>
  </cac:PaymentMeans>
  <cac:AllowanceCharge>
    <cbc:ChargeIndicator>false</cbc:ChargeIndicator>
    <cbc:AllowanceChargeReason>discount</cbc:AllowanceChargeReason>
    <cbc:Amount currencyID="${cur}">${Number(doc.discount_amount || 0).toFixed(2)}</cbc:Amount>
  </cac:AllowanceCharge>
  <cac:TaxTotal>
    <cbc:TaxAmount currencyID="${cur}">${Number(doc.tax_amount).toFixed(2)}</cbc:TaxAmount>
  </cac:TaxTotal>
  <cac:LegalMonetaryTotal>
    <cbc:TaxExclusiveAmount currencyID="${cur}">${Number(doc.subtotal).toFixed(2)}</cbc:TaxExclusiveAmount>
    <cbc:TaxInclusiveAmount currencyID="${cur}">${Number(doc.grand_total).toFixed(2)}</cbc:TaxInclusiveAmount>
    <cbc:AllowanceTotalAmount currencyID="${cur}">${Number(doc.discount_amount || 0).toFixed(2)}</cbc:AllowanceTotalAmount>
    <cbc:PayableAmount currencyID="${cur}">${Number(doc.grand_total).toFixed(2)}</cbc:PayableAmount>
  </cac:LegalMonetaryTotal>${lines}
</Invoice>`;
}

// Submits the invoice to JoFotara. Returns { ok, status, number, uuid, qr, raw }
// on a handled response, or throws on a network/transport failure.
async function submitInvoice(doc, items) {
  const { clientId, secretKey } = getJofotaraSecret();
  if (!clientId || !secretKey) {
    throw new Error('JoFotara client ID / secret key are not set — add them in Settings first.');
  }

  // Keep the same UUID across retries of the same invoice (ISTD treats a
  // resubmission with a new UUID as a brand-new document).
  const uuid = doc.jofotara_uuid || crypto.randomUUID();
  const xml = buildInvoiceXml({ ...doc, jofotara_uuid: uuid }, items);
  const invoiceBase64 = Buffer.from(xml, 'utf8').toString('base64');

  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Client-Id': clientId,
      'Secret-Key': secretKey,
    },
    body: JSON.stringify({ invoice: invoiceBase64 }),
  });

  const raw = await resp.text();
  let parsed;
  try { parsed = JSON.parse(raw); } catch { parsed = null; }

  if (!resp.ok) {
    // Confirmed against the real endpoint (2026-10-16, with placeholder
    // credentials): errors come back as EINV_RESULTS.ERRORS, each an
    // object with an EINV_MESSAGE string — not EINV_MESSAGES as some
    // secondary write-ups suggested.
    const message = parsed?.EINV_RESULTS?.ERRORS?.map((m) => m.EINV_MESSAGE).join('; ')
      || parsed?.message || raw || `HTTP ${resp.status}`;
    return { ok: false, status: resp.status, message, uuid, raw };
  }

  const status = parsed?.EINV_STATUS || parsed?.status || 'submitted';
  const qr = parsed?.EINV_QR_SOURCE || parsed?.qrCode || parsed?.qr || null;
  const number = parsed?.EINV_NUM || parsed?.invoiceNumber || null;

  return { ok: true, status, number, uuid, qr, raw };
}

module.exports = { buildInvoiceXml, submitInvoice, API_URL };
