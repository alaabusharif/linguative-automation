const express = require('express');
const { requireAdmin } = require('../middleware/auth');
const { getCompanySettings, updateCompanySettings, getJofotaraSettings, updateJofotaraSettings } = require('../lib/settings');

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

// JoFotara (Jordan e-invoicing) credentials — same admin-only rule, kept
// separate from company settings since this is a live API credential, not
// company info. getJofotaraSettings() masks the secret key before it ever
// leaves the server.
router.get('/jofotara', requireAdmin, (req, res) => {
  res.json({ settings: getJofotaraSettings() });
});

router.put('/jofotara', requireAdmin, (req, res) => {
  const settings = updateJofotaraSettings(req.body || {});
  res.json({ settings });
});

module.exports = router;
