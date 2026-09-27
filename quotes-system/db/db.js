const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'quotes.db'));
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff', -- 'admin' (Ala) or 'staff'
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS items_catalog (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  name_ar TEXT, -- native Arabic service name, not a machine translation
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS counters (
  series TEXT PRIMARY KEY, -- e.g. 'Q-2026', 'INV-2026'
  value INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS documents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL, -- 'quote' | 'invoice'
  number TEXT NOT NULL, -- e.g. 'Q-2026-001', stable across amendments
  version INTEGER NOT NULL DEFAULT 1,
  root_id INTEGER, -- id of version 1 of this number; NULL means this row IS the root
  parent_id INTEGER, -- id of the version this amended, if any
  status TEXT NOT NULL DEFAULT 'draft',
    -- draft, pending_approval, approved, sent, amended, cancelled
  payment_status TEXT, -- invoices only: 'unpaid' | 'paid'
  due_date TEXT, -- invoices only
  language TEXT NOT NULL DEFAULT 'en', -- 'en' | 'ar' — which language this document is written/exported in

  client_name TEXT NOT NULL DEFAULT '',
  contact_person TEXT NOT NULL DEFAULT '',
  project_title TEXT NOT NULL DEFAULT '',
  venue TEXT NOT NULL DEFAULT '',
  po_number TEXT,

  currency TEXT NOT NULL DEFAULT 'JOD', -- JOD | USD | EUR
  discount_type TEXT NOT NULL DEFAULT 'flat', -- flat | percent
  discount_value REAL NOT NULL DEFAULT 0,
  tax_type TEXT NOT NULL DEFAULT '16', -- '16' | '0' | 'exempt'
  subtotal REAL NOT NULL DEFAULT 0,
  discount_amount REAL NOT NULL DEFAULT 0,
  tax_amount REAL NOT NULL DEFAULT 0,
  grand_total REAL NOT NULL DEFAULT 0,

  quote_ref_id INTEGER, -- for invoices generated from a quote: the quote document's id
  notes TEXT,

  created_by INTEGER,
  approved_by INTEGER,
  approved_at TEXT,

  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),

  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (approved_by) REFERENCES users(id),
  FOREIGN KEY (quote_ref_id) REFERENCES documents(id)
);

CREATE TABLE IF NOT EXISTS document_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  document_id INTEGER NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  days REAL NOT NULL DEFAULT 1,
  qty REAL NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'Each',
  unit_price REAL NOT NULL DEFAULT 0,
  line_total REAL NOT NULL DEFAULT 0,
  FOREIGN KEY (document_id) REFERENCES documents(id)
);

CREATE INDEX IF NOT EXISTS idx_documents_kind ON documents(kind);
CREATE INDEX IF NOT EXISTS idx_documents_number ON documents(number);
CREATE INDEX IF NOT EXISTS idx_document_items_doc ON document_items(document_id);
`);

// Safe, idempotent migrations for columns added after the tables first existed.
for (const [table, column, ddl] of [
  ['documents', 'language', "ALTER TABLE documents ADD COLUMN language TEXT NOT NULL DEFAULT 'en'"],
  ['items_catalog', 'name_ar', 'ALTER TABLE items_catalog ADD COLUMN name_ar TEXT'],
]) {
  const cols = db.prepare(`PRAGMA table_info(${table})`).all().map((c) => c.name);
  if (!cols.includes(column)) db.exec(ddl);
}

// Seed item catalog once
const itemCount = db.prepare('SELECT COUNT(*) AS c FROM items_catalog').get().c;
if (itemCount === 0) {
  const seedItems = JSON.parse(fs.readFileSync(path.join(__dirname, 'seed-items.json'), 'utf8'));
  const insert = db.prepare('INSERT OR IGNORE INTO items_catalog (name, name_ar) VALUES (?, ?)');
  const insertMany = db.transaction((rows) => { for (const r of rows) insert.run(r.name, r.name_ar || null); });
  insertMany(seedItems);
}

// Bootstrap admin user if no users exist yet
const userCount = db.prepare('SELECT COUNT(*) AS c FROM users').get().c;
if (userCount === 0) {
  const username = process.env.ADMIN_USERNAME || 'ala';
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    console.warn('[quotes-system] No ADMIN_PASSWORD set in .env — skipping admin bootstrap. Set it and restart, or create a user manually.');
  } else {
    const hash = bcrypt.hashSync(password, 10);
    db.prepare('INSERT INTO users (username, password_hash, display_name, role) VALUES (?, ?, ?, ?)')
      .run(username, hash, 'Ala', 'admin');
    console.log(`[quotes-system] Created admin user "${username}". Change the password after first login.`);
  }
}

module.exports = db;
