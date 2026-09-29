# Target Architecture

## 1. ChatGPT — Linguative Marketing Manager

### Owns
- Brand strategy and governance
- Marketing strategy and priorities
- SEO strategy
- GEO / AI-search visibility strategy
- Website sitemap, page intent, content, UX and CRO direction
- English and native Arabic marketing copy
- Social content strategy and calendar
- LinkedIn, Instagram, Facebook, Google Business Profile, YouTube strategy
- Creative direction and design QA
- Competitor intelligence interpretation
- Marketing analytics and experimentation
- Reputation/review strategy
- Case-study strategy
- Marketing collateral messaging
- Campaign planning

### Writes
- `marketing/strategy.md` — compatibility strategy bus for downstream automation
- Public-safe marketing plans/briefs where useful
- Sensitive strategy remains in the private Marketing OS

### Does not own
- CRM pipeline execution
- Vibe credit-consuming exports
- Proposal-file generation mechanics
- Website code
- Technical SEO implementation
- Automatic client-facing sends

## 2. Claude Code — Web & Automation Engineer

### Owns
- Website implementation
- WordPress/theme/plugin/code work
- Arabic RTL implementation
- Technical SEO
- Schema, hreflang, canonicals, redirects, XML sitemap, robots
- Core Web Vitals/performance
- Accessibility implementation
- Integrations and scripts
- GitHub Actions
- Crawler engineering
- Quotes/invoices system
- HubSpot technical integration
- Hosting/DNS/SSL engineering
- Debugging and safe fixes

### Operating rule
Implements approved specifications. It may flag technical concerns, but it does not independently rewrite approved brand, marketing, SEO or website copy.

## 3. Sales & BD Operations — one owner, modular lifecycle

Lifecycle:

**Discover → qualify → enrich → prioritize → outreach → follow-up → opportunity/deal → proposal → event/delivery signal → after-event follow-up → reactivation → learning**

This is one owner with multiple run modes, not one giant monolithic prompt and not nine disconnected agents.

### Modules
1. Prospect discovery
2. Institutional/corporate scouting
3. Qualification and opportunity ranking
4. Lead-to-deal preparation
5. Contact enrichment
6. Outreach drafting
7. Pipeline/stall management
8. Follow-up sequences
9. Proposal/bid-package drafting
10. Cross-sell/reactivation
11. Recurring-client check-ins
12. After-event follow-up
13. Forecasting/results tracking

### Shared state
- HubSpot
- `marketing/strategy.md`
- `marketing/sales-reports/`
- GitHub lead-scouting issue and processed-comments state
- Private company reference for rates/clients
- Vibe Prospecting where applicable

### Approval boundaries
- Vibe paid export: explicit per-run approval
- Lead/Deal creation where existing skill requires approval: preserve human gate
- Client-facing send/submission: never automatic
- Deal stage beyond approved internal drafting states: never automatic

## 4. Operations Monitor — one operational owner

### Owns
- Formal RFQ/tender monitoring and escalation
- Daily operations digest
- Mailbox triage
- Vendor-registration tracking
- CRM-sync monitoring
- GitHub/crawler failure alerts
- Routing issues to Sales or Engineering

### Specialist boundary
The rfq-watcher remains a specialist module because formal dated procurement notices have different qualification/deadline logic from ordinary prospecting.

### Mailbox/CRM ownership
Operations Monitor may detect and classify; **Sales & BD Operations owns business CRM interpretation and writes** when a message creates or materially changes a sales opportunity.

## 5. Cross-role interfaces

### Marketing → Sales
Canonical public-safe handoff: `marketing/strategy.md`.

### Sales → Marketing
`marketing/sales-reports/` contains public-safe aggregated learnings: sector/service/language/angle response patterns, objections, outcomes, and pipeline patterns without exposing private client data.

### Marketing → Engineering
A page/feature specification contains: intent, copy, metadata, internal links, schema requirements, CTA, EN/AR relationship and acceptance criteria.

### Operations → Sales
Qualified tender/opportunity or business signal, with source and urgency.

### Operations → Engineering
Reproducible incident or failed workflow, with evidence.

## 6. Canonical-source hierarchy

1. Ala's explicit current instruction
2. Private Linguative Marketing Bible / Marketing OS for brand and marketing policy
3. Private company reference for client/rate/company facts
4. Repo public-safe operational guides (`CLAUDE.md`, `marketing/brand/BRAND.md`, `marketing/strategy.md`)
5. Individual routine/module prompts

If lower layers conflict with higher layers, lower layers must not override them.
