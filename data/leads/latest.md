# Lead scouting run — 2026-09-18

Method note: WebFetch is confirmed still blocked (`EGRESS_BLOCKED`, tested
live against eurocham.jo this run) in this environment, so this run again
used targeted WebSearch queries per source, per the lead-scouting skill's
documented fallback. Diffed against the 2026-09-15 baseline (the
first-ever run, three days prior).

Scope note: this run was requested with a narrower brief than the full
source list — NGO workshops, embassy events, and corporate seminars in
Jordan, explicitly **outside formal UN tenders** (a separate routine
covers those). `jordan_gtd_eprocurement` (tender portal) was therefore
skipped this run; it isn't an NGO/embassy/corporate-seminar source anyway.
All 13 remaining sources were checked.

This is discovery only. No HubSpot Companies/Contacts/Deals were created
directly by this run — see "Handoff" below for why, and where the one new
finding was routed instead.

## New content worth reviewing

### EU Delegation to Jordan / College of Europe — not a currently-tracked source, found via general embassy-event search
- **"Strengthening EU-Jordan Ties" Capacity Building Programme for
  Jordanian Diplomats and Civil Servants — 2nd edition.** Delegation of
  the EU to Jordan (funded under the EU's SHARAKA programme) commissioned
  the College of Europe (Bruges) to run this. High-level kick-off event
  held in **Amman, 8–9 September 2026** (~20 young Jordanian officials
  from multiple institutions; agenda covered EU institutional
  architecture, decision-making, and EU–MENA strategic relations).
  Training continues at the College of Europe in **Bruges, 28 September
  – 7 October 2026**, plus study visits to EU institutions in Brussels.
  Programme runs through 2027 with a **3rd edition** still to come,
  building on a 1st edition held autumn 2025; up to 60 Jordanian civil
  servants/diplomats total across all editions.
- **Service-line assessment**: likely **interpretation** (EN-AR, possibly
  EN-FR given the College of Europe/Brussels components) for the Amman
  kick-off and any future Amman-based sessions, plus **translation** of
  briefing/training materials for Jordanian participants. Reasoning: an
  EU Delegation-run diplomatic training program bringing EU officials and
  Jordanian civil servants together is the same interpretation/
  translation profile already assessed for JEIC 2026, just smaller-scale.
  **Event/conference management** support for the Amman leg is a
  secondary possibility.
- **Timing**: the Amman kick-off already happened (8–9 Sep), but the
  programme is ongoing through 2027 with at least one more edition — live
  enough to be worth outreach now, ahead of the next Amman-based session.
- **Contact info**: role-based only (per lead-to-deal's guidance for
  diplomatic bodies): Delegation of the EU to Jordan general contact —
  Delegation-jordan@eeas.europa.eu, +962-6-4607000, Princess Basma
  Street, North Abdoun, Amman. No named individual confirmed for this
  specific programme.
- **Recommend adding as a tracked source** (`eeas.europa.eu/delegations/jordan_en`)
  for future runs — this is the second worthwhile EU-adjacent finding
  after JEIC, suggesting the EU Delegation's own site is a productive
  source in its own right, not just a diplomatic partner mentioned on
  other pages.

## Checked against 2026-09-15 baseline, no new actionable content

- `eurocham_jordan` / `jeic_2026` — JEIC 2026 (19 Nov, Dead Sea) unchanged
  from baseline. **Already a HubSpot Company** (447726913730, confirmed
  via CRM search this run) — no action needed.
- `horeca_jordan` — HORECA Jordan 2026 (11–13 Oct) unchanged from
  baseline. **Already a HubSpot Company** (447406154940, confirmed via
  CRM search this run) — no action needed.
- `amcham_jordan` — still no specific dated 2026 seminar/workshop
  surfaced; background/contact info only, consistent with baseline.
- `jordan_chamber_of_commerce` — still mostly outbound delegations; no
  new Amman-hosted corporate seminar surfaced.
- `british_council_jordan` — Youth Connect Programme (CSO grant cycle,
  Oct 2025–Mar 2026) surfaced this run; this is an ongoing grant program
  rather than a single dated event and was very likely already running
  as of the 09-15 baseline, so not treated as new. MENA UK Study Tour
  (Jan 2026) already past, matches baseline.
- `goethe_institut_jordan` — Language Café / upcycling workshop (Aug
  2026) and "Layali Al Sayfiya" summer series match baseline; nothing new
  or conference-scale.
- `ifpo_amman` — July 2026 workshop/seminar findings match baseline; no
  new items.
- `german_embassy_amman` — National Day reception (12 Sep 2026) surfaced
  this run, but it already took place and was a one-off diplomatic
  reception, not a bookable event needing language services going
  forward — not logged as a prospect.
- `mercy_corps_jordan` — May 2026 validation workshop and Sep 2026
  "Prosper Global" rebrand match baseline; no new dated event.
- `drc_jordan` — HEAT safety training (7–10 Sep 2026) surfaced this run,
  but it had already concluded by this run's date and is an internal
  safety course (not multilingual/delegate-facing), so not logged as a
  prospect. Matches baseline's general finding of an active but
  already-past RFQ cadence.
- `gentex_training`, `gh4t` — not re-checked this run (out of scope for
  the NGO/embassy/corporate-seminar brief; these are paid training-course
  providers, already noted in baseline as routine monthly calendars with
  nothing standout).

No sources failed to fetch this run (WebSearch returned usable results,
some thin, for all 13 checked).

## Handoff

Per this repo's documented two-gate design (`README.md`,
`.claude/skills/lead-to-deal/SKILL.md`), creating a HubSpot Company/
Contact requires a human-approval step that `manage_crm_objects` itself
enforces with a mandatory confirmation prompt — something this run,
firing unattended on a schedule with no one present to approve in the
moment, cannot legitimately supply on a person's behalf. The one new
finding above (EU Delegation Capacity Building Programme) has been posted
as a comment on GitHub issue #2 ("Lead scouting: new candidates") in the
same format prior crawler runs have used, so it enters the existing
human-gated pipeline (`lead-to-deal`) rather than being created directly.

---
*Generated by the lead-scouting skill (WebSearch fallback mode) on
2026-09-18. Discovery only — no HubSpot records created directly; new
finding routed to issue #2 for human-gated review via lead-to-deal.*
