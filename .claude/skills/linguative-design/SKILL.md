---
name: linguative-design
description: Use for any Adobe Express visual design for Linguative — LinkedIn/Facebook/GBP social graphics, flyers, or similar fixed-canvas posts. Bakes in the brand guide, a reusable layout grid, image-sourcing order, and the post-export QA checklist so nothing gets skipped or buried in a long routine prompt.
---

# Linguative design

Built 2026-09-28 after the "Behind the Scenes" LinkedIn design shipped with
the logo missing, misaligned title/body textboxes, a gap in the photo's
shading overlay, and no contact info — none of it caught because the
routine only reasoned about its own source HTML, never the actual
Adobe Express document that came out of it. This skill exists so brand
rules and the QA step travel with the design work itself, not just a
trigger prompt that's easy to half-follow.

Read `marketing/brand/BRAND.md` in this repo first, every time — it's the
authoritative source and can change. What follows here is the operational
layer on top of it: how to build the design and how to check it actually
worked.

## Non-negotiables (from BRAND.md — restated here because they're the ones
most often missed)

- Logo: place `marketing/brand/logos/logo-navy-gold-light-bg.png` on light
  backgrounds, `marketing/brand/logos/logo-white-gold-dark-bg.png` on dark
  ones. Never redraw, retype, regenerate, or modify it. Never publish
  without it.
- Colors: Deep Navy `#071A2E`, Champagne Gold `#C9A46A`, Warm Ivory
  `#F8F5F0`, Charcoal `#2B2B2B` (support: Gold Highlight `#E5C79A`, Gold
  Shadow `#8E6537`). Use the exact hex values, not an approximation.
  Dominant system: Deep Navy + Champagne Gold + Warm Ivory.
- Fonts: Futura PT (headings/labels), Acumin Pro (body), Cormorant
  Garamond Semibold Italic (rare accents only). Fallbacks: Montserrat,
  Source Sans 3, Georgia.
- Tagline, exact: **COMMUNICATION BEYOND LANGUAGE.**
- Contact line: every design includes a way to actually reach Linguative —
  `linguative.net` and `info@linguative.net` at minimum, placed near the
  logo/tagline. A design with no way to follow up is incomplete, whatever
  else it gets right.
- Equipment: never name or visibly show any AV/interpretation equipment
  brand other than Bosch DICENTIS or Bosch INTEGRUS. Describe other gear
  generically.
- Never state or imply work is done via freelancers/subcontractors.
  Arabic company name is always الإبداع اللغوي (masculine agreement) —
  never لينقواتيف.

## Layout grid (LinkedIn / social vertical post, 1080×1350)

The pattern that's worked well as a starting point — adjust per post, but
this is a solid default rather than starting from a blank page each time:

1. **Photo block** — full-bleed photo, roughly the top 55–60% of the
   canvas (≈0–760px of 1350).
2. **Scrim** — navy gradient over the bottom of the photo, fading from
   transparent to solid `#071A2E`, so text over it stays legible. Make
   sure the scrim's own box has **no gap** between it and the solid-color
   content block below — they should read as one continuous field, not
   two overlapping rectangles with a visible seam.
3. **Gold rule** — a thin `#C9A46A` line marking the photo/content seam.
4. **Content block** (≈760–1200px) — eyebrow (Futura PT Bold, gold,
   letter-spaced caps) → headline (Futura PT, Warm Ivory, large) → body
   copy (Acumin Pro, light gray `#D8DCE2`). Keep every text box's edges
   flush with the same left/right margin as the canvas — don't let one
   box run wider or narrower than the others.
5. **Footer** (≈1200–1350px) — thin gold divider, then logo (left) with
   tagline directly under it as one lockup, and the contact line
   (website + email) right-aligned on the same row.

Other formats (Facebook, GBP, square posts) follow the same hierarchy —
photo, scrim, eyebrow/headline/body, footer with logo+tagline+contact —
adapted to the canvas's own proportions.

## Image sourcing order

1. Ala's own real photos/video first — his Adobe Express library and his
   Google Drive (`linguativ@gmail.com`), which holds real event/conference
   footage. Search both for this post's specific topic before anything
   else.
2. Images already published on linguative.net, only if genuinely strong —
   flag it in your summary for Ala's approval, never use it silently.
3. Adobe Stock — premium, realistic, documentary-feeling, per BRAND.md's
   photography section. Not generic corporate-stock clichés.
4. AI-generated (Firefly), only if nothing above fits, and only if it
   reads as credible, real equipment — never obviously AI-looking
   conference tech.

Whatever the source, two things are non-negotiable:

- **Resolution.** The embedded photo must be full-resolution/crisp. If an
  upload or network issue would force a compressed version, don't ship
  it — retry, pick a different image, or say so as a blocker. A soft or
  blurry photo is not an acceptable draft.
- **Relevance.** The photo has to represent the post's *specific* claim or
  moment, not just be generically on-topic. If the copy is about, say,
  cable runs being tested twice, the photo should visibly show that kind
  of moment — not just "a conference room" or "a microphone."

State which source was used and why in every summary to Ala.

## Known export bug — images can silently fail to render (2026-09-28)

`export_html_to_express` has shipped designs with the photo and/or logo
completely missing — not just misaligned, entirely blank canvas where the
image should be — while the tool call itself returns success and the
returned HzHTML looks correct. Root cause, fully isolated: **the importer
only fetches images from a small Adobe-owned domain whitelist. Any other
source silently becomes a blank placeholder — it never errors.**
Confirmed directly:

- An external `<img src="https://...">` URL on a non-Adobe domain (tried:
  GitHub raw, and even Adobe Stock's own public CDN `*.ftcdn.net`), even
  one verified reachable, gets silently replaced with a 1×1 transparent
  placeholder.
- A base64 `data:` URI is **not a workaround** — a bare `<img>` tag with
  a base64 source still renders blank; base64 as a CSS
  `background-image` fails the export call outright.
- `image_crop_and_resize` (and presumably the other Adobe image-editing
  tools) enforce the same whitelist explicitly, erroring with "URL domain
  not whitelisted" for GitHub raw, Google Drive, jsDelivr, and Unsplash —
  confirming this is a deliberate, hard boundary, not a fetch bug.
- **What does work:** a URL already on Adobe's own storage. Licensing an
  Adobe Stock asset (`asset_license_and_download_stock`, even the free
  tier) returns a presigned URL on Adobe's own blobstore, and embedding
  that URL renders correctly — verified end to end with
  `asset_inline_preview`. Likewise, any asset already sitting in the
  user's Creative Cloud storage (`asset_search` with `entityScope:
  CCAsset`) has a working `renditionURL`/`downloadURL` on Adobe's domain.
- Getting your **own** image (Ala's real event photos, the locked logo
  files) onto that trusted storage from this environment is currently
  blocked: direct block-upload (`asset_initialize_file_upload` + chunk
  PUT) redirects to `acp-...-blobstore-...adobe.io`, which this
  environment's network policy denies (confirmed twice, same result).
  `asset_add_file` needs a human picking a file in the Express UI, which
  isn't available headlessly.

**Practical implication:** Adobe Stock photos (licensed first) are fully
usable — prefer them over anything else when a real event photo can't be
sourced this way. For the logo and any other file that must be Ala's
own real asset, the only currently-working path is for **Ala to upload
it once** into his Adobe Express / Creative Cloud files himself (drag a
file into Express's "Your files" — takes seconds); after that, it shows
up via `asset_search` (`entityScope: CCAsset`) with a working URL like
any other CC-hosted asset, and the automation can reference it going
forward without needing this workaround again per post.

There is no other known-reliable way to guarantee a non-Adobe image
lands in the exported Express document from this environment as of
2026-09-28. Treat every export as unverified until you have actually
looked at it (next section) — never assume an image "should" be there
because the source HTML or the tool's success response says so.

## Post-export QA — do this before calling anything a finished draft

`export_html_to_express` (or `import-claude-design-from-url`) converting
your HTML successfully is not the same as the Express document matching
your HTML. Fidelity issues are real and have shipped before: an element
your HTML clearly included (the logo) came out missing in Express, and
text boxes came out misaligned even though the source HTML was correct.

After exporting, open/preview the **actual resulting Express document**
(not your source HTML, not the tool's returned HzHTML) using
`asset_search` (entityScope CCAsset, by the doc name) to get its
`renditionURL`, then `asset_inline_preview` on that URL, and look at the
real pixels. Check, in order:

1. **Logo** — present, correctly placed, correct light/dark variant, not
   distorted. A blank area, a 1×1/near-invisible speck, or solid
   background color where the logo should be is an automatic fail —
   never report this as passed.
2. **Text boxes** — right font size and alignment; every box's edges sit
   flush with the intended canvas margins (no box running wider/narrower
   than its neighbors, no unintended overhang).
3. **Overlays** — any gradient/shading has full coverage with no visible
   gap or seam.
4. **Contact line** — present and legible.
5. **Photo** — crisp at the size it's displayed, genuinely matches the
   post's specific content (see above). Same automatic-fail rule as the
   logo: a blank/placeholder area is a fail, full stop, regardless of
   what the export call returned.

A QA pass must be based on this actual visual check, never on the
source HTML being correct, the tool call succeeding, or the returned
HzHTML containing the right `src`/`url` values — all three of those have
been true while the real document still shipped blank. If any check
fails, fix it and re-check — don't save the draft, don't tell Ala it
passed, and don't notify him for approval until this passes for real. If
you cannot get a check to pass after a reasonable retry (per the known
export bug above), report it as a blocker instead of reporting a false
pass — never claim "N/N checks passed" without having actually looked at
the rendered output for each one.

## After the draft is saved

Send Ala a **sent** email (never a Gmail draft) to `alaabusharif@gmail.com`
with the Express draft link and one line saying it's ready for review.
Never publish, export, or post the design itself — it stays a draft until
Ala explicitly approves it.

If a design's topic conflicts with an active standing directive (e.g. a
rebrand-only posting window), say so in the notification instead of
assuming it's fine to post once approved.
