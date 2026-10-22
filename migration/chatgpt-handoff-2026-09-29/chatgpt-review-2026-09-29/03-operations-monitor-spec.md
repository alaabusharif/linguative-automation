# Operations Monitor — Consolidation Specification

## Purpose

Create one operational owner for monitoring, classification, escalation and status reporting while preserving specialist logic.

## Modules

### A. Formal RFQ/tender monitor
Use the existing `rfq-watcher` specialist logic.

Keep the hard boundary:
- formal, dated RFQ/RFP/tender/EOI with procuring entity + deadline = RFQ Watcher
- informal event/activity/organization signal = Sales prospecting/crawler

Preserve source link, deadline, duplicate check, bid-worthiness, partner flagging where appropriate, approximately 10-day TIME-SENSITIVE escalation, and the no-submit/no-contact rule.

The `rfq-watcher` agent may remain as a specialist helper under Operations Monitor rather than being rewritten.

### B. Daily operations digest
Aggregate routine/automation failures, relevant PRs/issues, crawler health, social state, lead/tender queues, and items waiting for approval.

Preserve the honesty rule: when a source is not visible, say "not visible from here" instead of guessing.

### C. Mailbox triage
Preserve the five-bucket logic and the known Spam-search limitation.

**Safety change adopted for the successor:**
- suspicious/unknown first offense → label for review, do not auto-trash
- repeated confirmed spam may be escalated only under an explicit safe rule
- never permanently delete
- never send automatically
- known client check before spam classification
- tender-alert mail is not handled as ordinary spam; route/leave for RFQ workflow

### D. Vendor registration tracking
Keep the platform checklist and stop/removal behavior as registrations are confirmed. Cadence can step down later, but no cadence change is required for consolidation.

### E. Mailbox → CRM monitoring
Operations Monitor detects candidate business threads and routes the business interpretation/write to Sales & BD Operations.

The **masked-principal heuristic is mandatory**: when an intermediary writes on behalf of a real principal/funder, the CRM record must represent the real principal where the evidence supports it.

### F. Engineering alerts
Operations Monitor detects failed Actions, crawler-source failures, and new actionable issues. Claude Code Engineering owns the fix.

The current Troubleshooting routine can remain as a fallback scan while an issue-driven queue is introduced. No webhook dependency is required for initial consolidation.

## Routing table

| Signal | Destination |
|---|---|
| Formal tender/RFQ | Sales & BD after Operations qualification |
| Informal lead | Sales & BD |
| Business email / CRM opportunity | Sales & BD |
| Spam/CV/admin email | Operations |
| GitHub/crawler failure | Engineering |
| Marketing/content issue | ChatGPT Marketing Manager |
| Approval required | Ala |

## Approval rule
Monitoring may be autonomous. External sending, paid Vibe export, final submission, and other existing human-gated actions remain gated.
