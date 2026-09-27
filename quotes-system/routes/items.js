const express = require('express');
const db = require('../db/db');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

// Autocomplete catalog: filters as you type; "+" adds new items straight into the list.
router.get('/', requireLogin, (req, res) => {
  const q = (req.query.q || '').trim();
  let rows;
  if (q) {
    rows = db.prepare('SELECT id, name FROM items_catalog WHERE name LIKE ? ORDER BY name LIMIT 20')
      .all(`%${q}%`);
  } else {
    rows = db.prepare('SELECT id, name FROM items_catalog ORDER BY name LIMIT 50').all();
  }
  res.json({ items: rows });
});

router.post('/', requireLogin, (req, res) => {
  const name = (req.body && req.body.name || '').trim();
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    const info = db.prepare('INSERT INTO items_catalog (name) VALUES (?)').run(name);
    res.json({ id: info.lastInsertRowid, name });
  } catch (e) {
    // Already exists — return the existing one instead of erroring.
    const row = db.prepare('SELECT id, name FROM items_catalog WHERE name = ?').get(name);
    res.json(row);
  }
});

module.exports = router;
