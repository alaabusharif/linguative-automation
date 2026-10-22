const db = require('../db/db');

// Sequential numbering per kind and year, e.g. Q-2026-001, INV-2026-001.
// Separate series per kind as required.
function nextNumber(kind) {
  const prefix = kind === 'invoice' ? 'INV' : 'Q';
  const year = new Date().getFullYear();
  const series = `${prefix}-${year}`;

  const tx = db.transaction(() => {
    const row = db.prepare('SELECT value FROM counters WHERE series = ?').get(series);
    const next = (row ? row.value : 0) + 1;
    if (row) {
      db.prepare('UPDATE counters SET value = ? WHERE series = ?').run(next, series);
    } else {
      db.prepare('INSERT INTO counters (series, value) VALUES (?, ?)').run(series, next);
    }
    return next;
  });

  const n = tx();
  return `${series}-${String(n).padStart(3, '0')}`;
}

module.exports = { nextNumber };
