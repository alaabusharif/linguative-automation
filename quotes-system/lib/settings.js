const db = require('../db/db');

const COMPANY_KEY = 'company';
const JOFOTARA_KEY = 'jofotara';

// Bank fields kept for each currency account.
const BANK_FIELDS = ['beneficiary', 'accountNumber', 'bankName', 'branch', 'bankAddress', 'iban', 'swift'];
const EMPTY_BANK = Object.fromEntries(BANK_FIELDS.map((f) => [f, '']));

// Registration/tax numbers are Linguative's own public legal identifiers
// (not client data), already printed on real invoices — used as the
// starting default so the footer isn't blank before anyone opens Settings.
// Ala can still change them from the Settings screen.
const DEFAULTS = {
  taxNo: '178170917',
  registrationNo: '54517',
  bankJod: { ...EMPTY_BANK },
  bankUsd: { ...EMPTY_BANK },
};

// Reads the company settings row (tax ID, registration number, JOD/USD bank
// accounts), falling back to BANK_JOD_*/BANK_USD_*/COMPANY_* env vars (for
// an existing server deployment that already set those) and then to
// DEFAULTS the first time nothing has been saved yet. Always returns every
// field (never undefined) so callers don't have to null-check.
function getCompanySettings() {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(COMPANY_KEY);
  if (row) {
    const saved = JSON.parse(row.value);
    return {
      taxNo: saved.taxNo || DEFAULTS.taxNo,
      registrationNo: saved.registrationNo || DEFAULTS.registrationNo,
      bankJod: { ...EMPTY_BANK, ...(saved.bankJod || {}) },
      bankUsd: { ...EMPTY_BANK, ...(saved.bankUsd || {}) },
    };
  }
  return {
    taxNo: process.env.COMPANY_TAX_NO || DEFAULTS.taxNo,
    registrationNo: process.env.COMPANY_REGISTRATION_NO || DEFAULTS.registrationNo,
    bankJod: {
      beneficiary: process.env.BANK_JOD_BENEFICIARY || '', accountNumber: process.env.BANK_JOD_ACCOUNT_NUMBER || '',
      bankName: process.env.BANK_JOD_NAME || '', branch: process.env.BANK_JOD_BRANCH || '',
      bankAddress: process.env.BANK_JOD_ADDRESS || '', iban: process.env.BANK_JOD_IBAN || '', swift: process.env.BANK_JOD_SWIFT || '',
    },
    bankUsd: {
      beneficiary: process.env.BANK_USD_BENEFICIARY || '', accountNumber: process.env.BANK_USD_ACCOUNT_NUMBER || '',
      bankName: process.env.BANK_USD_NAME || '', branch: process.env.BANK_USD_BRANCH || '',
      bankAddress: process.env.BANK_USD_ADDRESS || '', iban: process.env.BANK_USD_IBAN || '', swift: process.env.BANK_USD_SWIFT || '',
    },
  };
}

function sanitizeBank(input) {
  const out = { ...EMPTY_BANK };
  if (input && typeof input === 'object') {
    for (const f of BANK_FIELDS) if (typeof input[f] === 'string') out[f] = input[f].trim();
  }
  return out;
}

// Merges a partial update onto the current settings and saves. Never
// deletes a field the caller didn't send.
function updateCompanySettings(partial) {
  const current = getCompanySettings();
  const next = {
    taxNo: typeof partial.taxNo === 'string' ? partial.taxNo.trim() : current.taxNo,
    registrationNo: typeof partial.registrationNo === 'string' ? partial.registrationNo.trim() : current.registrationNo,
    bankJod: partial.bankJod ? sanitizeBank(partial.bankJod) : current.bankJod,
    bankUsd: partial.bankUsd ? sanitizeBank(partial.bankUsd) : current.bankUsd,
  };
  db.prepare(`
    INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(COMPANY_KEY, JSON.stringify(next));
  return next;
}

// Bank details for the invoice's own currency, or null if that currency
// isn't JOD/USD or nothing has been filled in for it yet.
function bankDetailsFor(currency) {
  const settings = getCompanySettings();
  const bank = currency === 'USD' ? settings.bankUsd : currency === 'JOD' ? settings.bankJod : null;
  if (!bank) return null;
  return Object.values(bank).some(Boolean) ? bank : null;
}

// JoFotara (Jordan national e-invoicing) credentials — the client ID,
// secret key and activity/income-source number Ala generates himself from
// the JoFotara portal's "ربط الأجهزة" (Device Linking) screen. Stored the
// same way as the bank accounts above (admin-only, in the app's own DB,
// never in the repo), but the secret key is a live API credential rather
// than information meant to be shown to anyone — so unlike the bank
// fields, getJofotaraSettings() masks it for display and the real value is
// only ever read server-side by lib/jofotara.js via getJofotaraSecret().
function maskSecret(secret) {
  if (!secret) return '';
  return secret.length <= 4 ? '••••' : `••••${secret.slice(-4)}`;
}

function getJofotaraSettingsRaw() {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(JOFOTARA_KEY);
  const saved = row ? JSON.parse(row.value) : {};
  return {
    clientId: saved.clientId || process.env.JOFOTARA_CLIENT_ID || '',
    secretKey: saved.secretKey || process.env.JOFOTARA_SECRET_KEY || '',
    incomeSource: saved.incomeSource || process.env.JOFOTARA_INCOME_SOURCE || '',
  };
}

// Safe to send to the browser — secretKey is masked.
function getJofotaraSettings() {
  const raw = getJofotaraSettingsRaw();
  return { ...raw, secretKey: maskSecret(raw.secretKey) };
}

// Server-side only (lib/jofotara.js) — never send this object to a client.
function getJofotaraSecret() {
  return getJofotaraSettingsRaw();
}

function updateJofotaraSettings(partial) {
  const current = getJofotaraSettingsRaw();
  const next = {
    clientId: typeof partial.clientId === 'string' ? partial.clientId.trim() : current.clientId,
    // Blank, or a masked value ("••••1234") coming back from the browser
    // unchanged, means "leave it as is" — only overwrite with a real new value.
    secretKey: typeof partial.secretKey === 'string' && partial.secretKey.trim() && !partial.secretKey.includes('••••')
      ? partial.secretKey.trim() : current.secretKey,
    incomeSource: typeof partial.incomeSource === 'string' ? partial.incomeSource.trim() : current.incomeSource,
  };
  db.prepare(`
    INSERT INTO settings (key, value, updated_at) VALUES (?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
  `).run(JOFOTARA_KEY, JSON.stringify(next));
  return getJofotaraSettings();
}

module.exports = {
  getCompanySettings, updateCompanySettings, bankDetailsFor, BANK_FIELDS,
  getJofotaraSettings, getJofotaraSecret, updateJofotaraSettings,
};
