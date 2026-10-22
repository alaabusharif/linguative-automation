# Linguative Website — Migration Plan & Working Method

2026-10-01. Formalizes the workflow Ala approved for the technical rebuild (37-phase brief, delivered in full in the project chat 2026-10-01 13:07 UTC). This is the operating plan, not the audit itself — the audit, preservation inventories, and any client-identifying content stay in `/mnt/project-files/website/`, never in this public repo.

## 1. Platform decision (locked, not open for reconsideration)

WordPress + Bricks Builder, staying on the existing AxenCloud hosting. No Webflow or WordPress.com migration. Elementor only if a concrete technical reason rules out Bricks for something specific — not a default fallback. Figma is optional and must never block progress; the visual system is designed and built directly in Bricks using global styles/components/sections/templates (see `2026-10-01-design-system-spec.md`).

## 2. Access strategy — no passwords change hands

1. Obtain a full WordPress backup/export: database, `wp-content`, active theme, plugins, uploads/media, relevant non-secret configuration. Preferred route: FastPanel's backup feature for the site, or a WordPress backup plugin (e.g. UpdraftPlus) run on the live install, exported to Google Drive and shared with `linguativ@gmail.com` (the account already read in this project).
2. Restore the backup into a safe local/staging environment for audit and build work.
3. Audit the restored site (Phase 1 of the brief) against the full checklist — theme, plugins, templates, navigation, media, analytics implementation, sitemap, robots, canonicals, redirects, forms, structured data, social metadata, performance.
4. Build the Bricks implementation in that staging environment.
5. Preserve existing URLs, media, and SEO equity throughout (redirect discipline per Phase 11).
6. Prepare deployment/migration instructions (Phase 37 deliverables: pre-deployment checklist, rollback plan).
7. No production deploy, DNS change, or client-facing action without Ala's explicit approval — standing, unconditional.

**Analytics track runs in parallel, not as a gate.** GA4 (property `337945309`) and Search Console access are separate from the WordPress backup. If Ala grants `linguativ@gmail.com` Viewer access to either, diagnosis starts immediately and independently of the WordPress build — the two workstreams don't block each other.

## 3. What proceeds now, without the backup

Per Ala's explicit instruction, repository-side planning that doesn't require inventing facts about the live installation continues immediately:

- Design-system specification for Bricks (`2026-10-01-design-system-spec.md`) — done.
- Site architecture reconciling the locked content batches with the brief's structure (`2026-10-01-site-architecture.md`) — done.
- Redirect-plan template, ready to fill once real URLs are known (`2026-10-01-redirect-plan-template.md`) — done.
- SEO/GEO technical specification carried forward from the existing `/mnt/project-files/website/2026-09-23-sitemap-and-seo-geo-plan.md` doc, updated against the full 37-phase brief where the brief adds requirements beyond what that doc already covers (next).
- Component/template planning inside the design-system spec's Bricks section.

What does **not** proceed without the backup: anything claiming to know the current theme, plugin stack, existing URLs, current GA4/GTM implementation, or any other fact about the live install. The brief is explicit that facts about the live installation must not be invented — Phase 1's audit has to run on the real site, not a guess.

## 4. Preservation policy (resolved, per Ala 2026-10-01 — supersedes the earlier flagged conflict)

The earlier open question — whether the 2026-09-29 Client Reference Register's PENDING/PRIVATE_ONLY status blocks preserving client names already live on the website — is resolved: **a client currently publicly displayed on Linguative's own site is valid evidence for migration preservation**, regardless of how an internal marketing/outreach register classifies that client elsewhere. The register still governs *new* naming in outreach/proposals; it does not retroactively require removing what the live site already shows.

Still holds without exception:
- No new endorsements, no expanded claims, no testimonials invented from logo usage alone.
- Any specific asset with an identifiable privacy, licensing, contractual, or legal concern gets flagged, not silently kept or silently removed.
- Preservation means reusing the authentic evidence within the improved design — not copying a poor layout as-is.

## 5. Canonical email (resolved, per Ala 2026-10-01)

`info@linguative.net` is the working canonical public email, consistent with what Ala has given directly before. Centralize it (Phase 8/33) so it can be changed once, globally, if needed. Not re-escalated as an open decision unless the live-site audit turns up authoritative evidence that contradicts this.

## 6. Immediate next steps

1. Waiting on Ala for one of: the network allowlist change, the Drive-shared WordPress backup, or GA4/Search Console Viewer access (requested 2026-10-01, see Gmail thread).
2. Meanwhile: extend the SEO/GEO technical spec against the full 37-phase brief (Phases 15–29) and start the redirect-plan template and component inventory in more detail.
3. Once the backup lands: run the Phase 1 audit for real, build the preservation inventories (client-identifying content goes to `/mnt/project-files/website/`, never this repo), then start the Bricks build in staging.
