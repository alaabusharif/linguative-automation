# 01 — Current System Inventory

Compiled 2026-09-29 for the ChatGPT/Claude role migration. Analysis only — nothing in this folder changes, disables, or retires anything live. Source: `list_triggers` (20 active), `.claude/agents/`, `.claude/skills/`, `.github/workflows/`, `crawler/`, `quotes-system/`, `marketing/`, and this project's shared memory.

Legend for "External side effect": **NONE** (read-only or writes only to the repo/HubSpot/internal state), **DRAFT** (creates a Gmail draft / Google Doc — nothing sent), **SEND** (sends a real email), **WRITE-EXT** (writes to an external system: HubSpot, Drive, a GitHub PR).

---

## A. Scheduled routines/triggers (20, all `enabled: true`)

### 1. Linguative Vendor Registration Reminder
- **Trigger ID:** `trig_01Sad53Z7bWDuxnEFTonVdgh` · **Schedule:** `CRON_TZ=Asia/Amman 53 9 * * 0-4,6` (9:53am Amman, Sat–Thu) · **Session:** `session_01XkYuRkqAyJ8Syy1jKQC55R` ("Google Business Profile fix" thread)
- **Purpose:** Emails Ala a static list of vendor/procurement registration platforms (EU F&T Portal, GIZ, World Bank RFx Now, JONEPS, Cvent, Jordan YP, GALA, Jordan Chamber of Commerce, WTO In-Tend) with direct links, until each is confirmed registered.
- **Inputs:** None external — the list is static, hard-coded in the trigger prompt itself. Explicitly told not to research new items on its own.
- **Outputs:** One sent email per run.
- **External services:** Gmail (send).
- **Files touched:** None.
- **Downstream dependencies:** None.
- **Failure modes:** None beyond Gmail send failure. Self-terminates gracefully if the list is ever edited to empty ("say so and ask whether to stop the routine").
- **Read/write:** Write (send email only).
- **External side effect:** SEND (self-notification to Ala only — pre-authorized standing rule, 2026-09-27).
- **Owner:** none (standalone trigger prompt, no agent/skill).

### 2. Linguative RFQ Watcher
- **Trigger ID:** `trig_013LMbcty4pPPeuYgh8DmnFQ` · **Schedule:** `CRON_TZ=Asia/Amman 50 9 * * 0-4,6` (9:50am Amman, Sat–Thu) · **Session:** `session_01XkYuRkqAyJ8Syy1jKQC55R`
- **Purpose:** Runs the `rfq-watcher` agent (see B.3). Screens formal, dated tenders/RFPs/RFQs/EOIs (distinct from informal leads) for Linguative service fit, deadline, bid-worthiness; flags TIME-SENSITIVE (deadline within ~10 days) immediately.
- **Inputs:** Crawler's tender-portal sources (Jordan GTD, World Bank, EU TED via `crawler/sources.py`), UNGM/other donor boards (WebSearch), HubSpot (dedup check), `marketing/opportunities/`.
- **Outputs:** `marketing/tenders/YYYY-MM-DD.md` (dated report, always written even when empty).
- **External services:** HubSpot (read, dedup), WebSearch/WebFetch, GitHub (reads issue #35 comments).
- **Files touched:** `marketing/tenders/*.md`, reads `crawler/sources.py`, `data/leads/latest.md`.
- **Downstream dependencies:** Feeds `marketing-manager` agent; a bid-worthy tender is flagged "ready for a HubSpot RFQ Deal and Proposal Drafting" but the Deal/proposal itself is not created here.
- **Failure modes:** None beyond WebSearch/WebFetch unavailability for a given source.
- **Read/write:** Read (research) + Write (repo file, GitHub PR implied by daily-lead-review-style commit pattern).
- **External side effect:** NONE routinely; TIME-SENSITIVE escalation posts directly in-thread.
- **Owner:** `.claude/agents/rfq-watcher.md`.

### 3. Linguative Daily Ops Report
- **Trigger ID:** `trig_016rhJocnF3sHmjqv9p1pXmp` · **Schedule:** `CRON_TZ=Asia/Amman 35 7 * * 0-4,6` (7:35am Amman, Sat–Thu) · **Session:** `session_01XkYuRkqAyJ8Syy1jKQC55R`
- **Purpose:** Cross-project daily digest — aggregates `list_triggers` run status (flags FAILED/stuck), every thread's latest activity, open GitHub PRs awaiting merge, new files committed under `marketing/`, Metricool draft/published status, the lead-scouting issue, and anything awaiting Ala's decision anywhere in the project. Explicitly says "not visible from here" rather than guessing when a fact lives only in another session's private context.
- **Inputs:** `list_triggers`, `list_thread_sessions`/`fetch_thread`, GitHub PRs, `marketing/` commit history, Metricool.
- **Outputs:** One sent email, subject "Linguative Daily Ops Report — <date>", bulleted by "What ran / What failed / Waiting on you". Always sends, even a one-line "nothing happened" report.
- **External services:** Gmail (send), GitHub, Metricool.
- **Files touched:** Read-only across the whole repo/project.
- **Downstream dependencies:** None (it's the terminal aggregator). Explicitly told NOT to duplicate the separate Vendor Registration Reminder content.
- **Failure modes:** A source that's silently wrong (e.g. it can't see another thread's private tool state) is explicitly handled by saying "not visible from here."
- **Read/write:** Read (aggregation) + Write (send email).
- **External side effect:** SEND (self-notification, pre-authorized).
- **Owner:** none (standalone trigger).

### 4. Linguative Social Posting (3x/week)
- **Trigger ID:** `trig_01DwEogydkQfukkxzMdPUx7s` · **Schedule:** `0 6 * * 0,2,4` UTC = 9:00am Amman Sun/Tue/Thu · **Session:** `session_01Q2pWZZF1ZX1utCDYbEDhsX` ("Recreate the Linguative routines here")
- **Purpose:** Writes that day's social copy, hands image/posting work to the design pipeline and the GBP thread's Metricool connector; posts drafts for Facebook, LinkedIn, Google Business Profile.
- **Outputs:** `marketing/social-posts/<date>/copy.md`; Metricool scheduled-post drafts.
- **External services:** Metricool (draft creation, not auto-publish), Google Drive (image sourcing).
- **Downstream dependencies:** `linguative-design` skill for visuals; `marketing/strategy.md` for messaging/theme.
- **External side effect:** WRITE-EXT (Metricool draft) — never auto-publishes; Ala approves per project instructions.
- **Owner:** none directly, but reads `marketing-manager`'s calendar/strategy output.

### 5. Linguative after-event follow-up
- **Trigger ID:** `trig_01PCi4J9Fd3ruf2jAgTEq5QC` · **Schedule:** `0 4 * * 6` UTC = 7:00am Amman Saturday · **Session:** `session_011HMD1U41ZNL5H5SGXkPDxk`
- **Purpose:** Finds recently completed jobs/events (HubSpot won/delivered deals + Gmail wrap-up signals), drafts (a) a testimonial ask, (b) a Google review ask (fixed link `https://g.page/r/CQAP6dK-aEBzEBM/review`), (c) a case-study draft — all as drafts, nothing sent. Skips any job with complaint/dispute signals. Never names the event-management/AV channel partner publicly.
- **Outputs:** Gmail drafts (testimonial + review ask), `marketing/case-studies/YYYY-MM-DD-<slug>.md` via draft PR, `marketing/case-studies/testimonial-log.md` (repo-privacy-scrubbed: HubSpot ID/generic sector only, no names).
- **External services:** HubSpot (read), Gmail (draft), GitHub (PR).
- **Downstream dependencies:** Feeds Sales Agent / marketing-manager via `testimonial-log.md`. Explicitly must NOT edit `/mnt/project-files/website/2026-09-23-draft-content-case-studies.md` (owned by the Website thread).
- **External side effect:** DRAFT + WRITE-EXT (PR) + SEND (Ala-notification only, pre-authorized 2026-09-27, with an explicit fallback-to-draft-and-flag rule if the send is ever blocked).
- **Owner:** none directly; reads `marketing-manager`'s strategy and the company reference file.

### 6. Linguative competitor tracking (2x/week)
- **Trigger ID:** `trig_01LMQoxr44t6y4QnN12p8tDm` · **Schedule:** `0 4 * * 0,3` UTC = 7:00am Amman Sun/Wed · **Session:** `session_011cHbQxF3kArSENdnacepiy`
- **Purpose:** Runs the `competitor-analyst` agent (B.2). Updates the 62+-firm Jordan competitor roster and a dated change report, including a marketing/advertising-channel section.
- **Outputs:** `marketing/competitors/roster.md` (updated in place), `marketing/competitors/YYYY-MM-DD.md`.
- **External services:** WebSearch/WebFetch (every claim needs a source link).
- **Downstream dependencies:** Feeds `marketing-manager`'s strategy and opportunity review.
- **External side effect:** NONE (research + repo writes; commits to a fresh branch each run per memory, opens draft PR).
- **Owner:** `.claude/agents/competitor-analyst.md`.

### 7. Linguative Troubleshooting & Fixing
- **Trigger ID:** `trig_019z9H2t9sLQCG8g8AfmdQ8M` · **Schedule:** `0 7 * * 0-4,6` UTC = 10:00am Amman Sat–Thu (right after the 06:17 UTC crawler run) · **Session:** `session_01VHYa2aQnMEXiJr9bxL8L7o` ("Warming up sales and marketing mailboxes")
- **Purpose:** Checks GitHub Actions run failures, works every open GitHub issue except the lead-scouting tracking issue (never closes that one), fixes small/well-understood/safe issues on a new branch + PR, reports anything needing a credential or architectural decision. Never disables a test/check or SSL verification to force a pass. Never merges its own PRs.
- **Outputs:** GitHub PRs/issue comments as needed; a thread reply summary each run.
- **External services:** GitHub (Actions, Issues, PRs).
- **Downstream dependencies:** Explicitly scoped OUT of marketing content/strategy — "never touch marketing content, strategy, or campaign decisions."
- **External side effect:** WRITE-EXT (PR/issue) + SEND (Ala-notification, pre-authorized).
- **Owner:** none (standalone trigger; general engineering maintenance role).

### 8. Linguative Design
- **Trigger ID:** `trig_01E9xFswtc8HE6zqQ8BQQUsd` · **Schedule:** `0 6 * * 1,4` UTC = 9:00am Amman Mon/Thu · **Session:** `session_01Q2pWZZF1ZX1utCDYbEDhsX`
- **Purpose:** Produces visual assets for upcoming social posts. Now standardized on the `linguative-design` skill's local-HTML-render pipeline (built after a shipped design had a missing logo, misaligned text, and no QA pass).
- **Outputs:** A rendered PNG per post, delivered to Ala for approval (never auto-published).
- **External services:** Adobe Stock (licensed photos), Google Drive (Ala's own photo library), Adobe Firefly (fallback only).
- **Downstream dependencies:** `marketing/brand/BRAND.md` (locked logo/colors/fonts), `marketing-manager`'s briefs.
- **External side effect:** SEND (Ala-notification with the draft, pre-authorized) — never posts/publishes.
- **Owner:** `.claude/skills/linguative-design/SKILL.md`.

### 9. Linguative monthly calendar and briefs
- **Trigger ID:** `trig_01LE9Qmu7X4Za3VkvkF8innm` · **Schedule:** `0 6 25 * *` UTC = 9:00am Amman, 25th of month (fixed date, fires regardless of weekday) · **Session:** `session_01VHYa2aQnMEXiJr9bxL8L7o`
- **Purpose:** Runs `marketing-manager`'s calendar responsibility — next month's content calendar + creative briefs.
- **Outputs:** `marketing/calendar-YYYY-MM.md`, `marketing/briefs/YYYY-MM-DD-<slug>.md`.
- **External services:** None beyond WebSearch for event-calendar research.
- **Downstream dependencies:** Feeds Copywriting, Design, Social Posting.
- **External side effect:** NONE (repo writes only).
- **Owner:** `.claude/agents/marketing-manager.md`.

### 10. Linguative weekly marketing review
- **Trigger ID:** `trig_01M6AWd3BfgQTrZxX4qXL3eB` · **Schedule:** `0 6 * * 0` UTC = 9:00am Amman Sunday · **Session:** `session_01VHYa2aQnMEXiJr9bxL8L7o`
- **Purpose:** Runs `marketing-manager`'s weekly-review responsibility — what worked, what didn't, from any results data provided.
- **Outputs:** `marketing/reviews/YYYY-MM-DD.md`.
- **External side effect:** NONE.
- **Owner:** `.claude/agents/marketing-manager.md`.

### 11. Linguative daily lead review
- **Trigger ID:** `trig_014kEpUTKHfpQqgMXqZjxXCN` · **Schedule:** `0 5 * * 0-4,6` UTC = 8:00am Amman Sat–Thu · **Session:** `session_01VHYa2aQnMEXiJr9bxL8L7o`
- **Purpose:** Reads new comments on GitHub issue #35 "Lead scouting: new candidates" (the crawler's only durable output channel — `data/leads/latest.md` is overwritten each run, NOT committed). Ranks opportunities per `marketing-manager`'s "Opportunity review" responsibility. On Sun/Wed also reads the competitor-analyst and Sales Agent's dated reports and decides whether `marketing/strategy.md` needs a dated "Strategy changes" entry.
- **Outputs:** `marketing/opportunities/YYYY-MM-DD.md`, and/or a prepended entry to `marketing/strategy.md`, via a new branch (`marketing/opportunities-YYYY-MM-DD` or `marketing/strategy-YYYY-MM-DD`) + draft PR. Skips the branch/PR entirely if nothing changed.
- **External services:** GitHub (issue read, PR), Gmail (Ala-notification on PR).
- **Downstream dependencies:** This is the mechanism by which `marketing/strategy.md`'s "Strategy changes" log — read by nearly every sales/outreach routine below — gets updated.
- **External side effect:** WRITE-EXT (PR) + SEND (Ala-notification, pre-authorized).
- **Owner:** acts as `marketing-manager` agent for this run (explicitly told to "read CLAUDE.md and .claude/agents/marketing-manager.md first ... act as the marketing-manager agent").

### 12. Linguative Lead Gen
- **Trigger ID:** `trig_01SP4xFgcnKLbVyKCjBaQXX7` · **Schedule:** `30 7 * * 0,1,2,3,4,6` UTC = 10:30am Amman Sat–Thu · **Session:** `session_01Q2pWZZF1ZX1utCDYbEDhsX`
- **Purpose:** Searches for NGO workshops, embassy events, corporate seminars, NGO/research programs in Jordan (outside formal tenders, which RFQ Watcher covers) — for interpretation/translation/AV need AND for transcription/editing/localization/subtitling/dubbing need (Linguative's newer, unproven-except-transcription service lines).
- **Outputs:** HubSpot Company (+Contact if available) per new prospect, with likely-service-need note. Dedups against existing Companies first.
- **External services:** HubSpot (write).
- **Unique rule to preserve exactly:** MUST use `confirmationStatus: "CONFIRMATION_WAIVED_FOR_SESSION"` on every `manage_crm_objects` call in this unattended context — `"CONFIRMED"` is blocked by the auto-mode classifier and silently failed writes from Sept 20–24, 2026 before this was fixed.
- **External side effect:** WRITE-EXT (HubSpot).
- **Owner:** none directly (feeds the Sales & BD pipeline).

### 13. Linguative Copywriting
- **Trigger ID:** `trig_01WqeDnJYdzC7ju5ZSuebkwn` · **Schedule:** `0 6 * * 3` UTC = 9:00am Amman Wednesday · **Session:** `session_01Q2pWZZF1ZX1utCDYbEDhsX`
- **Purpose:** Writes social/email/web copy from `marketing-manager`'s briefs.
- **External side effect:** NONE (repo/draft writes only).
- **Owner:** feeds from `marketing-manager` briefs; not itself an agent file.

### 14. Linguative Proposal Drafting
- **Trigger ID:** `trig_012fhdGyH5U5vSkn2Uaah4aa` · **Schedule:** `45 7 * * 0,1,2,3,4,6` UTC = 10:45am Amman Sat–Thu · **Session:** `session_01Q2pWZZF1ZX1utCDYbEDhsX`
- **Purpose:** Finds HubSpot RFQ-Pipeline deals in stage "New" with Match Type "Full", drafts technical + financial proposals from the rate card (Translation 7 JOD/250 words with retainer tiers; Interpretation 100 JOD/interpreter/day, min. 2; AV always a separate line; Transcription proven/no fixed rate — flag "confirm with Ala"; editing/localization/subtitling/dubbing unpriced — flag "confirm with Ala").
- **Unique rules to preserve exactly:**
  - Every quote is a copy of the master GRPAM 2651 template (`/mnt/project-files/quotes/templates/linguative-master-quotation-template.docx`) — **never edit the master itself**; copy, rename, edit the copy.
  - Always produce a validated `.docx` (Ala's explicit instruction) — a Google Doc alongside is fine but not a substitute.
  - Reference-citation rules: Stokoe Partnership Solicitors (law/litigation sector) and Planet Depos (deposition/court-reporting sector) may be cited as credibility references to OTHER firms in that class — **never to the firm itself**, and never with confidential case specifics.
  - Never name the event-management/AV channel partner in any proposal, ever.
  - Equipment: Bosch DICENTIS/INTEGRUS only; anything else the tender specifies gets flagged "confirm brand/spec with Ala," never selected independently.
  - Deal moves to "Proposal Drafted" stage — never further (never "Submitted") without Ala.
- **Outputs:** `.docx` (+ optional Google Doc) linked to the HubSpot Deal.
- **External services:** HubSpot (read+write stage), Google Drive.
- **External side effect:** WRITE-EXT (HubSpot stage change, Drive file) + SEND (Ala-notification per drafted proposal, pre-authorized) — the proposal itself is never sent to a client.
- **Owner:** none directly (this is the proposal-execution step of the sales pipeline the migration prompt calls out).

### 15. Linguative Outreach Drafting
- **Trigger ID:** `trig_01Ly83L79wjbB3tFzWZY9Wto` · **Schedule:** `0 6 * * 2` UTC = 9:00am Amman Tuesday · **Session:** `session_01Q2pWZZF1ZX1utCDYbEDhsX`
- **Purpose:** Finds HubSpot Contacts/Companies with no logged outreach, drafts personalized cold outreach (fixed English template given verbatim in the prompt; Arabic for local Jordanian lawyers specifically, composed natively, never translated line-by-line).
- **Unique rules to preserve exactly:**
  - Reads `marketing/strategy.md`'s latest "Strategy changes" AND `marketing/sales-reports/` results-tracking before drafting, to weight sector/angle priority (doesn't override hard rules, just weighting).
  - Same Stokoe/Planet Depos citation rule as Proposal Drafting (never to the firm itself).
  - Never name the event-management/AV channel partner in outreach, to anyone, ever.
  - Company profile Drive links: Arabic profile only on new Arabic drafts; English profile on every English draft, new or re-engagement — no exception — included as a sentence in the body, never an attachment (too large for inline attach) and never a bare URL.
  - Equipment: Bosch DICENTIS/INTEGRUS only.
  - Arabic company name always الإبداع اللغوي, masculine verb agreement, never لينقواتيف.
- **Outputs:** Gmail draft, logged as an activity on the HubSpot Contact (updates last-contact date).
- **External services:** HubSpot (read+log activity), Gmail (draft).
- **External side effect:** DRAFT + SEND (one Ala-summary email per run, pre-authorized) — outreach itself never sent without Ala.
- **Owner:** none directly.

### 16. Linguative Sales Agent
- **Trigger ID:** `trig_01HCRnUZLFYVpcHDfhmtVX2L` · **Schedule:** `0 8 * * 0,1,2,3,4,6` UTC = 11:00am Amman Sat–Thu · **Session:** `session_01Q2pWZZF1ZX1utCDYbEDhsX`
- **Purpose:** The most complex routine — daily whole-pipeline management across 8 parts (A–H): prioritized call/email plan with stall thresholds; multi-step follow-up sequences; RFQ→bid-package assembly (mirrors Proposal Drafting but with prices marked "confirm with Ala"); cross-sell/re-engagement scan; call scripts; Saturday-only weekly pipeline forecast; results-tracking roll-up (sent/replied/won by sector/service/language/angle — feeds Outreach Drafting and Copywriting); and recurring-client 90-day check-in drafts (standing rule, ALL current clients incl. the event-management/AV channel partner by name in a **private** check-in, which is allowed — the "never name" rule is about public/outreach-to-others content only).
- **Unique stall thresholds (exact, must be preserved verbatim if merged):**
  - "New" 3+ days, no proposal → needs bid package.
  - "Proposal Drafted" 5+ days, no stage change → follow-up sequence.
  - "Submitted" 10+ days, no stage change → follow-up sequence.
  - Lead, no outreach logged 5+ days after creation → outreach now (doesn't wait for weekly Outreach Drafting).
  - Lead, outreach sent, no reply 10+ days → follow-up sequence.
  - Lead replied, no deal created after 7+ days → recommend "create deal" for Ala.
- **Repo-privacy rule (unique to this routine's output #2):** the in-thread daily plan (output #1) may name clients/contacts/rates freely (not public); the repo file `marketing/sales-reports/YYYY-MM-DD.md` (output #2) must NOT — use HubSpot record IDs or sector/role descriptions only.
- **Outputs:** (1) full daily plan posted in-thread; (2) `marketing/sales-reports/YYYY-MM-DD.md` via PR.
- **External services:** HubSpot (read+note), Gmail (drafts, read for results-tracking), GitHub (PR).
- **External side effect:** WRITE-EXT (HubSpot notes, PR) + DRAFT (follow-ups/re-engagement) + SEND (one summary email per run when something's waiting on Ala, pre-authorized) — never moves a deal to Submitted/Won/Lost, never sends outreach directly.
- **Owner:** none directly — this IS the "Sales Agent" the migration prompt is consolidating around.

### 17. Linguative Lead Contact Enrichment
- **Trigger ID:** `trig_01M3VH8MVdeAtAadkLBFn56j` · **Schedule:** `0 9 * * 1,3,6` UTC = 12:00pm Amman Mon/Wed/Sat · **Session:** `session_01HfscWf1izp3thRw4imdWBF` ("Scout leads for the other services")
- **Purpose:** Finds HubSpot Companies missing a named/verified contact, picks the right persona per company type, explores via Vibe Prospecting (free), then — only after Ala's explicit go-ahead on cost — exports and writes the Contact.
- **Unique rule — credit gate:** `export-to-csv` is the ONLY step that spends Vibe credits and it requires Ala's explicit go-ahead **every time**, shown as a shortlist + exact cost; never called unconfirmed. If credits are too low, this is an expected graceful stop (reply that it's blocked, credits needed vs. available), not a failure.
- **Outputs:** New HubSpot Contact (with phone if found) associated to an existing Company only — never creates a duplicate Company.
- **External services:** Vibe Prospecting (explore free, export paid), HubSpot (write), Gmail (Ala-notification on any go-ahead-needed step, pre-authorized).
- **External side effect:** WRITE-EXT (HubSpot) gated on a human approval every run; SEND (notification only).
- **Owner:** none directly.

### 18. Linguative Institutional & Corporate Lead Scouting
- **Trigger ID:** `trig_012n2rhC8SmsFdosqCVvC1MQ` · **Schedule:** `0 8 * * 1` UTC = 11:00am Amman Monday · **Session:** `session_01HfscWf1izp3thRw4imdWBF`
- **Purpose:** The largest single prompt (9,158 chars) — scouts 10 confirmed institutional/corporate lead classes (banks, law firms, insurers, federations, global corporates, litigation/arbitration firms, deposition agencies, healthcare accreditation bodies, int'l NGOs/UN not yet contacted, major industrial/mining/logistics/port/airport companies) via Vibe Prospecting, each with a specific persona and a growing list of confirmed real companies/personas learned through trial and error (e.g. "APM Terminals" resolves to the wrong global parent; "Jordan Chamber of Commerce" name-search mismatches; always filter `prospect_country_code "JO"` for multinational-adjacent searches).
- **Unique rule — same credit gate as #17** (STEP 3: never export without Ala's explicit go-ahead on real cost).
- **Unique rule:** every new lead class or instruction Ala gives gets folded into this prompt the same turn (standing meta-rule, 2026-09-23) — meaning this prompt is itself a living, hand-tuned knowledge base of what search strategies work and don't, not just a task description.
- **Outputs:** HubSpot Company/Contact/Deal (pipeline "default", stage "New Prospect"), deduped against existing open deals first.
- **External services:** Vibe Prospecting, HubSpot, Gmail (notification).
- **External side effect:** WRITE-EXT (HubSpot) gated on human approval; SEND (notification only).
- **Owner:** none directly.

### 19. Linguative Client Email Responder
- **Trigger ID:** `trig_01FP9U1UvSLTbt4uAWTFfqun` · **Schedule:** `19 * * * 0,1,2,3,4,6` UTC (hourly at :19, Sat–Thu) · **Session:** `session_01Q2pWZZF1ZX1utCDYbEDhsX`
- **Purpose:** Triages linguativ@gmail.com (which also receives admin@/info@/sales@/marketing@) into 5 buckets: spam/phishing, CV, genuine inquiry (drafts a reply), everything-else (skip), tender-portal alerts (skip, RFQ Watcher's job). Never sends. Never permanently deletes (`trash_thread` is 30-day-recoverable, not permanent).
- **Unique escalation rule:** first-time suspicious sender → trash only; repeat sender already trashed by this routine → also `mark_thread_spam` (flagged in the tally as "the closest thing to a block available — there is no true persistent block/filter").
- **Known limitation (must be preserved as a documented gap, not silently dropped):** Gmail's `search_threads` cannot search the Spam folder at all (`in:spam` always returns empty even when Spam has mail) — so Step 1B, restoring wrongly-spam-filtered tender-portal alerts, **cannot currently run**. The routine reports this every run rather than falsely claiming "0 restored." A Gmail filter fix has been proposed to Ala separately and is still pending (see `12-open-questions-for-ala.md`).
- **Outputs:** Gmail drafts (bucket C), Gmail labels ("Review", "CVs") + Drive CV filing, trash/spam actions (bucket A).
- **External services:** Gmail (full read/write except send/permanent-delete), HubSpot (read, to check if a "spam" sender is actually a known client), Google Drive (CV folder).
- **External side effect:** DRAFT + WRITE-EXT (label/trash/spam-mark) — **never SEND, never permanent delete.**
- **Owner:** none directly — this is the "mailbox safety" capability the migration prompt calls out by name (Gap Area C).

### 20. Linguative weekly mailbox → CRM sync
- **Trigger ID:** `trig_012wQ26VAvGPonzwYqBe586s` · **Schedule:** `0 5 * * 1` UTC = 8:00am Amman Monday · **Session:** `session_01Q2pWZZF1ZX1utCDYbEDhsX`
- **Purpose:** Scans the last 14 days of business Gmail for business-relevant threads (RFQ/quote/proposal/interpretation/translation/conference/event/PO/invoice signals), creates/updates HubSpot Company+Contact+Deal for genuinely new organizations.
- **Unique rule — "masked-principal check" (the routine's main reason for existing):** when a thread comes from an intermediary (consulting firm, contractor, travel/MICE/event-logistics agency), look for language naming the real principal/funder behind the request ("on behalf of," "implemented by," "our client is," etc.) and create the HubSpot record for the **real principal**, not just the visible sender. This is exactly the pattern that let International Budget Partnership (IBP) go unrecorded behind a Particip GmbH thread before this rule was added.
- **Unique rule — confirmation status:** same `CONFIRMATION_WAIVED_FOR_SESSION` requirement as Lead Gen (#12), for the same auto-mode-classifier reason.
- **Outputs:** New/updated HubSpot Company/Contact/Deal records; never drafts/sends outreach; never touches existing records beyond filling gaps.
- **External services:** Gmail (read), HubSpot (write).
- **External side effect:** WRITE-EXT (HubSpot).
- **Owner:** none directly.

---

## B. Agents (`.claude/agents/`)

### B.1 `marketing-manager` (model: opus)
Strategy, channel choice per segment, monthly calendar, briefs, opportunity review, weekly review, reacts to competitor-analyst and rfq-watcher reports, and is the sole writer of `marketing/strategy.md`'s dated "Strategy changes" log — the mechanism nearly every sales/outreach routine reads before acting. **Plans and briefs only; never publishes or sends.**

### B.2 `competitor-analyst` (model: opus)
Reports **into marketing-manager, not Ala directly**. Maintains `marketing/competitors/roster.md` and dated reports, tracks marketing/advertising channels per competitor (including Meta Ad Library checks). Every claim needs a source link; never invents client names/pricing/equipment for a competitor.

### B.3 `rfq-watcher` (model: opus, built 2026-09-27)
Reports into marketing-manager except TIME-SENSITIVE items, which escalate directly. Explicitly distinguished from both the crawler (informal leads) and marketing-manager's opportunity review (broad ranking) — this is narrowly formal, dated, deadline-bound tenders only.

---

## C. Skills (`.claude/skills/`)

### C.1 `linguative-design`
The working local-HTML-render → PNG design pipeline (see routine #8). Encodes the full BRAND.md non-negotiables (logo files, exact hex colors, fonts, tagline, contact line, Bosch-only equipment naming, masculine Arabic company name) plus a reusable 1080×1350 layout grid, an image-sourcing priority order (Ala's own photos → linguative.net → Adobe Stock → Firefly last resort), and a mandatory post-export QA checklist (catches the exact failure — missing logo, misaligned boxes, gap in scrim, no contact info — that prompted building this skill).

### C.2 `lead-to-deal`
Turns GitHub issue #35 lead-scouting comments into proposed HubSpot Company+Deal(+Contact), gated on human approval every time. Tracks state in `data/leads/processed_comments.json` (per-comment, per-source-entry outcome) so nothing is proposed twice. Has its own detailed Contact-research confidence-tier system (`verified (3+ sources)` / `likely (2 sources)` / `unverified`) — never pattern-guesses an email.

### C.3 *(retired, not live)* WebFetch-based lead-scouting skill
Removed 2026-09-19 after confirming the sandboxed session's network egress policy blocks WebFetch for every external site, not just the 5 original targets (a Wikipedia control test also failed) — this could never have worked inside a Claude Code session. Replaced by the crawler (Section D), which runs on unrestricted GitHub Actions runners. Listed here for completeness per the "preserve every useful capability" instruction, even though it is already gone — no capability was lost, since the crawler is a superset.

---

## D. GitHub Actions / crawler

### D.1 `.github/workflows/lead-scouting.yml`
Runs `crawler/run.py` daily at 06:17 UTC on a normal GitHub-hosted runner (unrestricted network — this is explicitly why it exists as a separate system from anything running inside a Claude Code session). Restores prior snapshots from the `lead-scouting-data` branch (durable store, since the Actions cache alone evicts after 7 days of inactivity). Posts findings as a comment on the open issue labeled `lead-scouting` (title "Lead scouting: new candidates", currently #35), creating the issue if it doesn't exist. Alerts the same issue on a crawl crash. Uses `FIRECRAWL_API_KEY` and `RELIEFWEB_APPNAME` repo secrets.
- **Downstream dependents:** RFQ Watcher, daily lead review, `lead-to-deal` skill, Troubleshooting & Fixing (reads "Sources that failed to fetch").

### D.2 `crawler/` (Python package)
- `sources.py` — the source list: 12 org/portal sources (chambers, cultural institutes, embassies, NGOs, conference orgs, training providers) plus 4 tender portals, 3 of which are API-driven (`world_bank`, `reliefweb`, `ted`) via `api_sources.py`. Carries hand-diagnosed `known_issue` notes per source (e.g. Ifpo Amman removed for an unfixable broken SSL cert chain; ReliefWeb 403s until `RELIEFWEB_APPNAME` is set to an approved name).
- `run.py` — entry point; diffs each source against its last snapshot, tags new content against `services.py`'s keyword lists, extracts contacts (`contacts.py`), writes `data/leads/latest.md` (not committed — `.gitignore`'d).
- `fetch.py`, `contacts.py`, `services.py` — fetch/diff logic, contact-info regex extraction, service-line keyword tagging.
- **Never talks to HubSpot directly** — by design, a human (or `lead-to-deal`) reviews and decides.

---

## E. Quotes & Invoices system (`quotes-system/`)

Node.js/Express app. `server.js`, `routes/{auth,clients,documents,items,ocr,users}.js`, `middleware/auth.js` (session-based), `db/db.js` (SQLite, gitignored `.db` files), `db/seed-items.json`. `.env.example` documents `PORT`, `SESSION_SECRET`, bootstrap `ADMIN_USERNAME`/`ADMIN_PASSWORD` — the real `.env` is gitignored, never committed. Deployed live at `tools.linguative.net` via FastPanel on AxenCloud (not reachable by its own domain yet — pending DNS, see project status report). Generates GRPAM-2651-format quotes/invoices from a Clients table + item-autocomplete. **This is a live production engineering asset**, independent of any Claude routine's schedule — it does not run on a trigger, it is a standing web service Ala and staff use directly.
- **Downstream dependency (pending):** HubSpot CRM sync for the Clients table — not yet built.

---

## F. Marketing files (`marketing/`)

`brand/` (BRAND.md + 3 logo files — 2 approved, 1 old/superseded, see Section 8 security/brand audit), `briefs/`, `calendar-2026-10.md`, `case-studies/`, `competitors/`, `drive-media-catalog-2026-09-25.md`, `media-shortlist-2026-09-24.md`, `reviews/`, `sales-reports/`, `social-posts/`, `strategy.md` (the dated "Strategy changes" log every sales/outreach routine reads), `tenders/`.

---

## G. External integrations (cross-cutting, not owned by any one routine)

- **HubSpot** — CRM of record for the whole Sales & BD lifecycle (Companies/Contacts/Deals, RFQ Pipeline). Every unattended write uses `confirmationStatus: "CONFIRMATION_WAIVED_FOR_SESSION"`.
- **Gmail (linguativ@gmail.com, receiving admin@/info@/sales@/marketing@)** — read/triage (Client Email Responder), drafts (Outreach, Proposal, Sales Agent, after-event), sends (only self-notifications to Ala, standing pre-authorization 2026-09-27; nothing client-facing is ever sent unattended).
- **Vibe Prospecting** — prepaid-credit-gated prospecting/enrichment layer for Lead Contact Enrichment and Institutional & Corporate Lead Scouting; explore is free, export always needs Ala's explicit per-run go-ahead.
- **Metricool** — social scheduling (drafts only), read via GBP thread's connector, referenced by Daily Ops Report.
- **Google Drive** — CV filing, company-profile links for outreach, image sourcing for design, quote/report delivery.
- **GitHub** — every content change (marketing files, agent/skill/routine fixes) goes through a branch + draft PR; nothing pushes to `main` directly except the crawler's own data-branch snapshot mechanism (D.1), which is data, not code.

## H. Hidden/undocumented dependencies worth flagging
- `marketing/strategy.md`'s "Strategy changes" log is a **de facto message bus**: at least 5 routines (Outreach Drafting, Proposal Drafting, Sales Agent, Lead Contact Enrichment, Institutional & Corporate Lead Scouting, daily lead review) read it every run. Any new marketing-strategy system (ChatGPT) MUST either keep writing to this exact file/format, or every one of those routines needs to be repointed — this is the single biggest cross-cutting dependency in the whole system.
- `marketing/sales-reports/YYYY-MM-DD.md`'s results-tracking breakdown is read by Outreach Drafting and Institutional & Corporate Lead Scouting to weight targeting — same bus pattern, smaller blast radius.
- The lead-scouting GitHub issue (title-matched, not number-matched, because it gets renumbered after periodic cleanup) is read by 4 different consumers (RFQ Watcher, daily lead review, `lead-to-deal`, Troubleshooting & Fixing) — all of them look it up by title+label, never a hardcoded number, which is the correct pattern and should be preserved by any successor.
- `/mnt/project-files/linguative-company-memory.md` (outside the repo, private) is the actual source of truth for client names/history/rates that the public repo is not allowed to contain — referenced by name in at least 6 routine prompts.
