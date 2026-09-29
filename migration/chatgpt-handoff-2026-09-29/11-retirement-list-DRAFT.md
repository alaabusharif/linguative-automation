# 11 — Draft Retirement List

> **Corrected by ChatGPT's review (2026-09-29):** see
> [`chatgpt-review-2026-09-29/06-revised-retirement-and-test-plan.md`](chatgpt-review-2026-09-29/06-revised-retirement-and-test-plan.md).
> The "DO NOT RETIRE — UNIQUE CAPABILITY" classification used below for
> several Sales/BD routines is replaced there with "MERGE INTO SALES & BD
> OPERATIONS; RETIRE SOURCE ROUTINE ONLY AFTER MODULE-LEVEL PARITY." This
> document's original classifications are left unchanged below for the
> record.

**DRAFT — for Ala's review.** Every current agent, routine, and skill classified as one of: **KEEP**, **MERGE INTO [target]**, **ARCHIVE**, **RETIRE AFTER TEST**, **DO NOT RETIRE — UNIQUE CAPABILITY**. For every RETIRE AFTER TEST item, the exact replacement and its parity test are named. Nothing here is executed.

## Routines (triggers)

| Routine | Classification | Target / test |
|---|---|---|
| Vendor Registration Reminder | KEEP | — |
| RFQ Watcher | DO NOT RETIRE — UNIQUE CAPABILITY | Distinct from crawler and marketing-manager; no replacement exists or is proposed |
| Daily Ops Report | KEEP | — |
| Social Posting (3x/week) | KEEP (mechanics); strategy source changes per Gap F once ChatGPT proven | — |
| after-event follow-up | DO NOT RETIRE — UNIQUE CAPABILITY | No replacement proposed; commercial follow-up stays Sales & BD |
| competitor tracking (2x/week) | RETIRE AFTER TEST | Replacement: ChatGPT competitor-intelligence output. Test: 14-day parallel run, Ala judges strategic-interpretation quality equivalent; source-link discipline must carry over |
| Troubleshooting & Fixing | KEEP | — |
| Design | ARCHIVE (fallback) | Replacement: Adobe Express Premium + Higgsfield. Test: several successful posts pass the same 5-point QA checklist this skill defines |
| monthly calendar and briefs | RETIRE AFTER TEST | Replacement: ChatGPT Marketing Bible calendar. Test: one full monthly cycle inside/adjacent to the parallel-test window, per `09`'s note |
| weekly marketing review | RETIRE AFTER TEST | Replacement: ChatGPT review output. Test: 2+ weekly cycles, Ala judges equivalent |
| daily lead review | MERGE INTO Sales & BD Operations (opportunity-ranking half) + RETIRE AFTER TEST (strategy-authoring half, into ChatGPT) | Must be split before either half is finalized — see Gap A |
| Lead Gen | DO NOT RETIRE — UNIQUE CAPABILITY | No replacement proposed |
| Copywriting | RETIRE AFTER TEST | Replacement: ChatGPT-authored copy from its own briefs. Test: 2+ weekly cycles, Ala judges quality equivalent, native-Arabic bar maintained |
| Proposal Drafting | DO NOT RETIRE — UNIQUE CAPABILITY | Master-template workflow and rate card are hand-tuned business logic with no proposed replacement |
| Outreach Drafting | DO NOT RETIRE — UNIQUE CAPABILITY | Citation rules, template, Drive-link rules are hand-tuned; no replacement proposed |
| Sales Agent | DO NOT RETIRE — UNIQUE CAPABILITY | 8-part daily pipeline management; no replacement proposed |
| Lead Contact Enrichment | DO NOT RETIRE — UNIQUE CAPABILITY | No replacement proposed |
| Institutional & Corporate Lead Scouting | DO NOT RETIRE — UNIQUE CAPABILITY | 10 hand-tuned lead classes with learned search gotchas; irreplaceable without redoing weeks of trial-and-error |
| Client Email Responder | KEEP, prompt amendment pending approval | Gap C change, not a retirement |
| weekly mailbox → CRM sync | KEEP; ownership label TBD (Sales & BD vs. Operations Monitor) | Open Questions #2 |

## Agents

| Agent | Classification | Target / test |
|---|---|---|
| `marketing-manager` | MERGE (opportunity-review responsibility) INTO Sales & BD Operations; RETIRE AFTER TEST (remaining strategic responsibilities) INTO ChatGPT | Cannot retire wholesale — must split first, see Gap A and `06` |
| `competitor-analyst` | ARCHIVE (mechanics) / RETIRE AFTER TEST (strategic interpretation) | See competitor-tracking routine row above |
| `rfq-watcher` | KEEP | Not in migration scope |

## Skills

| Skill | Classification | Target / test |
|---|---|---|
| `linguative-design` | ARCHIVE | See Design routine row above |
| `lead-to-deal` | KEEP | Not in migration scope |
| WebFetch-based lead-scouting skill | Already retired (2026-09-19) | No action — listed for completeness only |

## Rule applied throughout
No item above is marked RETIRE AFTER TEST without a named replacement and a named test. Every DO NOT RETIRE item has no proposed replacement in the migration brief, so it stays. No item is marked simply RETIRE (final, immediate) anywhere in this document — the migration brief authorizes RETIRE AFTER TEST at most, pending Ala's approval of cutover.
