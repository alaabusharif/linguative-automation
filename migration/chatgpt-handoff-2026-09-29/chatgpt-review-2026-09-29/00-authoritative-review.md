# ChatGPT Review — Authoritative Corrections

Date: 2026-09-29
Status: design/review only; no live trigger, schedule, agent, or skill is disabled by this package.

## Purpose

The Claude handoff package in `migration/chatgpt-handoff-2026-09-29/` is retained as the factual inventory and source-capability extraction. This review corrects its end-state architecture.

The central correction is:

> A unique capability must be preserved. It does **not** follow that the routine that currently contains it must remain forever.

The target is consolidation with capability parity, not a lift-and-shift relabeling of the current 20 routines.

## Decisions

1. **ChatGPT is the Linguative Marketing Manager.** It owns brand, marketing strategy, SEO, GEO, website marketing/UX/CRO, content, social strategy, competitor interpretation, reputation, and marketing analytics.
2. **Claude Code is the Web & Automation Engineer.** It owns website implementation, technical SEO, schema, automation, integrations, infrastructure, crawler maintenance, quotes-system engineering, and debugging.
3. **Sales & BD Operations becomes one consolidated owner with modular run modes.** The current Lead Gen, daily lead review opportunity-ranking, Institutional & Corporate Scouting, Contact Enrichment, Outreach Drafting, Sales Agent, Proposal Drafting, after-event follow-up, and lead-to-deal capabilities are merged into this owner. Old routines stay live only for parity testing and rollback until each module has passed.
4. **Operations Monitor becomes one operational owner.** RFQ/tender monitoring, mailbox triage, vendor reminders, daily status, CRM-sync monitoring, and engineering alerts are grouped here. The existing rfq-watcher remains a specialist sub-capability because formal tenders are materially different from general prospecting.
5. **`marketing/strategy.md` remains the compatibility message bus.** ChatGPT becomes its owner and writes the same dated Strategy changes format directly. Downstream sales routines do not need a second translation layer.
6. **The private Linguative Marketing Bible is the canonical marketing/brand policy.** Repo files such as `marketing/brand/BRAND.md` and `CLAUDE.md` are public-safe operational mirrors/subsets for Claude. They must not become a competing canonical source.
7. **The old design skill is not a permanent production requirement.** Its useful QA and deterministic exact-logo lessons are migrated into the new design QA gate. The skill is archived only after the new stack proves parity.
8. **No cutover occurs from this review alone.** It defines the successor structure and tests only.

## What the previous package got right

- It extracted capability-level rules instead of relying only on routine names.
- It identified the `marketing/strategy.md` dependency correctly.
- It preserved the Vibe credit gate, CRM confirmation mode, proposal template rules, pipeline thresholds, masked-principal logic, mailbox limitations, and RFQ/crawler scope boundary.
- It correctly protected the crawler and quotes system from marketing migration.
- It correctly required parallel testing and non-destructive rollback.

## What this review changes

The previous retirement list marked several Sales/BD routines as "DO NOT RETIRE — UNIQUE CAPABILITY." That classification is replaced with:

> **MERGE INTO SALES & BD OPERATIONS; RETIRE SOURCE ROUTINE ONLY AFTER MODULE-LEVEL PARITY.**

The unique capability is what is protected, not the historical container.

## Non-negotiable migration rule

No source routine may be disabled until:
1. every unique rule it contains is present in the successor module;
2. its inputs/outputs and side effects are mapped;
3. the successor passes its module-specific parity test; and
4. rollback remains possible.
