# Lead scouting run — 2026-09-15

Method note: WebFetch is blocked (EGRESS_BLOCKED) in this environment, so
this run used targeted WebSearch queries per source instead, per the
lead-scouting skill's documented fallback. This is the **first-ever run**
recorded in this repo (`data/snapshots/` was empty going in) — every known
source is a first-time check this run, so there is nothing to diff against
yet. All findings below are baseline observations, not "new since last
run" deltas. Future runs will be able to do real new-vs-old comparisons
against the snapshots written today.

This is discovery only. No HubSpot Companies/Deals were created, no Gmail
was touched, and no outreach was drafted — all of that is a separate,
human-gated next step.

## New content worth reviewing

Since this is the first run, everything below is "first-time baseline",
not a delta. It's grouped here anyway because several findings are
concrete, time-bound opportunities worth a human's attention now rather
than waiting for a second run to "confirm" them as new.

### EuroCham Jordan / JEIC 2026 (keys: `eurocham_jordan`, `jeic_2026`)
- **Jordan-EU Investment Conference (JEIC) 2026** — 19 November 2026, King
  Hussein Bin Talal Convention Center, Dead Sea. Under Royal Patronage of
  King Abdullah II; EU Commission President Ursula von der Leyen
  confirmed attending. High-profile EU-Jordan diplomatic/investment
  conference, "select group of major" global companies and investors,
  EU/Jordanian government officials. Has its own companion mobile app,
  indicating a well-resourced, formally organized event.
- **Service-line assessment**: likely **interpretation** (simultaneous,
  EN-AR-FR probable given EU/Jordanian officials) + **AV equipment**
  (booths, headsets, sound for a convention-center-scale diplomatic
  event) + **translation** (delegate materials, MoUs, investment
  briefs) + possibly **event/conference management** support for the
  Jordanian side. Reasoning: royal-patronage EU summit with a named
  head-of-EU-Commission attendee is exactly the profile of event that
  requires professional simultaneous interpretation and delegate
  document translation.
- **Timing**: ~2 months out from this run (2026-09-15) — enough lead
  time to pitch for this edition.
- **Contact info**: none found directly for EuroCham or JEIC organizers
  in search results; jeic.invest.jo is the official site (not fetchable
  in this environment) and would be the place to find an organizer
  contact/RFP process.

### Jordan Chamber of Commerce / Amman Chamber (key: `jordan_chamber_of_commerce`)
- **Franchise & Trade Agencies Expo 2026** — Amman, June 9-10 2026
  (already past as of this run), organized by Bana Conferences and
  Exhibitions + Iraqi Business Council in Jordan. Noted for context /
  pattern (recurring expo), not actionable now.
- Amman Chamber's own 2026 international exhibitions are outbound
  delegations (Morocco, India, China, Turkey, Iraq) — Jordanian
  companies traveling abroad, not Amman-hosted, so lower relevance for
  on-site interpretation/AV.
- **Service-line assessment**: low priority this run — nothing Amman-
  hosted and upcoming was found. Worth re-checking
  ammanchamber.org.jo/en/events directly in a future run since that page
  wasn't fetchable here.
- **Contact info**: none found beyond the general chamber sites.

### HORECA Jordan (key: `horeca_jordan`)
- **HORECA Jordan 2026** (11th edition) — Oct 11-13 2026, Jordan
  International Exhibition Center, Mecca Mall, Amman. 17,000+ visitors
  expected, 300+ exhibitors, 600+ brands, international pavilions
  (Palestine, Iraq, Egypt), full talks/shows/competitions program.
- **Service-line assessment**: **interpretation** + **AV equipment** for
  the talks/competitions program, and possibly **subtitling/voiceover**
  or **translation** for exhibitor-facing multilingual materials.
  Reasoning: large multinational trade exhibition with a structured
  conference-adjacent program (talks, shows) and international exhibitor
  base.
- **Timing caveat**: event is only ~4 weeks out from this run — too
  close to realistically win new procurement for this edition. Flag for
  outreach ahead of the **2027** edition instead (organizers likely start
  vendor planning several months out).
- **Contact info**: none found in search results; horeca-jordan.com is
  the official site (not fetchable here).

### ILO Jordan — via UNGM, not yet in sources.py (see also Look-alike prospects)
- **RFQ/119/2026/DHM/ROAS** — event management company sought by ILO
  (with GFJTU) for a workshop "Strengthening Inclusive Trade Union
  Engagement, Fair Recruitment and Access to Justice for Migrant Workers
  in Jordan", Amman, 22-24 June 2026. Scope explicitly named: hotel,
  catering, conference facilities, **interpretation services (Arabic/
  English)**, and transport allowances.
- **Service-line assessment**: textbook **interpretation** +
  **event/conference management** RFQ — this is the single most directly
  on-target finding of this run, describing Linguative's core services by
  name in the tender scope.
- **Timing**: this specific RFQ's event already happened (June 2026,
  before this run) — not actionable itself, but it is strong evidence
  ILO Jordan (via UNGM) regularly procures exactly Linguative's service
  mix. **Recommend adding an ILO/UNGM-Jordan-filtered search as a
  tracked source** so future similar RFQs are caught while still open.
- **Contact info**: none found directly; procurement routes through
  UNGM (ungm.org) notice postings.

## Look-alike prospects

New candidate organizations found via the additional focus (chambers,
embassies, cultural institutes, UN agencies, international NGOs,
conference organizers) that are **not currently in `crawler/sources.py`**.
None of these have been added to sources.py by this run — that's a
judgment call left to a human, but they're strong candidates for the
list.

### UN agencies
- **ILO (International Labour Organization) — Jordan / Regional Office
  for Arab States**. Confirmed active procurer of event-management +
  Arabic/English interpretation services in Amman via UNGM (see RFQ
  above). Strong fit: their procurement pattern maps almost exactly onto
  Linguative's core service lines. No direct contact found beyond UNGM
  notice postings (ungm.org) — recommend registering as an interested
  vendor on UNGM to see future RFQs before they close.
- **UNDP Jordan**. Search surfaced an active UNDP procurement notices
  portal (procurement-notices.undp.org) including a past "RFQ -
  Translation service" notice and a "capacity-building trainings on
  financial inclusion and fintech" call for proposals (deadline 25 June
  2026, now closed). Confirms UNDP Jordan does procure translation
  services through a standing portal. No specific contact found beyond
  the UNDP procurement portal itself; worth tracking
  procurement-notices.undp.org filtered for Jordan.
- **UNHCR Jordan / MENA**. Confirmed active tender program including
  RFQ/HCR/SUP/MENA/2026/003 (translation/localization of a Refugee Status
  Determination e-learning course into Arabic). UNHCR Jordan maintains a
  dedicated tender-announcements page (unhcr.org/jo/tender-announcements)
  and an eTenderBox portal (etenderbox.unhcr.org). Strong fit for
  **translation** and **localization** service lines specifically.
- **UNDRR (UN Office for Disaster Risk Reduction) — Regional Office for
  Arab States**. History of national consultation workshops in Amman on
  Jordan's Disaster Risk Reduction Strategy. No confirmed 2026-dated
  Amman event surfaced this run, but the office is active in the region;
  worth a follow-up check of undrr.org/events filtered for Jordan.
- **IFRC (International Federation of Red Cross and Red Crescent
  Societies)**. A "Jordan 2025-2026 IFRC network country plan" document
  was found, confirming an active Jordan country plan, but no specific
  event/tender surfaced. Low-confidence prospect this run — worth a
  second look.

### International NGOs
- **Save the Children Jordan**. Confirmed active Amman presence
  (jordan.savethechildren.net) with a global tenders page
  (savethechildren.net/tenders) but no Jordan-specific 2026 tender
  surfaced this run. Worth tracking their tenders page directly.
- **Oxfam (Jordan/regional)**. Found a general Oxfam translation-services
  contact (translationservice@oxfam.org) and evidence of an active global
  tender program, but no Jordan-specific 2026 notice surfaced. Contact
  email found is generic/global, not Jordan-specific.
- **Humanity & Inclusion (HI)**. Confirmed active MENA regional office in
  Amman (HI Middle East regional office). No tender/event surfaced this
  run — findings were limited to job postings (Deputy Country Director
  for Support Services, Amman, starting Apr 2026; Regional Grants Officer
  for MASHRIQ). Worth tracking as an org with a real, staffed Amman
  presence even without a tender hit this run.
- **ACTED**. No Jordan-specific procurement or event found this run —
  search returned only generic Jordan tender-portal results, no ACTED-
  specific hit. Treat as unconfirmed; retry in a future run rather than
  dropping.

### Cultural institutes / embassies
- **Institut Français d'Amman (French Institute of Jordan / IFJ)** —
  distinct from Ifpo (the research institute already tracked as
  `ifpo_amman`). IFJ is the cultural operator of the French Embassy in
  Jordan, running French/Arabic courses and public cultural events (e.g.
  "Music Day" June 19 2026, open-air event with the French Embassy and
  Friends of Jordan Festivals at Salah Al-Din Park). Good look-alike fit
  alongside Goethe-Institut and British Council — recommend adding as a
  tracked source (site: ifjordan.com, seen as ifjordan.com/post/... in
  search results).
- **French Embassy Amman** (as distinct from IFJ) — general presence
  confirmed, no specific 2026 event beyond the IFJ-run Music Day found.

### Conference/event organizers active in Jordan (potential subcontracting partners, not clients)
These are **event management companies**, i.e. potential competitors on
the "event/conference management" service line — but plausible
**subcontracting/referral partners** for interpretation, AV, and
translation on events they organize but don't specialize in language
services for. Flagging for human judgment rather than treating as
standard sales prospects:
- **Al-Oula Events & Conferences** — active in Feb/Apr 2026 (e.g.
  Mexico-Jordan 50th diplomatic anniversary event).
- **Range** (rangemeeting.com) — describes itself as Amman's leading
  event management company, 800+ events, "trusted by Fortune 500s & UN
  agencies" — notably already serves UN-agency clients, which overlaps
  directly with Linguative's likely target segment; worth exploring as a
  referral/subcontracting relationship.
- **COMCRA Events** (comcra.net) — MENA-wide, est. 2006, 600+ events.
  Jordan Valley Conferences & Exhibits (jordan-valley.com) — Amman-based,
  also serves UAE.
- No contact info captured for any of these in this run; would need a
  direct site visit to get contact details.

## First-time checks

Every source in `crawler/sources.py` was checked for the first time this
run (no prior snapshot existed for any of them):
`eurocham_jordan`, `amcham_jordan`, `jordan_chamber_of_commerce`,
`british_council_jordan`, `goethe_institut_jordan`, `ifpo_amman`,
`german_embassy_amman`, `mercy_corps_jordan`, `drc_jordan`,
`horeca_jordan`, `jeic_2026`, `gentex_training`, `gh4t`,
`jordan_gtd_eprocurement`.

Baseline snapshots for all 14 were written to `data/snapshots/<key>.txt`
this run; future runs can diff against them.

## Sources that failed

None. Every WebSearch query returned usable results for every source
(some thin, e.g. AmCham and the German Embassy returned mostly background/
contact info rather than event specifics — see their snapshot files for
what was found — but none returned nothing at all, so none are logged as
a hard failure).

## Checked, no notable change

(N/A this run — there is no prior snapshot to compare against, so nothing
can be classified as "unchanged." Sources with only routine/low-priority
findings, not called out above as time-bound opportunities:)
- `amcham_jordan` — no specific 2026 event surfaced, background/contact
  info only.
- `british_council_jordan` — mainly an outbound UK study tour (Jan 2026);
  live events page reported as empty at search time. Contact:
  +962 6 460 3420.
- `goethe_institut_jordan` — small local language-cafe/workshop events
  plus a "Layali Al Sayfiya" summer series and the ongoing multi-year
  "Halaqat" project; nothing conference-scale identified.
- `ifpo_amman` — academic workshops/conferences (July 1 2026 workshop,
  Aug 22 2026 "Energy Across Scales" conference) — smaller academic-scale
  audiences, multilingual (FR/AR/EN) content that could need translation/
  proofreading but no delegate-count or vendor-RFQ signal found.
- `german_embassy_amman` — no event surfaced; contact only (phone
  +962 6 590 1170, email info@amman.diplo.de).
- `mercy_corps_jordan` — routine workshops/roundtables (May, Aug 2026);
  notable org-level rebrand to "Prosper Global" starting Sep 2026 worth
  tracking for future record-keeping; has a standing vendor tenders page
  (jordan.mercycorps.org/tenders) worth checking directly next run.
- `drc_jordan` — four RFQs/RFPs found, all with 2026 deadlines already
  passed as of this run (Feb-May 2026); confirms an active recurring
  tender cadence via rfq.jor.amm@drc.ngo and drc.ngo/en/tenders — worth
  checking that page directly (not just via search) in future runs to
  catch tenders while still open.
- `jordan_chamber_of_commerce` — mostly outbound exhibitions; one Amman-
  hosted expo already past (June 2026).
- `gentex_training` and `gh4t` — both are recurring paid international
  training-course providers with routine monthly course calendars; no
  standout large multilingual event identified.
- `jordan_gtd_eprocurement` — confirmed live and functioning as a general
  civil-works/goods procurement portal; no language-services-relevant
  tender surfaced. UNGM proved a far richer source for interpretation/
  event-management RFQs this run (see ILO finding above) — recommend
  adding UNGM as a tracked source in a future `sources.py` update.

---
*Generated by the lead-scouting skill (WebSearch fallback mode) on
2026-09-15. Discovery only — no HubSpot records created, no emails
touched or drafted. Next step (human-gated): review this file, decide
which findings/prospects to hand to the lead-to-deal skill.*
