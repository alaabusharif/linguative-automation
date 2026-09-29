# Marketing Strategy Handoff Contract

## Decision

Keep `marketing/strategy.md` as the stable compatibility message bus.

**New owner: ChatGPT — Linguative Marketing Manager.**

This avoids forcing 5+ downstream consumers to learn a new location or requiring Claude Code to translate ChatGPT's strategy into a second format.

## Write model

ChatGPT writes public-safe strategy changes directly to this file through GitHub.

A strategy update is an internal marketing-management action, not an external publication. The file must not contain private client names unless publicly approved, contacts, private rates, confidential tender details, credentials or secrets.

Sensitive strategy stays in the private Marketing OS and is represented here only by the operational instruction downstream automation needs.

## Required format

Newest entry first under `## Strategy changes`.

Each entry:

```md
### YYYY-MM-DD — Short decision title

**Decision:** What changes.

**Why:** Evidence/reason.

**Applies to:** Sales & BD / Social / Website / SEO-GEO / Outreach / Lead targeting / Other.

**Required downstream behavior:**
- concrete instruction 1
- concrete instruction 2

**Effective:** date/time or "immediately".

**Evidence/source:** public-safe source or internal aggregate; omit private details.
```

## Ownership boundaries

### ChatGPT may change
- channel priorities
- content/message angles
- service emphasis
- target-sector emphasis
- social cadence/content mix
- SEO/GEO content priorities
- website marketing priorities
- competitor-response strategy

### ChatGPT does not change through this file
- approved rates
- Vibe spend gates
- CRM confirmation semantics
- proposal master-template mechanics
- safety/privacy constraints
- technical runtime settings
- deal-stage submission rules

Those are operational controls and require their own governed source.

## Sales → Marketing return path

Sales & BD Operations continues writing public-safe aggregated results to `marketing/sales-reports/`.

ChatGPT reads those reports and may update strategy. It must not infer causation from small samples.

## Daily lead review change

The successor Sales & BD qualification module owns opportunity ranking. It no longer authors marketing strategy. Marketing-relevant patterns flow through sales reports; ChatGPT alone decides whether they warrant a strategy change.

## Compatibility

During parallel testing, old routines continue reading `marketing/strategy.md` unchanged. This lets the old and new systems share the same strategy bus without a translation layer.
