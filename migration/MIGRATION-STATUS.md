# Migration Execution Status — 2026-09-29

> **Correction (2026-09-29, later same day):** "No current trigger is disabled by this change" below is now out of date. Ala's follow-up "Accelerated Marketing Cutover — execute now" instruction had the six legacy marketing triggers actually disabled/paused live (not merely documented) — see `chatgpt-handoff-2026-09-29/13-accelerated-cutover-2026-09-29.md` for the exact trigger IDs, timestamps, and `list_triggers` verification. This file's own "Not yet authorized for retirement" section predates that instruction.

## Completed
- ChatGPT Marketing Manager role defined.
- Claude Code Web & Automation Engineer role defined.
- Consolidated Sales & BD Operations agent created.
- Consolidated Operations Monitor agent created.
- Client Reference governance merged.
- Proposal-reference and case-study selection workflow merged.
- Marketing strategy aligned with the locked Marketing OS.
- RFQ watcher retained as specialist logic under Operations Monitor.
- Existing source routines preserved for rollback/parity.

## Not yet authorized for retirement
No current trigger is disabled by this change.

## Remaining parity/cutover work

### Sales & BD
Before disabling source triggers, run module-level shadow comparisons for:
- Lead Gen
- daily lead review opportunity-ranking half
- Institutional & Corporate Lead Scouting
- Lead Contact Enrichment
- Outreach Drafting
- Sales Agent
- Proposal Drafting
- after-event follow-up

### Critical knowledge-capture blocker
The current Institutional & Corporate Lead Scouting trigger contains a hand-tuned prompt/knowledge base that is not fully represented in the public repo. Its complete operational knowledge must be captured in a secure/private successor source and parity-tested before that source trigger can retire.

### Operations
Test successor mailbox behavior before changing the existing Client Email Responder:
- first suspicious occurrence = label for review, not trash;
- no permanent delete;
- known-client safeguard;
- tender-alert safeguard;
- explicit Spam-search limitation.

Test masked-principal routing before retiring the weekly mailbox-to-CRM source workflow.

### Design
The old design skill remains fallback until the new stack produces at least 6 consecutive accepted outputs meeting the locked QA mix/criteria.

### Marketing routines
Old Claude marketing strategy-authoring routines may retire only after ChatGPT parity for:
- competitor strategic interpretation
- monthly calendar/briefs
- weekly marketing review
- copywriting

### ChatGPT background automation
ChatGPT recurring Marketing Manager jobs still need to be scheduled explicitly in ChatGPT Automations. They are not created merely by these repository files.

## Cutover rule
Cut over module-by-module:
1. freeze source prompt/version;
2. run successor in shadow;
3. compare outputs/side effects;
4. disable source trigger only after pass;
5. keep source trigger available for rollback;
6. delete nothing during first cutover.

## External actions still gated
- paid Vibe export
- client-facing sends
- final proposal/tender submission
- social/publication approval
- explicit permission-status changes in the private Client Reference Register
