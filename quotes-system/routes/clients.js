const express = require('express');
const db = require('../db/db');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();

// Autocomplete: filters as you type; "+" adds a new client straight into the list.
router.get('/', requireLogin, (req, res) => {
  const q = (req.query.q || '').trim();
  let rows;
  if (q) {
    rows = db.prepare('SELECT id, name, contact_person, notes FROM clients WHERE name LIKE ? ORDER BY name LIMIT 20')
      .all(`%${q}%`);
  } else {
    rows = db.prepare('SELECT id, name, contact_person, notes FROM clients ORDER BY name LIMIT 50').all();
  }
  res.json({ clients: rows });
});

router.post('/', requireLogin, (req, res) => {
  const name = (req.body && req.body.name || '').trim();
  const contactPerson = (req.body && req.body.contact_person || '').trim() || null;
  const notes = (req.body && req.body.notes || '').trim() || null;
  if (!name) return res.status(400).json({ error: 'name required' });
  try {
    const info = db.prepare('INSERT INTO clients (name, contact_person, notes) VALUES (?, ?, ?)').run(name, contactPerson, notes);
    res.json({ id: info.lastInsertRowid, name, contact_person: contactPerson, notes });
  } catch (e) {
    // Already exists — return the existing one instead of erroring.
    const row = db.prepare('SELECT id, name, contact_person, notes FROM clients WHERE name = ?').get(name);
    res.json(row);
  }
});

module.exports = router;
