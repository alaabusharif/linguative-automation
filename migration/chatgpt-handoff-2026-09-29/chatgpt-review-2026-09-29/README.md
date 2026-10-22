# ChatGPT Review of the Migration Package — 2026-09-29

This subfolder holds ChatGPT's review and correction of the Claude-authored
migration package in the parent folder (`migration/chatgpt-handoff-2026-09-29/`,
merged via PR #45). Ala forwarded these 10 documents on 2026-09-29 with no
separate instruction text; they are incorporated here as a corrective layer,
not a replacement.

**Relationship to the original package:** the original 12 documents
(`01`–`12` in the parent folder) are retained as-is — they are the factual
inventory and capability extraction, and ChatGPT's review confirms they got
that part right (see `00-authoritative-review.md`, "What the previous
package got right"). What this review corrects is the **end-state
architecture**: several routines the original package marked
"DO NOT RETIRE — UNIQUE CAPABILITY" are reclassified as "MERGE INTO SALES &
BD OPERATIONS; RETIRE SOURCE ROUTINE ONLY AFTER MODULE-LEVEL PARITY." The
central principle: a unique *capability* must be preserved; it does not
follow that the routine that currently contains it must remain forever.

Pointer notes have been added to the top of `03-gap-register.md` and
`11-retirement-list-DRAFT.md` in the parent folder linking here, without
changing their original content.

**Status: design/review only.** No live trigger, schedule, agent, or skill
is disabled by this package, and no cutover occurs from this review alone.
`09-proposed-strategy-update.md` in this folder is explicitly staged for
when the ChatGPT strategy handoff is activated — it has NOT been applied to
the live `marketing/strategy.md` file.

## Documents

1. `00-authoritative-review.md` — the corrections and decisions, and what the original package got right
2. `01-target-architecture.md` — the 4-role target architecture in full
3. `02-sales-bd-consolidation-spec.md` — Sales & BD Operations, 13 modules (A–M)
4. `03-operations-monitor-spec.md` — Operations Monitor, modules A–F, routing table
5. `04-strategy-handoff-contract.md` — `marketing/strategy.md` ownership contract for ChatGPT
6. `05-brand-governance-and-design-qa.md` — brand hierarchy and the expanded 18-point design QA gate
7. `06-revised-retirement-and-test-plan.md` — module-level parity testing and retirement classifications
8. `07-open-questions-resolved.md` — resolutions to 10 of the original 12 open questions
9. `08-pretest-blockers.md` — 9 items to address before the parallel test is meaningful
10. `09-proposed-strategy-update.md` — the strategy.md entry staged for activation (NOT yet applied)

## Note on redaction

One client name in the source documents (the event-management/AV channel
partner under the standing confidentiality rule) has been replaced below
with the repo's established generic description, consistent with the
private Client Reference Register (`/mnt/project-files/client-reference-register.md`).
The same name previously appeared unredacted in the parent folder's merged
package (PR #45); those files have now been scrubbed to match.
