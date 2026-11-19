// Minimal right-to-left text layout for pdfkit.
//
// pdfkit/fontkit shape Arabic correctly (letters join, isolated/initial/
// medial/final forms) when fed a run of Arabic-only text, but when Arabic
// and Latin/digits are mixed in one .text() call it reverses the whole
// character buffer — including embedded numbers/PO codes, which Ala wants
// left exactly as written. So we split each line into script runs, keep
// each run's own character order untouched, and only reverse the ORDER of
// the runs (how an RTL line arranges its LTR "islands"). Each run is then
// handed to pdfkit on its own, so Arabic runs still get pdfkit's own
// correct shaping, and LTR runs are never touched.
const ARABIC_RE = /[؀-ۿݐ-ݿ]/;

// pdfkit doesn't mirror paired brackets for RTL text. A "(...)" whose
// contents are Arabic needs its bracket glyphs swapped so the shape that
// ends up on the visual-opening side is the one that looks like "(".
// A pair that wraps plain Latin/numbers (e.g. a "(200-300)" range) is left
// alone — that content reads left-to-right on its own and is unaffected.
function mirrorArabicParens(text) {
  return String(text).replace(/\(([^()]*)\)/g, (m, inner) => (ARABIC_RE.test(inner) ? `)${inner}(` : m));
}

function splitRuns(text) {
  const runs = [];
  let cur = '';
  let curType = null;
  for (const ch of String(text)) {
    const type = ARABIC_RE.test(ch) ? 'ar' : 'other';
    if (curType === null) {
      curType = type;
      cur = ch;
    } else if (type === curType) {
      cur += ch;
    } else {
      runs.push({ type: curType, text: cur });
      cur = ch;
      curType = type;
    }
  }
  if (cur) runs.push({ type: curType, text: cur });
  return runs.map((r) => ({ ...r, text: r.text.trim() })).filter((r) => r.text.length);
}

// Width of a bidi line as pdfkit would render it (runs joined with a space).
function bidiLineWidth(doc, text) {
  const runs = splitRuns(text);
  if (!runs.length) return 0;
  return runs.reduce((w, r, i) => w + doc.widthOfString(r.text) + (i > 0 ? doc.widthOfString(' ') : 0), 0);
}

// Draws one right-to-left line at (x, y), right-aligned within `width`.
//
// pdfkit's `lineBreak: false` (needed so a run never gets re-wrapped out
// from under our own manual run-ordering) also means pdfkit never advances
// `doc.y` for this line on its own — callers that go on to use `pdf.y`
// (directly, or via `pdf.moveDown()`) must account for this line's own
// height themselves. See the heading-to-content gaps in lib/pdf.js's
// Arabic renderer for where that's done.
function drawBidiLine(doc, text, x, y, width, opts = {}) {
  const runs = splitRuns(mirrorArabicParens(text)).reverse();
  if (!runs.length) return;
  const lineWidth = bidiLineWidth(doc, text);
  const startX = width != null ? x + Math.max(0, width - lineWidth) : x;
  runs.forEach((r, i) => {
    const isLast = i === runs.length - 1;
    const segment = isLast ? r.text : `${r.text} `;
    if (i === 0) doc.text(segment, startX, y, { continued: !isLast, lineBreak: false, ...opts });
    else doc.text(segment, { continued: !isLast, lineBreak: false, ...opts });
  });
}

// Greedily wraps `text` into lines that each fit within `width`, breaking
// on whitespace only (simple word-wrap — good enough for item descriptions,
// which are plain sentences, not justified typography). A single word
// wider than `width` on its own is kept whole rather than broken mid-word.
function wrapBidiLines(doc, text, width) {
  const words = String(text).split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const lines = [];
  let current = words[0];
  for (let i = 1; i < words.length; i++) {
    const candidate = `${current} ${words[i]}`;
    if (bidiLineWidth(doc, candidate) <= width) {
      current = candidate;
    } else {
      lines.push(current);
      current = words[i];
    }
  }
  lines.push(current);
  return lines;
}

// Draws a right-to-left block of text, word-wrapped to fit `width`, at
// (x, y), right-aligned within `width`. Returns the total height drawn so
// the caller can size a row/background to match (unlike drawBidiLine,
// which only ever draws one line and leaves overflow text run off the
// page — see lib/pdf.js's Arabic item table, which previously called
// drawBidiLine directly on item descriptions with no wrapping at all).
function drawBidiWrapped(doc, text, x, y, width, opts = {}) {
  const lineHeight = opts.lineGap ? doc.currentLineHeight() + opts.lineGap : doc.currentLineHeight();
  const lines = wrapBidiLines(doc, text, width);
  lines.forEach((line, i) => drawBidiLine(doc, line, x, y + i * lineHeight, width, opts));
  return lines.length * lineHeight;
}

module.exports = { splitRuns, drawBidiLine, drawBidiWrapped, wrapBidiLines, bidiLineWidth, ARABIC_RE };
