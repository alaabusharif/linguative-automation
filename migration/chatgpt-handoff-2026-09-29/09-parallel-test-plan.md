# 09 — Parallel Test Plan

A 1–2 week window to run before any destructive cleanup, retirement, or schedule change. **Not started by this document** — begins only when Ala approves the migration plan.

## Duration
**14 days**, covering at least 2 full weekly cycles (so every weekly/twice-weekly routine gets 2+ runs, and the monthly routine is out of scope for full-cycle testing within this window — see note below).

## What runs in parallel during the window
- **Everything currently live keeps running exactly as-is** (all 20 triggers, both non-retiring and RETIRE-AFTER-TEST candidates) — this is a parallel test, not a cutover, so nothing is paused.
- ChatGPT's Marketing Bible (once Ala sets it up) runs alongside `marketing-manager`/`competitor-analyst`/Copywriting/the two calendar/review routines, producing its own calendar, briefs, and reviews independently.
- Adobe Express Premium + Higgsfield design output runs alongside `linguative-design` skill output for the same post concepts where practical, so the two can be compared directly.

## Success/failure criteria (from the migration brief, made concrete and testable)

| # | Criterion | How to verify | Pass condition |
|---|---|---|---|
| 1 | No missed RFQs | Compare RFQ Watcher's `marketing/tenders/` output against a manual spot-check of the same tender-portal sources for the same window | Every tender RFQ Watcher would normally catch is still caught; TIME-SENSITIVE flags still fire |
| 2 | No missed leads | Compare Lead Gen + daily lead review's HubSpot Company creation count against the crawler's issue #35 comment count for the window | No crawler-flagged candidate goes un-triaged |
| 3 | No lost enrichment | Compare Lead Contact Enrichment + Institutional & Corporate Lead Scouting's HubSpot writes against Vibe Prospecting's own export logs for the window | Every approved export results in a HubSpot write; credit-gate approval prompts still fire correctly |
| 4 | No lost CRM updates | Spot-check weekly mailbox → CRM sync's masked-principal detection against a manually reviewed sample of the same week's mail | At least the same catch rate as before (ideally: re-run the IBP/Particip-GmbH-style scenario as a synthetic test if a similar thread appears) |
| 5 | No lost proposal logic | Compare Proposal Drafting's output `.docx` files against the master GRPAM 2651 template field-for-field for every proposal drafted in the window | Master file untouched; every field present; equipment/reference-citation rules followed |
| 6 | No broken crawler | Check `.github/workflows/lead-scouting.yml` run history for the window | Zero unplanned failures; any planned/known-issue source (e.g. ReliefWeb pending `RELIEFWEB_APPNAME`) stays in its documented known state, not a new failure |
| 7 | No broken quotes system | Manually create one test quote/invoice through `tools.linguative.net` (once DNS resolves) or the local dev instance | App responds, generates a valid `.docx`/PDF, no regression |
| 8 | No missed follow-ups | Compare Sales Agent Part B's follow-up-sequence drafts against the stall-threshold table for every deal/lead that crossed a threshold in the window | Every deal/lead crossing a threshold gets a drafted sequence within the same run cycle |
| 9 | No unexpected email deletions/replies | Full review of every Client Email Responder action log for the window (trash/spam/label/draft actions) | Zero sends; zero permanent deletes; every trash/spam action matches a documented bucket-A case; the Gap C prompt change (if approved) shows zero auto-trash, review-label only |
| 10 | No duplicate outreach | Cross-check Outreach Drafting + Sales Agent Part B/D + Institutional & Corporate Lead Scouting's dedup logic against HubSpot activity logs for the window | No Contact receives two independently-drafted outreach emails for the same purpose in the window |
| 11 | No duplicate social publishing | Cross-check Metricool's scheduled/published list against both `linguative-design`-sourced and Express-Premium/Higgsfield-sourced drafts for the window | No double-post of the same concept; Ala's approval gate catches any accidental duplicate before it would publish |
| 12 | No website/automation regressions | N/A during this window unless the website rebuild has started — if it hasn't (per current status, it's still blocked on builder choice), this criterion is deferred to whenever that work begins | Deferred — not a blocker for this migration's cutover decision |

## Special note on cadence coverage within the 14-day window
- Daily/near-daily routines (Vendor Registration Reminder, RFQ Watcher, Daily Ops Report, Troubleshooting & Fixing, Lead Gen, Proposal Drafting, Sales Agent, Client Email Responder): 10–12 runs each — full confidence achievable.
- Weekly routines (Social Posting 3x, after-event follow-up, weekly marketing review, weekly mailbox → CRM sync): 2 runs each — adequate for a first pass, but a second 14-day window is recommended before any weekly routine is fully retired, to catch a rarer edge case.
- Twice-weekly (competitor tracking, Copywriting via its Wednesday slot, Design Mon/Thu): 2–4 runs each — adequate.
- Monthly (calendar and briefs, 25th of month): **only 0–1 run falls inside a 14-day window depending on start date.** Recommend explicitly extending the test window to bracket one full monthly cycle before retiring the monthly calendar/briefs routine specifically — this is the one routine where 14 days is not sufficient parallel-test coverage by itself.

## Reporting during the window
Daily Ops Report already aggregates trigger run status project-wide — recommend it be the natural daily checkpoint during the test window (no new reporting mechanism needed). At the end of the window, compile a single pass/fail summary against the 12 criteria above before presenting the cutover decision to Ala (see `10-cutover-checklist.md`).
