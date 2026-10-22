# Revised Retirement and Test Plan

## Principle

Protect capabilities, not historical routine boundaries.

No source routine is retired merely because a new agent exists. No source routine is kept forever merely because its capability was once unique.

## Phase 0 — Current state
All current routines continue running. This package changes no live behavior.

## Phase 1 — Build successors
Create Sales & BD Operations, Operations Monitor, ChatGPT strategy handoff, and Marketing/design QA governance. No trigger changes.

## Phase 2 — Shadow tests by module

### Marketing
Compare ChatGPT against competitor strategic interpretation, monthly calendar/briefs, weekly review and copywriting.

### Design
Run new stack and old design pipeline in parallel until the expanded QA threshold is met.

### Sales & BD
Shadow successor modules against source routines: prospect discovery, qualification, enrichment, institutional scouting, outreach, pipeline/follow-up, proposal, after-event, and lead-to-deal state/audit behavior.

### Operations
Shadow mailbox safety behavior, masked-principal CRM routing, RFQ escalation and engineering alert routing.

## Module-level pass criteria

A module passes only if:
1. same eligible inputs are found;
2. no unique hard rule is missing;
3. no duplicate or unsafe side effect appears;
4. outputs are at least as usable;
5. approvals/spend gates are preserved;
6. public-repo privacy discipline is preserved;
7. rollback source remains available.

## Retirement classifications

### Keep as specialist/standing systems
- rfq-watcher specialist logic
- crawler and GitHub workflow
- quotes/invoices system
- Daily Ops function
- vendor-registration tracking until task completes
- public/private brand guide mirrors
- lead-to-deal helper may remain callable if it is the cleanest stateful implementation

### Migrate to ChatGPT, then retire old authoring routine after parity
- competitor strategic interpretation
- monthly calendar and briefs
- weekly marketing review
- Copywriting
- marketing-manager strategic responsibilities
- design authoring routine/skill after design QA parity

### Merge into Sales & BD Operations, then retire source routine after module parity
- Lead Gen
- daily lead review opportunity-ranking half
- Institutional & Corporate Lead Scouting
- Lead Contact Enrichment
- Outreach Drafting
- Sales Agent
- Proposal Drafting
- after-event follow-up

These are **not** "DO NOT RETIRE." Their hand-tuned rules are do-not-lose rules.

### Merge into Operations Monitor / Engineering
- Client Email Responder mechanics
- weekly mailbox → CRM detection/routing
- Troubleshooting monitoring half
- Engineering fixes remain Engineering

## Test duration

Use module-level evidence rather than a blind calendar-only rule.

Minimum:
- marketing/copy: 2 normal weekly cycles plus one monthly-calendar generation
- design: 6 consecutive accepted outputs meeting the QA mix
- daily Sales modules: at least 10 eligible run days
- weekly Sales modules: at least 2 eligible occurrences
- proposal: at least 2 real or synthetic representative cases, including one unpriced/confirm-with-Ala case
- Vibe scouting/enrichment: at least 2 approved runs without duplicate/spend-gate regression
- mailbox: at least 7 days, with synthetic edge cases if natural traffic does not exercise the rules

## Cutover

Cut over module-by-module.

For each source:
1. freeze its prompt/version as rollback evidence;
2. enable successor module;
3. disable source trigger, do not delete;
4. observe;
5. re-enable immediately if parity fails.

Delete nothing during initial cutover.

## True blockers

Only these prevent a source routine from retiring:
- exact prompt/knowledge has not been captured;
- successor module lacks a source capability;
- approval/spend/privacy gate is missing;
- state/audit behavior cannot be reproduced;
- parity test fails.

A missing webhook feature is **not** a blocker; existing schedules can remain during consolidation.
