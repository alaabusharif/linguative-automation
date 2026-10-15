const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const { getCompanySettings, updateCompanySettings } = require('../lib/settings');

const router = express.Router();

// Bank account numbers and the tax ID are sensitive/legal company info, so
// only an admin (Ala) can view or change them — not every staff login.
router.get('/', requireAdmin, (req, res) => {
  res.json({ settings: getCompanySettings() });
});

router.put('/', requireAdmin, (req, res) => {
  const settings = updateCompanySettings(req.body || {});
  res.json({ settings });
});

module.exports = router;
