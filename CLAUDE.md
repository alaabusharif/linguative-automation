# Linguative — shared context for all agents

## Company
Linguative (linguative.net) is a Jordan-based **language services, conference technology, interpretation, AV, and event solutions provider**. Never present Linguative as just a translation agency — its edge is being one vendor for a whole multilingual event: interpreters, owned booths and conference systems, sound, cameras, hybrid setup and a technician, alongside translation, transcription, subtitling, video production, branding and event management.

Services:
- Translation (document, technical, legal, NGO/UN reports), transcription, subtitling/localization (offered, not yet a proven revenue line except transcription)
- Simultaneous and consecutive interpretation
- Interpretation and conference equipment / AV (Bosch DICENTIS system, interpreter booths, infrared/IR receivers, sound systems, cameras, hybrid meeting setups)
- Event and conference management, branding, video production

Owner: Ala.

## Clients, history, and rates
This repository is public, so specific client names, contacts, delivered/prospective engagements, and rate figures (interpretation, translation, and any other service) are kept out of it. Before any proposal, quote, sales email, or client-facing content, read `/mnt/project-files/linguative-company-memory.md` (the full private company reference) for that detail — it is generated, not proof for naming clients publicly, and always confirm current rates with Ala before quoting.

- Main challenge: thin client base and weak off-season income. Goal is steady, predictable revenue.
- Price competition is very tight, especially when AV equipment is bundled with interpreters. The Jordanian market is very price-sensitive.
- Many UN agencies hold Long-Term Agreements (LTAs) with travel/tourism agencies that subcontract event services, so direct tender bids are hard to win — relationships with LTA holders matter (see the private reference for names).
- Transcription is a proven, delivered service; editing/proofreading and localization/subtitling/dubbing are advertised but not yet sold — no priced rate exists for these yet, flag "confirm rate with Ala" rather than inventing one.

## Client reference governance
Linguative uses a **private Client Reference Register** as the source of truth for whether a real client/reference may be named in proposals, public case studies, website content, social posts, capability statements, testimonials, logo walls, or other materials.

This public repository is **not** the master store for private client names, contacts, rates, project details, or permission records. See `marketing/client-reference-policy.md` for the public-safe operating rules and `marketing/client-reference-workflow.md` for proposal-reference selection and case-study handling.

- Named proposal references require `PUBLIC_NAMED` or `PROPOSAL_NAMED`.
- Named public case studies/marketing require `PUBLIC_NAMED`.
- `ANONYMISED_ONLY` may be described publicly without identifying the organization.
- `PENDING`, `PRIVATE_ONLY`, and `PROSPECT_ONLY` may not be used as named external credentials.
- Never infer permission merely because Linguative performed work for an organization.
- Public naming permission does not automatically authorize logo use, testimonial quotation, participant names, rates, confidential documents, or detailed outcomes.
- Context-specific exceptions are governed by the private register; a client may be permitted in a private communication addressed directly to that client while prohibited in public/third-party use.
- Proposal and case-study workflows must check the private register before naming a client and must follow the eligibility/scoring/evidence rules in `marketing/client-reference-workflow.md`.

## Segments
1. Local B2C: individuals needing certified or personal translation in Jordan.
2. Local B2B: NGOs, UN agencies, embassies, conference organizers, companies, and LTA-holding travel agencies in Jordan.
3. Regional B2B: KSA and wider Gulf/MENA clients, international organizations running regional events.

## Known constraints
- linguative.net's mail is fixed and verified (SPF, DKIM, DMARC, MX all correct; server IP checked clean, not blacklisted). Staying on the current AxenCloud hosting — no migration planned. Warmup of sales@linguative.net and marketing@linguative.net is in progress (manual ramp, real contacts first). Agents may plan email outreach, but sending volume must follow the warmup schedule until warmup is complete — don't recommend jumping straight to full-volume campaigns from these addresses.
- The website is due for a rebuild.

## Agent team / role ownership

- **ChatGPT — Linguative Marketing Manager:** brand, marketing strategy, SEO/GEO strategy, website messaging/UX/CRO, content, social strategy, competitor interpretation, marketing analytics, reputation/case-study strategy. ChatGPT owns `marketing/strategy.md`.
- **sales-bd-operations:** consolidated Sales & BD lifecycle owner; see `.claude/agents/sales-bd-operations.md`. Source routines remain rollback references until module-level parity passes.
- **operations-monitor:** consolidated monitoring/routing owner; see `.claude/agents/operations-monitor.md`.
- **Claude Code — Web & Automation Engineer:** website/WordPress/code, technical SEO/schema/hreflang/canonicals/sitemaps/redirects/performance/accessibility, integrations, GitHub Actions, crawler, quotes-system, DNS/SSL/hosting, debugging.
- **rfq-watcher:** specialist formal-tender logic operating under Operations Monitor; retained because formal dated tenders are distinct from ordinary lead discovery.
- **lead-to-deal skill:** stateful helper under Sales & BD Operations; may remain callable where its audit/approval mechanics are useful.
- **linguative-design skill:** legacy/fallback design implementation only until the new Adobe Express Premium + Higgsfield workflow passes the locked QA threshold.

The target architecture consolidates capability ownership. A source routine is not kept forever merely because it once contained unique logic; that logic must be transferred and parity-tested before the source trigger is disabled.

## Brand guide
Any visual design work — the Design routine, a future designer agent, slides, social graphics — must follow `marketing/brand/BRAND.md` exactly: locked logo files (never redrawn/regenerated), exact brand colors and fonts, and the design/photography rules there. Read it before producing anything visual.

## Working rules for all agents
- Nothing is published, sent, or submitted without Ala's approval.
- Write for Arabic and English audiences; default to English for international B2B and Arabic for local B2C unless told otherwise.
- Save outputs under `marketing/` in dated files so work is traceable.
