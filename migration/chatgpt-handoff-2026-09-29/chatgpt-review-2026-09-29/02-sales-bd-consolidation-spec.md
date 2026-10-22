# Sales & BD Operations — Consolidation Specification

## Goal

Replace fragmented ownership with one modular Sales & BD Operations owner while preserving every useful hand-tuned rule from the current routines and `lead-to-deal` skill.

The source routines remain active during shadow testing. The successor is built first, then source routines are retired module-by-module after parity.

## Shared hard rules

### CRM
- Deduplicate before creating Company/Contact/Deal.
- In unattended HubSpot writes where the existing runtime requires it, preserve `confirmationStatus: "CONFIRMATION_WAIVED_FOR_SESSION"`; do not substitute `CONFIRMED`.
- Never silently invent missing contacts or emails.
- Preserve the lead-to-deal audit trail in `data/leads/processed_comments.json`.

### Contact confidence
Use the existing three-tier convention:
- verified (3+ supporting sources)
- likely (2 supporting sources)
- unverified

Never pattern-guess an email.

### Vibe Prospecting spend control
- Exploration is free where supported.
- Paid export is a real-cost action.
- Never export without Ala's explicit per-run approval after showing the shortlist and exact credit cost.
- Insufficient credits are a graceful stop, not a failed run.
- Keep contact enrichment batched on the current cadence initially; do not convert it to per-lead interruption until proven beneficial.

### Public/private confidentiality
- Public repo outputs use HubSpot IDs, sector/role descriptions or generic labels, not client/contact/rate details.
- Private working output may use names where necessary.
- The event-management/AV channel partner must never be named publicly or in third-party outreach/proposals (see the private Client Reference Register). It may be named in a private communication addressed directly to that partner.
- Never invent past-performance claims.

### Arabic
- Arabic marketing/sales copy is composed natively, not translated line by line.
- Company name: الإبداع اللغوي, with masculine grammatical agreement; never لينقواتيف.
- Avoid generic AI-style Arabic filler.

### Equipment
When brand naming is relevant, only Bosch DICENTIS / Bosch INTEGRUS are named. Other equipment is described generically unless Ala explicitly approves otherwise.

## Module A — Prospect discovery

Preserve current Lead Gen purpose:
- NGO workshops and programs
- embassy events
- corporate seminars
- research/training programs
- likely need for interpretation, translation, AV/event support
- also transcription/editing/localization/subtitling/dubbing signals, with the caveat that only proven services may be presented as proven

Output: deduplicated HubSpot Company (+ Contact when available), with likely-service-need note.

## Module B — Institutional & corporate scouting

Preserve all 10 current lead classes:
1. banks
2. law firms
3. insurers
4. federations/associations
5. global corporates
6. litigation/arbitration firms
7. deposition/court-reporting agencies
8. healthcare accreditation bodies
9. international NGOs/UN not yet contacted
10. major industrial/mining/logistics/port/airport companies

Preserve the exact current source trigger's learned persona definitions, company-name mappings and search gotchas before retirement, including country filtering and known entity-name mismatches.

**Cutover blocker:** before the current Institutional & Corporate Lead Scouting trigger is disabled, its complete current prompt/knowledge base must be captured in a secure, non-public successor store or consolidated-agent configuration. The public repo may document classes and policy, but should not become a dump of sensitive prospect intelligence.

## Module C — Qualify and prioritize

Inputs:
- crawler issue "Lead scouting: new candidates"
- formal-tender handoff from Operations Monitor
- HubSpot
- current marketing strategy

Rank into actions such as bid / partner / warm outreach / nurture / skip.

This is the successor for the opportunity-ranking half of daily lead review. It is Sales work, not Marketing.

## Module D — Lead-to-deal preparation

Preserve `lead-to-deal` behavior:
- find the lead-scouting issue by title/label, not hardcoded issue number
- read/write `data/leads/processed_comments.json`
- track per-source-entry outcome: created / declined / duplicate, with reason
- check Company and associated RFQ Deal before proposing a new record
- research a contact instead of accepting "none found" from a single crawler page
- human approval remains required where the current skill requires it

The existing skill may remain a helper implementation during and after consolidation if cleaner than duplicating its state logic. Ownership changes to Sales & BD Operations.

## Module E — Contact enrichment

- Identify Companies missing a named/verified Contact.
- Select the target persona based on company type.
- Prefer a named personal business contact over a generic alias when supported.
- Explore with Vibe; paid export uses the credit gate.
- Associate Contact to existing Company; do not duplicate Company.

## Module F — Outreach drafting

Preserve:
- current English template semantics until Marketing explicitly replaces the message framework;
- native Arabic rule for Arabic outreach;
- read latest `marketing/strategy.md` and `marketing/sales-reports/` to weight sector/message angle;
- Stokoe Partnership Solicitors and Planet Depos may be used only as sector credibility references to other firms, never to themselves and never with confidential case specifics;
- no naming of the event-management/AV channel partner in third-party outreach;
- English company-profile link in every English new/re-engagement draft;
- Arabic profile on new Arabic drafts;
- profile link is a natural sentence in the body, not an attachment and not a bare URL;
- never sends automatically.

## Module G — Pipeline management

Exact stall thresholds to preserve:
- "New" 3+ days, no proposal → needs bid package.
- "Proposal Drafted" 5+ days, no stage change → follow-up sequence.
- "Submitted" 10+ days, no stage change → follow-up sequence.
- Lead with no outreach 5+ days after creation → outreach now.
- Lead with outreach sent, no reply 10+ days → follow-up sequence.
- Lead replied, no deal after 7+ days → recommend creating a deal.

Outputs:
- private daily prioritized plan
- public-safe sales report

Never moves a deal to Submitted/Won/Lost automatically.

## Module H — Follow-up sequences

- 2–3 touches over roughly 1–2 weeks
- language-matched
- draft only
- deduplicate against other outreach/follow-up activity

## Module I — Proposal / bid package

Preserve all existing Proposal Drafting constraints:
- master GRPAM 2651 template is never edited in place; copy and rename
- always produce a validated .docx; optional Google Doc is not a substitute
- rates come from the current private company reference / approved rate card; where unpriced, flag "confirm with Ala"
- AV is a separate line where current rules require it
- Stokoe/Planet Depos citation hard limits remain
- the event-management/AV channel partner is never named
- Bosch DICENTIS/INTEGRUS naming restriction remains
- unsupported requested equipment/brand/spec is flagged for confirmation, not invented
- deal may move to "Proposal Drafted" only under the existing approved logic; never Submitted without Ala
- proposal is never sent to the client automatically

The Sales Agent's lighter bid-package assembly and Proposal Drafting routine are reconciled here instead of duplicated: one module supports a quick internal bid package and a formal master-template output mode.

## Module J — Cross-sell and reactivation

Scan existing clients for services not yet used. Draft only. Do not overstate services that have not yet become proven revenue lines.

## Module K — Recurring-client 90-day check-in

After 90 days of no contact:
- friendly relationship check-in
- not a pitch
- applies to active clients
- a private direct check-in to the event-management/AV channel partner may name them

## Module L — After-event follow-up

Detect delivered/completed work and prepare:
1. testimonial request draft
2. Google review request draft
3. case-study draft

Preserve:
- fixed review link currently in use
- skip if complaint/dispute/unhappy signal exists
- do not publicly identify an unapproved client
- do not overwrite the website thread's separate case-study draft file

## Module M — Forecast and learning loop

Saturday:
- pipeline value by stage
- at-risk deals
- forecast

Ongoing:
- roll up sent/replied/won by sector, service, language and message angle
- write public-safe `marketing/sales-reports/`
- do not infer causation from small samples
- feed Marketing Manager through aggregated results, not private client details

## Retirement principle

The old routines are rollback sources during parallel testing. Once a successor module passes, the source routine can be disabled even if its capability was "unique," because that uniqueness has now been transferred.
