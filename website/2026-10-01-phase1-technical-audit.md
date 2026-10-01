# Linguative Website — Phase 1 Technical Audit (live-site read-only pass)

2026-10-01. First real look at the live site, done once Ala widened this session's network access. Read-only HTTP fetch only — no WordPress admin, FTP/SSH, or GA4/Search Console access yet, so this is what's externally visible, not a full plugin/database audit. No client or project names in this file — see the private preservation inventory in `/mnt/project-files/website/` for those.

## Platform (confirmed, not assumed)

- **WordPress**, theme `hello-elementor`, built with **Elementor 3.27.6 + Elementor Pro** (not Bricks — this is a genuine rebuild of the builder, not a reskin). Yoast SEO v24.6 is the SEO plugin in use (generates the sitemap and the structured-data graph).
- Server: nginx 1.30.5, PHP 8.2.27 — consistent with the AxenCloud/FastPanel hosting on record.
- No multilingual plugin footprint detected (no hreflang tags anywhere checked) — consistent with the earlier confirmation that WPML/Polylang isn't installed.

## Critical finding: structured data names the wrong organization

The Yoast-generated JSON-LD `Organization` entity (present on every page, referenced by the whole schema graph) has:

```
"name": "Avvio Agency"
```

not Linguative. This is what Google and any AI/GEO system currently reads as the business's canonical name wherever this structured data is parsed. Matches a second signal: some images (e.g. the Certified Translation page's hero) are still served from an external `avvioco.com` domain rather than linguative.net itself — strongly suggesting the site was originally built by a web agency ("Avvio") and the demo/template identity was never fully replaced with Linguative's own. This is a Phase 8/18 entity-consistency bug, not a cosmetic one — it directly undermines the "machine-readable business information" objective. Fix: correct the Organization entity name/`@id` and migrate all externally-hosted media onto linguative.net's own storage as part of the rebuild.

## Critical finding: no GA4/GTM tag detected anywhere checked

Checked the homepage, `/services/`, and `/services/certified-translation/` for any `gtag(`, `googletagmanager.com`, a `G-XXXXXXX` or `GTM-XXXX` id, and any Cloudflare Zaraz/beacon script — none found on any of the three. The site isn't behind Cloudflare's proxy either (no `CF-RAY` header), so there's no server-side tag-injection layer that could be hiding it. Working hypothesis for Phase 6: **GA4 was likely never actually installed on the front end**, not a consent-mode or blocking issue — which would fully explain "zero GA4 activity despite Search Console impressions" (Search Console only needs sitemap submission/verification, not a firing script). This needs confirming via the GA4 admin itself once Ala grants viewer access, but it's the most likely root cause.

## Stale/template content (Phase 7 — found, not assumed)

- Homepage: *"Discover how our tailored solar solutions can meet your needs."* and *"We work with top industry partners to bring the latest solar technologies to our clients."* — solar-energy demo copy, completely unrelated to the business, visible to every homepage visitor. Matches the brief's own named example exactly.
- Homepage: the default WordPress **"Hello world!"** post is not just sitting unused — it's actively pulled into a homepage blog-feed widget, so it's visible site-wide, not just at its own URL.
- `/services/`: a CTA heading reads *"Free Consultation If You Want Build New Project With Us"* — ungrammatical, generic page-builder demo copy, not in Linguative's voice.

## On-page SEO issues (Phase 15)

- `/services/` has **zero `<h1>` elements** — only `<h2>`s ("Our Services", "Our Professional services"). This matches the brief's own pre-identified list of pages needing H1 attention.
- Homepage title/meta description position the company as *"Expert Translation & Event Management Services"* — undersells interpretation/AV/conference-technology and runs against the standing "never present Linguative as just a translation agency" rule. Needs a Phase 9 rewrite.
- `/request-a-qoute/` — existing live URL has a typo in the slug ("qoute"). A fix needs a proper 301 per the brief's redirect discipline, not a silent rename.
- The XML sitemap and the homepage's `og:image` both reference `http://` (not `https://`) URLs despite the site serving over HTTPS with HSTS enabled — a protocol-consistency cleanup item for Phase 29.

## Content-accuracy flag (Phase 10 — needs Ala's input, not a unilateral rewrite)

`/services/certified-translation/` makes specific authority claims: body copy states translations are *"recognized by"* and *"approved by ministries, officials, courts, and le[gal bodies]"* (text cut off in the on-page extract — full page not yet read in detail). This is exactly the kind of claim Phase 10 says to rewrite conservatively rather than strengthen, and to flag for review rather than resolve silently — raising it on the decision list rather than editing it now.

## Live information architecture vs. the planned rebuild

The live site currently has **6 service pages** (logistical support, multimedia translation/interpretation solutions, certified translation, editing/proofreading, AV equipment services, event & conference management) — not the 9-page structure in `2026-10-01-site-architecture.md`. That plan is a genuine expansion, not a like-for-like rebuild; reconciling the 6 real live URLs against the 9 planned ones (what merges, what's net-new, what needs a 301) is real work for the redirect-plan template before build starts.

## Still open (needs credentials this read-only pass can't get)

- Full plugin list, theme child/overrides, and any server-side config (needs WP admin or the backup).
- Confirming the GA4 hypothesis above (needs GA4 admin access).
- Full media library (a static crawl only sees linked images, not everything that exists — needs the backup).
- Forms (Request a Quote, Contact) — validation, spam protection, and actual submission routing can't be tested without submitting live, which the brief explicitly forbids without Ala's permission.
