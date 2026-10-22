const express = require('express');
const multer = require('multer');
const Tesseract = require('tesseract.js');
const { requireLogin } = require('../middleware/auth');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

function guessFields(text) {
  const guesses = {};

  const poMatch = text.match(/\bP\.?\s*O\.?\s*(?:No\.?|Number|#)?\s*[:\-]?\s*([A-Z0-9\-\/]{3,})/i);
  if (poMatch) guesses.po_number = poMatch[1].trim();

  const dateMatch = text.match(/\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/);
  if (dateMatch) guesses.date = dateMatch[1];

  const amountMatch = text.match(/(?:total|amount|grand total)[^\d]{0,10}([\d,]+\.\d{2})/i);
  if (amountMatch) guesses.amount = amountMatch[1].replace(/,/g, '');

  // A line mentioning "client", "to:", "bill to" etc. as a rough client-name guess.
  const clientMatch = text.match(/(?:bill to|client|company)[:\s]+([A-Za-z0-9 &.,\-]{3,60})/i);
  if (clientMatch) guesses.client_name = clientMatch[1].trim();

  return guesses;
}

// Reads a scanned PO image and returns raw text plus best-guess fields.
// The caller (the UI) shows these as editable suggestions — never auto-trusted.
router.post('/po-scan', requireLogin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  try {
    const { data } = await Tesseract.recognize(req.file.buffer, 'eng');
    const text = data.text || '';
    res.json({ text, guesses: guessFields(text) });
  } catch (e) {
    console.error('[ocr] failed:', e);
    res.status(500).json({ error: 'OCR failed — try a clearer scan or enter details manually' });
  }
});

module.exports = router;
