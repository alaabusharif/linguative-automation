const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../db/db');
const { requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Only Ala (admin) can create/manage other users' credentials.
router.get('/', requireAdmin, (req, res) => {
  const users = db.prepare('SELECT id, username, display_name, role, created_at FROM users ORDER BY created_at').all();
  res.json({ users });
});

router.post('/', requireAdmin, (req, res) => {
  const { username, password, display_name, role } = req.body || {};
  if (!username || !password || !display_name) return res.status(400).json({ error: 'username, password, display_name required' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
  const hash = bcrypt.hashSync(password, 10);
  try {
    const info = db.prepare('INSERT INTO users (username, password_hash, display_name, role) VALUES (?, ?, ?, ?)')
      .run(username, hash, display_name, role === 'admin' ? 'admin' : 'staff');
    res.json({ id: info.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ error: 'Username already exists' });
  }
});

router.delete('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  if (id === req.session.user.id) return res.status(400).json({ error: "Can't remove your own account" });
  db.prepare('DELETE FROM users WHERE id = ?').run(id);
  res.json({ ok: true });
});

module.exports = router;
