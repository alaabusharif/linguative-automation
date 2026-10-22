---
name: linguative-design
description: ARCHIVED FALLBACK (2026-09-29) — was "use for any Adobe Express visual design for Linguative"; primary design workflow has moved to ChatGPT + Higgsfield + Adobe Express Premium. Bakes in the brand guide, a reusable layout grid, image-sourcing order, and the post-export QA checklist so nothing gets skipped or buried in a long routine prompt.
---

> **ARCHIVED AS FALLBACK/REFERENCE ONLY (2026-09-29, Accelerated Marketing Cutover, Ala).** This skill is no longer the primary creative workflow. The scheduled "Linguative Design" routine that invoked it is disabled — see `migration/chatgpt-handoff-2026-09-29/13-accelerated-cutover-2026-09-29.md`. Primary design workflow is now: ChatGPT strategy/copy/creative direction → real approved assets and/or Higgsfield → Adobe Express Premium → QA → Ala approval → Metricool. This file's exact-logo handling, export-fidelity QA, and technical rendering knowledge are preserved below as reference/fallback — do not invoke it as the default path, and do not regenerate or reinterpret the logo from it or anywhere else.

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

## Post-export QA — do this before calling anything a finished draft

`export_html_to_express` (or `import-claude-design-from-url`) converting
your HTML successfully is not the same as the Express document matching
your HTML. Fidelity issues are real and have shipped before: an element
your HTML clearly included (the logo) came out missing in Express, and
text boxes came out misaligned even though the source HTML was correct.

After exporting, open/preview the **actual resulting Express document**
(not your source HTML) and check, in order:

1. **Logo** — present, correctly placed, correct light/dark variant, not
   distorted.
2. **Text boxes** — right font size and alignment; every box's edges sit
   flush with the intended canvas margins (no box running wider/narrower
   than its neighbors, no unintended overhang).
3. **Overlays** — any gradient/shading has full coverage with no visible
   gap or seam.
4. **Contact line** — present and legible.
5. **Photo** — crisp at the size it's displayed, genuinely matches the
   post's specific content (see above).

If anything fails, fix it and re-check — don't save the draft or notify
Ala until this passes. This step is the actual point of the skill: catch
what the export step silently drops or misplaces, rather than trusting
the HTML that went in.

## After the draft is saved

Send Ala a **sent** email (never a Gmail draft) to `alaabusharif@gmail.com`
with the Express draft link and one line saying it's ready for review.
Never publish, export, or post the design itself — it stays a draft until
Ala explicitly approves it.

If a design's topic conflicts with an active standing directive (e.g. a
rebrand-only posting window), say so in the notification instead of
assuming it's fine to post once approved.
