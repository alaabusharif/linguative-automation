# 04 — Proposed Final Architecture

This is a **proposal for Ala to approve**, not a description of anything already changed. Nothing below is live.

## The four roles (as defined in the migration brief)

### 1. ChatGPT — Linguative Marketing Manager
Owns: brand strategy, social/content strategy, English/Arabic copy, SEO/GEO strategy, website messaging strategy, CRO, competitor intelligence (strategic interpretation), analytics interpretation, campaign planning, reputation strategy, marketing governance.

Does **not** own: pipeline triage of inbound leads (stays Sales & BD — see Gap A), the mechanics of posting/scheduling (Metricool execution stays with whoever executes — see below), or anything client-facing that needs Ala's approval regardless of who drafted it.

### 2. Claude Code — Web & Automation Engineer
Owns: website implementation (WordPress/code), technical SEO implementation, schema, performance, integrations, scripts, GitHub workflows, debugging, infrastructure automation, and the quotes/invoices system. Implements what ChatGPT specifies; never independently decides brand/content/SEO strategy; flags technical/usability concerns but final marketing decisions are ChatGPT/Ala's.

### 3. Sales & BD Operations
Owns the full lead-to-deal lifecycle: prospecting (incl. Vibe Prospecting), qualification, enrichment, prioritization, outreach operations, follow-up, proposal execution support, CRM/deal handling, after-event commercial follow-up. **Run by Claude Code** (there is no separate "Sales & BD" system/product today — this is an organizational grouping of the 9 routines in Capability Matrix Group 1, not a new piece of software).

### 4. Operations Monitor
Owns: RFQ/tender monitoring, mailbox triage, operational alerts, CRM synchronization (see Gap B for the mailbox-sync ownership question), vendor-registration tracking, status reporting. **Also run by Claude Code.**

## What this means concretely (today, nothing changes yet)

Both "Sales & BD Operations" and "Operations Monitor" are Claude-Code-run roles — the actual reorganization is: (a) ChatGPT takes over marketing-strategy authorship, replacing the `marketing-manager` and `competitor-analyst` agents' strategic function; (b) the 20 existing triggers get relabeled/regrouped under the 4 roles for clarity, without their schedules, prompts, or code changing during the test window; (c) the `linguative-design` skill's local-render pipeline steps back to fallback status behind Adobe Express Premium + Higgsfield, once proven.

## Website / SEO-GEO handoff (as specified in the migration brief, restated here as the target)

**ChatGPT defines:** sitemap, page intent, keyword/topic target, metadata, H1/content hierarchy, copy, FAQ, internal links, schema requirements, CTA, EN/AR relationship.

**Claude Code implements:** WordPress/code, semantic HTML, schema, hreflang, canonicals, sitemap/robots, redirects, Core Web Vitals, image optimization, responsive behavior, accessibility, integrations. Does not rewrite approved copy unless explicitly asked.

This handoff standard does not exist yet in practice — the website rewrite is still blocked on Ala's builder choice (Elementor/Bricks/premium theme) per the current status report. Recommend this standard becomes the operating model the moment that choice is made, rather than retrofitted later.

## Social/marketing rules ChatGPT's Marketing Bible will control (target state, once proven)

- 3 master content concepts/week; EN/AR 70/30 across each rolling 10-post cycle; static/video 60/40 across each rolling 10-post cycle.
- Channels: LinkedIn, Instagram, Facebook, Google Business Profile, YouTube. (Note: Instagram is not currently connected in Metricool — see Open Questions #6.)
- Arabic must be native, robust, professional, free of generic AI-style filler — **this is not new**; the exact same standard is already enforced by name ("ARABIC COPY QUALITY," Ala 2026-09-27) in the Outreach Drafting routine today. ChatGPT inherits an existing bar, not a new one.
- Final design stack: ChatGPT strategy → approved assets/Higgsfield → Adobe Express Premium → QA → Ala approval → Metricool. The "QA" step here should explicitly reuse `linguative-design`'s 5-point post-export checklist (Gap E) rather than being invented fresh.
- No automatic posting without Ala's approval until separately authorized — **already the standing rule today** (Social Posting routine only drafts to Metricool); no change needed.

## Cross-cutting rules that apply regardless of which role owns a task (must not be lost in any handoff)
- Masculine Arabic company name (الإبداع اللغوي).
- Bosch DICENTIS/INTEGRUS-only equipment naming.
- Never state or imply freelancer/subcontractor delivery.
- the event-management/AV channel partner: never named publicly; may be named in a private communication addressed directly to them.
- The two approved logo variants only (see `08-security-audit.md`).
- Nothing is published, sent, or submitted without Ala's approval (the one rule every single routine in this project already follows).

See `03-gap-register.md` for why these are currently scattered across routine prompts and the recommendation to centralize them in `CLAUDE.md`.
