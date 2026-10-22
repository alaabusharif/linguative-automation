# Linguative Website — Site Architecture (post 37-phase brief)

2026-10-01. Reconciles the locked 2026-09-23 sitemap (`/mnt/project-files/website/2026-09-23-sitemap-and-seo-geo-plan.md`, content already drafted and approved in 8 batches) with Ala's full 37-phase technical brief, Phase 11 ("Site architecture") in particular. No client names, media inventory, or live-URL facts — those belong in `/mnt/project-files/website/` once the backup/audit is done.

## 1. Working principle

The brief's Phase 11 outline is explicitly directional, not literal: "Do not automatically create thin pages merely to satisfy this outline. Reuse or consolidate strong existing pages where appropriate." The 2026-09-23 sitemap is already-approved, already-written content. This document keeps that structure as the baseline and folds in the brief's additions rather than replacing it.

## 2. Final information architecture

1. **Home**
2. **Services** (hub + 9 individual pages — unchanged from the locked 2026-09-23 batch)
   - Translation Services
   - Transcription Services
   - Simultaneous Interpretation
   - Consecutive Interpretation
   - Conference Interpretation Equipment Rental *(carries the Bosch DICENTIS / Bosch INTEGRUS capability proof content — see note below)*
   - Conference Technology & AV
   - Hybrid & Virtual Conference Solutions
   - Event & Conference Management
   - Video Production & Subtitling
3. **Industries / Who We Serve** — one page, multiple sections (per the 2026-09-23 recommendation, still sound)
4. **Case Studies / Our Work**
5. **About Linguative**
6. **Insights / Resources**
7. **Request a Quote**
8. **Contact**

**Reconciliation note on Bosch DICENTIS / INTEGRUS:** the brief's Phase 11 outline lists these as if they were separate pages. The 2026-09-23 architecture already treats them correctly — as named proof points *within* the Conference Interpretation Equipment Rental page, not standalone pages, which avoids two thin pages about a product line rather than a service. This is a "reuse the stronger existing structure" call per the brief's own working method, not a deviation from it. Revisit only if the live-site audit shows meaningful organic search demand for DICENTIS/INTEGRUS as standalone terms.

**Reconciliation note on "AV Solutions" vs. "Conference Technology & AV":** same service, existing name kept — no reason to rename an already-written, SEO-considered page title without evidence it underperforms.

## 3. URL structure

`linguative.net/...` (English), `linguative.net/ar/...` (Arabic) — subdirectory, not subdomain, per Ala's existing preference. Every EN page keeps a 1:1 AR counterpart at the same path. WPML/Polylang status is still unconfirmed on the live install (flagged 2026-09-23, never resolved) — first thing to verify once the backup/audit happens, since it gates whether `/ar/...` can go live at all.

## 4. What changes once the real site is audited

This architecture assumes the locked content batches become the new IA. Two things can only be settled with the actual backup in hand:

- **Existing indexed URLs.** If the live site's current URLs differ from this structure, Phase 11's redirect discipline applies (confirm necessity → 301 → update internal links/canonicals/sitemap) rather than silently changing paths. See `2026-10-01-redirect-plan-template.md`.
- **Content currently live that isn't in the 9-page batch.** The brief's Phase 2 preservation mandate means anything authentic already on the site (client proof, project pages, media) gets inventoried and folded into this architecture, not discarded for not matching the planned IA.

## 5. Cross-linking map (Phase 13)

Baseline relationships to build into navigation/related-content modules once pages exist in Bricks:

- Simultaneous Interpretation ↔ Conference Interpretation Equipment Rental ↔ Conference Technology & AV
- Consecutive Interpretation ↔ Simultaneous Interpretation (comparison/decision content, per the existing GEO plan's "which should an event use" topic)
- Event & Conference Management ↔ Conference Technology & AV ↔ Hybrid & Virtual Conference Solutions
- Case Studies ↔ the specific services/equipment each case study used
- Industries ↔ the services most relevant to each named industry segment

## 6. Structured data entity map (Phase 24, architecture-level)

One `Organization` entity (not `ProfessionalService` — per Ala's 2026-09-23 instruction) at a persistent `@id`, referenced by every page rather than redefined. `Service` schema on each of the 9 service pages pointing `provider` at the org `@id`. `BreadcrumbList` on everything below Home. `Article` on Insights posts. Full detail stays in the SEO/GEO implementation doc once the live-site audit confirms current structured data (if any) to avoid duplicating or conflicting with what's already there.
