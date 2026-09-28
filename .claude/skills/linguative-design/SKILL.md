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

**Practical implication, refined 2026-09-28 (second round):** the
importer's trust is narrower than "any Adobe domain." Confirmed by direct
test: even a real file already sitting in the user's own Creative Cloud
"Your files" — the actual locked logo, uploaded by Ala himself — still
came out blank when referenced by its `asset_search`/`asset_get_presigned_urls`
URL (an `at.adobe.com` short link), and running it through
`image_crop_and_resize` first (to get a same-pixels passthrough) and
using *that* output URL (`photoshop-api.adobe.io/...`) also came out
blank. The only URL pattern confirmed to actually work is a raw
S3-presigned URL from Adobe's own Stock-licensing flow
(`asset_license_and_download_stock`) — everything else, including other
Adobe-domain URLs, is untrusted by this specific import path.

**So, concretely, per asset type:**
- **Stock photos:** fully automatable — license first, embed the
  returned S3 URL. Use freely.
- **The logo (and anything else that needs to be exact, unmodified):
  SOLVED 2026-09-28, use this — don't ask Ala to drag it in by hand.**
  Duplicate an existing Express document that already has the real
  logo placed in it (`asset_copy_assets` with that doc's id as
  `sourceIds`), then call `fill_text` on the **copy's** URN to replace
  only the eyebrow/headline/body text (and, if needed, other editable
  fields) with the new post's copy. This preserves every non-text
  element from the source doc byte-for-byte — logo included — because
  nothing about the logo ever goes through the broken image-fetch path.
  Verified end to end: copied the Sept 24 "Behind the Scenes" doc
  (`urn:aaid:sc:AP:035f50ab-0894-486e-b8e2-85756ab404d5`, which has the
  real logo placed by Ala), ran `fill_text` on the copy with new
  rebrand copy, and the resulting document had the correct new text
  *and* the real logo, verified with `asset_inline_preview` on the
  `fill_text` response's own `previewUrl` (which is itself already a
  working S3 blobstore URL — no extra step needed to check it).
  **Keep at least one Express doc with the real logo correctly placed
  as a standing "logo template"** (the Sept 24 doc works today; if it's
  ever deleted or the logo ever needs to change, make a fresh one — a
  quick manual placement, once — and note its doc id here) and start
  every future post as a copy of it rather than a from-scratch
  `export_html_to_express` call. `fill_text` only replaces text, not
  photos or background, so still source and place the post's photo
  separately (Stock licensing works fine for that, per above); a
  from-scratch build is still fine for the copy/layout/photo, just
  route the *logo specifically* through this copy-and-fill-text path
  instead of trying to embed the logo file directly.
  **Hard limit, confirmed 2026-09-28: `fill_text` only replaces text.**
  It cannot swap the photo/background on a document it's applied to.
  So a document produced this way keeps whichever photo the *source*
  doc (the one you copied) already had — you cannot give it a new,
  sharper, or more relevant photo through this path. If the post needs
  both the real logo *and* a different/better photo than whatever the
  logo-template doc already has, that combination currently has no
  automated route: either accept the template doc's existing photo, or
  ask Ala to swap the photo inside Express himself (a real, one-time
  manual step — say so plainly, don't imply it's close to solved). Also
  confirmed: the exported JPEG's pixel dimensions match the canvas
  (e.g. 1080×1350) — there's no separate "higher quality" render to
  fetch instead; if a photo still reads as soft/low quality, the fix is
  swapping to a sharper source image, not re-exporting the same doc.

- **Ala's own real event photos specifically** (not the logo — that's
  solved above): there is still no confirmed automated path to embed
  one directly, even once it's sitting in Ala's own Creative Cloud
  files — same eight now-confirmed-failing paths as the logo hit
  (external URL, base64 `<img>`, base64 CSS background, Stock's own
  public CDN rendition URL, direct block-upload, `at.adobe.com`
  renditionURL, `asset_get_presigned_urls` output, `image_crop_and_resize`
  output URL). The copy-and-`fill_text` trick doesn't help here since
  `fill_text` only touches text, not photos. Until a working path is
  found for arbitrary photos too, prefer a real Adobe Stock photo
  (fully automatable, per above) over asking Ala to place his own photo
  by hand — reserve asking him for cases where only his specific photo
  will do and say plainly it's a one-time manual step for that post.

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

## Preferred path: render locally, skip Express entirely

Given everything documented above (the image-fetch whitelist, `fill_text`
being text-only, Express links sometimes showing stale/blank to Ala even
when this session's own checks pass — likely an Adobe-account mismatch
between this connector and Ala's own login), **the default path for a new
design is now to render it locally, not to go through Express at all**:

1. Write the design as a self-contained HTML file (same brand-compliant
   HTML you'd otherwise send to `export_html_to_express`), referencing the
   real logo file directly from `marketing/brand/logos/` via a `file://`
   path (or an embedded `<img>` pointing at a local copy) — never a
   base64 data URI or a remote URL, both are unnecessary here since
   nothing goes through Adobe's importer.
2. Fonts: Futura PT / Acumin Pro aren't installed locally and aren't on
   Google Fonts. `@import` the fallback stack from BRAND.md instead
   (Montserrat for headings, Source Sans 3 for body) via
   `fonts.googleapis.com` — confirmed reachable through the proxy.
3. Render with Playwright + the pre-installed Chromium
   (`/opt/pw-browsers/chromium-*/chrome-linux/chrome`, launched with
   `--no-sandbox`; the python `playwright` package needs
   `pip install playwright` once, but the browser binary is already
   there — don't run `playwright install`, it will look for a
   different revision and fail). Use `device_scale_factor=2` (or higher)
   for crisp export resolution well beyond canvas size.
4. Visually inspect the actual PNG with the Read tool before sending
   anything to Ala — same non-negotiable rule as the Express QA checklist
   below: only trust pixels you looked at.

This sidesteps the whitelist bug, the text-only `fill_text` limit, and the
account-mismatch delivery problem all at once, at the cost of losing
in-Express editability — acceptable for a finished social image, not for
anything Ala needs to open and tweak himself in Express. If Ala wants an
editable Express doc specifically, say so and fall back to the
`export_html_to_express` path with its known limits documented above.

For photography: check Ala's Google Drive first per
[[linguative-image-sourcing-priority]], but a Drive photo from an event is
often a *client's* event with the client's own branding visible on
screens/signage — never put a client's branding in a public post without
Ala's OK (per project memory). When no safe photo is available, lean into
BRAND.md's own design language (generous negative space, strong
typography, one dominant idea, thin gold rules) rather than reaching for
generic stock — this is documented to work (the Sept 27 identity-reveal
post shipped this way, no photo, and was accepted).

## After the draft is saved

Send Ala a **sent** email (never a Gmail draft) to `alaabusharif@gmail.com`
with the Express draft link and one line saying it's ready for review.
Never publish, export, or post the design itself — it stays a draft until
Ala explicitly approves it.

If a design's topic conflicts with an active standing directive (e.g. a
rebrand-only posting window), say so in the notification instead of
assuming it's fine to post once approved.
