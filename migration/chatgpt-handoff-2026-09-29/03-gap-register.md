# 03 — Gap Register

Every capability marked anything other than a clean KEEP in `02-capability-matrix.md`, with why the new 4-role structure doesn't yet cover it cleanly, the proposed bridge, and the test needed before cutover. No item here is "safe to retire" until its bridge is built and tested.

---

## Gap A — Sales & BD merge (migration prompt Gap Area A)

**At risk:** the full find → qualify → enrich → prioritize → outreach → follow-up → opportunity → proposal → CRM/deal → event → after-event lifecycle currently spans 9 separate trigger prompts + 1 skill, each hand-tuned with its own edge-case rules (see Capability Matrix Group 1, items 1–19).

**Why the new structure doesn't cover it yet:** "Sales & BD Operations" is named as a role in the migration prompt but does not exist yet as a single owner — today it's 9 independent schedules that happen to compose into a lifecycle because they all read/write the same HubSpot pipeline and the same `marketing/strategy.md` / `marketing/sales-reports/` files.

**Proposed bridge:** do NOT collapse these into one giant routine immediately. Instead:
1. Keep all 9 triggers running exactly as-is through the parallel-test window (`09-parallel-test-plan.md`).
2. Define "Sales & BD Operations" as a **named owner label** applied to all 9 in the architecture doc (`04`), without changing their schedules or prompts yet.
3. Only after parallel testing confirms no functional loss, consider actually merging prompts — and even then, merge by copy-paste-and-reconcile (every unique rule preserved), never by picking one and discarding the others, per the migration prompt's explicit rule.

**Specific sub-gaps found during extraction:**
- **Opportunity ranking** (Capability Matrix #36) is currently *inside* the marketing-manager agent's responsibilities, but its actual function (triaging inbound leads into bid/partner/outreach/skip) is Sales & BD work, not brand/content strategy. If marketing-manager retires wholesale to ChatGPT, this specific responsibility needs an explicit new home — it should NOT go to ChatGPT, since ChatGPT's role per the migration prompt is "content strategy," not pipeline triage. **Bridge: this responsibility moves to Sales & BD Operations, executed by Claude Code, reading the same GitHub issue #35 it reads today.**
- **`marketing/strategy.md` and `marketing/sales-reports/` are a de facto message bus** read by 5+ Sales & BD routines. If ChatGPT becomes the new source of strategy, either (a) ChatGPT needs to write to this exact file/format, or (b) every consuming routine needs to be repointed to wherever ChatGPT's strategy actually lives. **Bridge: define one canonical strategy hand-off document/location before any marketing routine is retired** (see Open Questions #1).
- **Vibe credit-gating discipline** (never export without Ala's real-cost go-ahead) appears identically in 2 routines (#6, #7) — must be preserved in whatever the consolidated Sales & BD owner becomes; this is a spend-control safety rule, not incidental.

**Test required before any retirement:** parallel-test criteria #1–#6, #9, #10 in `09-parallel-test-plan.md` (no missed leads/RFQs, no lost enrichment/CRM updates/proposal logic, no missed follow-ups, no duplicate outreach).

---

## Gap B — Operations Monitor merge (migration prompt Gap Area B)

**At risk:** RFQ Watcher, Daily Ops Report, Client Email Responder, weekly mailbox → CRM sync, Vendor Registration Reminder, plus ad-hoc issue/status monitoring (Troubleshooting & Fixing's monitoring half).

**Why the new structure doesn't cover it yet:** "Operations Monitor" is a named role but two of its candidate members are genuinely dual-purpose:
- **Weekly mailbox → CRM sync** is equally a Sales & BD capability (it creates Deals) and an Operations capability (it's a mailbox-triage/sync job). The migration prompt lists it under Operations Monitor (Gap Area B) but its output is CRM writes that overlap with Sales & BD's territory.
- **Troubleshooting & Fixing** is split between monitoring (checking Actions/issues — Operations) and actually fixing code (Engineering). The migration prompt's own Gap Area D doesn't list it, but Gap Area B mentions "any issue/status monitoring" — ambiguous which half goes where.

**Proposed bridge:**
- Weekly mailbox → CRM sync: recommend **Sales & BD Operations owns it** (its output is pipeline data), but Operations Monitor's Daily Ops Report should still surface its results (as it already does implicitly by reading `marketing/` commits and thread activity). This needs Ala's decision — flagged in Open Questions #2.
- Troubleshooting & Fixing: **split its two halves** — the monitoring/reporting half (check Actions, review issues, report what needs a human) becomes Operations Monitor; the actual code-fix-and-PR half becomes Engineering. In practice this may still be one routine run by Claude Code (both roles are Claude Code's), so the split may be conceptual rather than requiring two separate triggers. Recommend keeping it as one routine but documenting it under both roles in the architecture doc.

**Preserving the crawler/RFQ-Watcher distinction (explicit migration-prompt requirement):** already cleanly separated today — crawler = informal/undated leads via GitHub Actions; RFQ Watcher = formal/dated tenders via the `rfq-watcher` agent. No gap here; this distinction is already correctly implemented and should be called out as **DO NOT CHANGE**, not just preserved.

**Time-sensitive escalation:** RFQ Watcher's TIME-SENSITIVE flag already bypasses marketing-manager and posts directly in-thread. This pattern should be the model for any other urgent escalation the new architecture needs — no gap, but worth replicating.

**Test required:** parallel-test criteria #1 (no missed RFQs), #7 (no broken crawler), #9 (no missed follow-ups from mailbox sync).

---

## Gap C — Mailbox safety (migration prompt Gap Area C)

**At risk / required change:** the migration prompt explicitly asks for a **behavior change**, not just preservation — spam/phishing should be "labelled for review rather than permanently deleted automatically" unless Ala explicitly authorizes deletion later.

**Current state (verified from the live trigger prompt):** Client Email Responder already does NOT permanently delete — `trash_thread` moves to Gmail Trash, which is 30-day recoverable, explicitly documented in the prompt as "never a permanent delete." A repeat offender additionally gets `mark_thread_spam`. So the current behavior is already close to what's asked, but not identical: a first-time clear phishing/spam case is auto-trashed (recoverable, but still an unprompted action) rather than only labelled.

**Gap:** the migration prompt wants even the first-trash action to become "label for review" by default, with deletion (even recoverable trashing) requiring Ala's explicit authorization.

**Proposed bridge:** change STEP 2A in the Client Email Responder prompt so that:
- Confident spam/phishing → apply a "Review — likely spam" label (not trash), leave in place.
- Only trash/mark-spam if Ala has separately authorized auto-deletion (not yet given, per this audit).
This is a **prompt-only change**, no code/schedule change required. Recommend making this change immediately (low risk, matches the migration prompt's explicit ask) rather than waiting for the full migration, but only with Ala's sign-off since it changes live inbox behavior.

**Also preserve as-is (not gaps, already correct):**
- CV labeling + Drive filing.
- Existing-client protection (never touch a thread from a known client without review).
- The documented Spam-folder search tool limitation (Step 1B) — this is a real, currently-unfixable gap in available tooling, not a design gap. It must stay documented, not silently dropped, until Ala's proposed Gmail filter fix is confirmed live (see Open Questions #3).
- Never auto-reply to tender-alert emails.

**Test required:** parallel-test criterion #11 (no unexpected email deletions/replies) — this is the most safety-critical single test in the whole plan.

---

## Gap D — Engineering/automation (migration prompt Gap Area D)

**At risk:** crawler, GitHub Actions, quotes/invoices Node.js app, HubSpot integrations, DNS/SSL/server work, future website implementation, technical SEO, schema, performance, debugging, automation scripts.

**Why the new structure doesn't cover it yet:** it mostly already does — this is the cleanest gap area. The crawler, quotes-system, and GitHub Actions maintenance are already Claude-Code-owned and don't depend on the marketing-manager agent or ChatGPT at all.

**Gap found:** the quotes-system's planned HubSpot CRM sync (client list) is **not yet built** — it's listed as pending work in the current status report, not a migration gap per se, but worth noting here since the migration prompt calls the quotes system a "live engineering asset [that] must not be disrupted." Recommend the migration itself makes zero changes to `quotes-system/` — confirmed no capability there needs bridging.

**No test required for retirement** — nothing in this group is being retired; it's already correctly scoped to Engineering/Claude Code.

---

## Gap E — `linguative-design` skill (migration prompt Gap Area E)

**At risk:** the deterministic HTML-render → PNG technique and its mandatory QA checklist, if the skill is deleted before the new ChatGPT/Adobe Express Premium/Higgsfield stack is proven.

**Why the new structure doesn't cover it yet:** Adobe Express Premium + Higgsfield is the *proposed* new primary stack but has not yet shipped a single post through it in this project. The `linguative-design` skill exists specifically because a prior Adobe-Express-based attempt shipped a design with a missing logo, misaligned text, a gap in the shading overlay, and no contact info — i.e. the exact failure mode the new stack risks repeating if it inherits the same "trust the export, don't verify the output" pattern.

**Proposed bridge:** per the migration prompt's own instruction — do not delete; archive as fallback; preserve the exact-logo rendering technique; **and additionally, port the post-export QA checklist itself (not just the fallback code) to whatever verifies Adobe Express Premium/Higgsfield output**, since that checklist is the actual lesson learned, independent of which rendering engine is used. This last point is not explicitly asked for in the migration prompt but follows directly from why the skill exists — flagging it as a recommendation for Ala's decision (Open Questions #4).

**Test required before "recommend whether it can be removed entirely":** several successful posts through the new stack, each checked against the same 5-point QA checklist (logo, text-box alignment, overlay coverage, contact line, photo crispness/relevance) this skill already defines — reuse the checklist as the acceptance test, don't invent a new one.

---

## Gap F — Marketing routines (migration prompt Gap Area F)

**At risk:** marketing-manager agent, competitor-analyst agent, monthly calendar/briefs routine, weekly marketing review routine, Copywriting routine, Design routine, Social Posting routine, marketing-side competitor tracking.

**Why the new structure doesn't cover it yet:** ChatGPT's "Marketing Bible" is referenced in the migration prompt (3 concepts/week, 70/30 EN/AR, 60/40 static/video, channel list, native-Arabic requirement, Express Premium → QA → Ala approval → Metricool pipeline) but does not exist yet as a running system in this project — there is nothing to test parity against today.

**Unique rules at risk of being lost if these routines retire before ChatGPT's system demonstrably covers them:**
- The **masculine Arabic company-name grammar rule** (الإبداع اللغوي, never لينقواتيف, masculine verb agreement) appears independently in at least 4 different routine prompts (Client Email Responder, Outreach Drafting, Proposal Drafting, and implicitly the design skill's brand rules). This is a company-identity fact, not a marketing-strategy opinion — **it must survive the migration regardless of who owns content strategy**, and should be written into the shared `CLAUDE.md`/company-reference file (not just scattered across soon-to-retire routine prompts) so no successor system can lose it by omission.
- The **equipment-brand restriction** (Bosch DICENTIS/INTEGRUS only, everything else generic) — same pattern, appears in 3+ places, should be centralized rather than retired with the routines that currently state it.
- The **Guarantee-Travel-Group naming rule** (never public, but named directly is fine in a private check-in to them) — same pattern.
- Competitor-analyst's **source-link discipline** ("never invent a client name, pricing, or equipment brand for a competitor — say 'not publicly stated'") is a research-integrity rule that should transfer to whatever runs competitor research next, even if ChatGPT ends up owning the strategic interpretation.

**Proposed bridge:** before retiring any of these, extract the 3–4 cross-cutting company-identity/brand rules above out of individual routine prompts and into `CLAUDE.md` (which is read by every agent regardless of role) — this decouples them from the marketing routines' fate entirely. This is a small, low-risk, high-value fix that can happen independently of the rest of the migration (see `12-open-questions-for-ala.md` #5 for a recommendation to do this now).

**Test required:** none of these can be marked "safe to retire" until ChatGPT's Marketing Bible has run for the full parallel-test window and produced calendar/brief/review output that a human judges equivalent — this is inherently a qualitative test, not a code test (see `09-parallel-test-plan.md`).

---

## Summary: nothing in this register is cleared for retirement yet

Every gap above has an open bridge, an open test, or an open question for Ala. Per the migration prompt's own rule, no agent/routine/skill moves from this register to "safe to retire" in `11-retirement-list-DRAFT.md` until its specific bridge is built and its specific test passes.
