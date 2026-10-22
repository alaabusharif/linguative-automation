# 05 — Routine Migration Map

Every one of the 20 active triggers, its proposed new role label, and its status. **No schedule or prompt changes yet** — this is a relabeling proposal pending Ala's approval, except where "prompt change recommended" is noted (still requires sign-off before editing).

| Routine | Current trigger ID | Proposed role | Status |
|---|---|---|---|
| Vendor Registration Reminder | `trig_01Sad53Z7bWDuxnEFTonVdgh` | Operations Monitor | KEEP as-is |
| RFQ Watcher | `trig_013LMbcty4pPPeuYgh8DmnFQ` | Operations Monitor (detection) → Sales & BD (handoff) | KEEP as-is |
| Daily Ops Report | `trig_016rhJocnF3sHmjqv9p1pXmp` | Operations Monitor | KEEP as-is |
| Social Posting (3x/week) | `trig_01DwEogydkQfukkxzMdPUx7s` | Engineering/Ops execution (post-ChatGPT-strategy) | KEEP mechanics; strategy source changes later per Gap F |
| after-event follow-up | `trig_01PCi4J9Fd3ruf2jAgTEq5QC` | Sales & BD Operations | KEEP as-is |
| competitor tracking (2x/week) | `trig_01LMQoxr44t6y4QnN12p8tDm` | ChatGPT (strategic interpretation) / Engineering (roster mechanics, if kept) | ARCHIVE strategic role, RETIRE AFTER TEST — see Gap F |
| Troubleshooting & Fixing | `trig_019z9H2t9sLQCG8g8AfmdQ8M` | Operations Monitor (monitoring half) + Engineering (fix half) | KEEP as-is (one routine, dual role label) |
| Design | `trig_01E9xFswtc8HE6zqQ8BQQUsd` | Design (archived-fallback stack once Express Premium/Higgsfield proven) | KEEP until Gap E test passes |
| monthly calendar and briefs | `trig_01LE9Qmu7X4Za3VkvkF8innm` | ChatGPT | RETIRE AFTER TEST — see Gap F |
| weekly marketing review | `trig_01M6AWd3BfgQTrZxX4qXL3eB` | ChatGPT | RETIRE AFTER TEST — see Gap F |
| daily lead review | `trig_014kEpUTKHfpQqgMXqZjxXCN` | **Split**: opportunity-ranking half → Sales & BD Operations (KEEP); strategy-change-authoring half → ChatGPT (RETIRE AFTER TEST) | See Gap A sub-gap — needs explicit split before any retirement |
| Lead Gen | `trig_01SP4xFgcnKLbVyKCjBaQXX7` | Sales & BD Operations | KEEP as-is |
| Copywriting | `trig_01WqeDnJYdzC7ju5ZSuebkwn` | ChatGPT | RETIRE AFTER TEST — see Gap F |
| Proposal Drafting | `trig_012fhdGyH5U5vSkn2Uaah4aa` | Sales & BD Operations | KEEP as-is |
| Outreach Drafting | `trig_01Ly83L79wjbB3tFzWZY9Wto` | Sales & BD Operations | KEEP as-is |
| Sales Agent | `trig_01HCRnUZLFYVpcHDfhmtVX2L` | Sales & BD Operations | KEEP as-is |
| Lead Contact Enrichment | `trig_01M3VH8MVdeAtAadkLBFn56j` | Sales & BD Operations | KEEP as-is |
| Institutional & Corporate Lead Scouting | `trig_012n2rhC8SmsFdosqCVvC1MQ` | Sales & BD Operations | KEEP as-is — **DO NOT RETIRE, unique hand-tuned data** |
| Client Email Responder | `trig_01FP9U1UvSLTbt4uAWTFfqun` | Operations Monitor | KEEP, **prompt change recommended** (Gap C — trash-on-first-offense → label-only, pending Ala's sign-off) |
| weekly mailbox → CRM sync | `trig_012wQ26VAvGPonzwYqBe586s` | Operations Monitor or Sales & BD Operations (ownership TBD — Open Questions #2) | KEEP as-is either way |

## Summary counts
- **KEEP as-is:** 15
- **KEEP with a recommended prompt change (pending approval):** 1 (Client Email Responder)
- **KEEP but split into two role labels:** 2 (Troubleshooting & Fixing, daily lead review)
- **RETIRE AFTER TEST (pending ChatGPT parity):** 4 (competitor tracking, monthly calendar and briefs, weekly marketing review, Copywriting)
- **RETIRE:** 0 — nothing is retired by this document. See `11-retirement-list-DRAFT.md` for the formal draft classification.
