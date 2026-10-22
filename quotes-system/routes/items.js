const express = require('express');
const db = require('../db/db');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

// Autocomplete catalog: filters as you type; "+" adds new items straight into the list.
// Matches against both the English and Arabic names, so an Arabic-language
// document can search by the Arabic term directly.
router.get('/', requireLogin, (req, res) => {
  const q = (req.query.q || '').trim();
  let rows;
  if (q) {
    rows = db.prepare('SELECT id, name, name_ar FROM items_catalog WHERE name LIKE ? OR name_ar LIKE ? ORDER BY name LIMIT 20')
      .all(`%${q}%`, `%${q}%`);
  } else {
    rows = db.prepare('SELECT id, name, name_ar FROM items_catalog ORDER BY name LIMIT 50').all();
  }
  res.json({ items: rows });
});

router.post('/', requireLogin, (req, res) => {
  const name = (req.body && req.body.name || '').trim();
  const nameAr = (req.body && req.body.name_ar || '').trim() || null;
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    const info = db.prepare('INSERT INTO items_catalog (name, name_ar) VALUES (?, ?)').run(name, nameAr);
    res.json({ id: info.lastInsertRowid, name, name_ar: nameAr });
  } catch (e) {
    // Already exists — return the existing one instead of erroring.
    const row = db.prepare('SELECT id, name, name_ar FROM items_catalog WHERE name = ?').get(name);
    res.json(row);
  }
});

module.exports = router;
