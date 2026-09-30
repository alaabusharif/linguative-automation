# Open Questions — Resolved Operating Decisions

This resolves the design questions from the Claude handoff wherever the existing record is sufficient, without asking Ala for decisions that can be made conservatively without external side effects or spending.

## 1. marketing/strategy.md handoff
**Decision:** ChatGPT writes to the existing file/format directly. No translator layer. Existing consumers keep the same path.

## 2. weekly mailbox → CRM sync ownership
**Decision:** Operations Monitor detects; Sales & BD Operations owns business interpretation and CRM writes. Daily Ops reports the outcome.

## 3. Spam-folder limitation
**Decision:** keep it documented. Successor mailbox safety uses label-for-review rather than trash-on-first-offense. The inability to search Spam is not falsely reported as "nothing found." A manual Gmail filter may improve this later, but it is not a migration blocker.

## 4. design QA
**Decision:** reuse the old skill's proven export-fidelity checks, expand them into the Marketing Bible QA gate, and make the new gate canonical. Do not keep the old skill active merely to preserve the checklist.

## 5. brand rules in CLAUDE.md
**Decision:** centralize only a public-safe operational subset in `CLAUDE.md` / `BRAND.md`. The private Marketing Bible remains canonical. This avoids competing sources of truth.

## 6. Instagram
**Decision:** Instagram is in scope for the new marketing system. Metricool connection is an implementation prerequisite, not a strategy question. Until connected, create/approve the Instagram variant but do not pretend it was scheduled.

## 7. HubSpot webhooks
**Decision:** not required for consolidation. Keep current scheduled polling as a safety net. Event-driven triggers are a later optimization if supported.

## 8. GitHub webhooks
**Decision:** not required for consolidation. Keep the current scan; Engineering may add native event triggers later if useful.

## 9. Contact Enrichment cadence
**Decision:** keep the current batched cadence initially to control interruptions and Vibe spend prompts. Revisit from measured workload.

## 10. Historical client-name scan
**Decision:** current-state audit is not enough to claim the full public history is clean. Run a dedicated history review when practical. Do not block architecture migration on it; do not make an unqualified "repo history is clean" claim until complete.

## 11. Git-history secret scan
**Decision:** same as #10. Current HEAD being clean is not proof that history never contained a secret. Full-history scan is recommended before making that claim.

## 12. Client payment follow-up / tools DNS / website builder
**Decision:** remove from migration blockers. Track separately in operations/engineering backlog.

## Additional decision — public repository
No visibility change is made by this migration. Operational/business-sensitive knowledge that does not need to be public should not be migrated into the public repo merely for convenience.
