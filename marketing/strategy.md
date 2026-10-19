# Linguative Marketing Plan

This is the single source of truth for Linguative's current channel strategy. The marketing-manager agent updates it in place whenever the strategy changes — most often after reading the twice-weekly competitor report (`marketing/competitors/`), the daily sales reports (`marketing/sales-reports/`, written by the Sales Agent — wins/losses, objections, which services/sectors are moving, what messaging worked), during the weekly review, or during the monthly calendar run.

Other Linguative routines and agents (copywriter, designer, publisher, outreach drafting, lead scouting/enrichment) should read the **Strategy changes** section below before acting, so a strategy change reaches them without needing a message between sessions.


## Lead-scouting synchronization protocol

Any strategy change that materially affects **who Linguative should target, how prospects are prioritized, which buyer roles matter, which sectors/markets are in focus, what outreach angle should be used, or what qualification logic applies** is also a lead-scouting input.

Standing rule:
- After such a change is recorded here, it must be propagated to Claude Sales & BD / lead scouting via the live GitHub handoff thread: **issue #35, "Lead scouting: new candidates."**
- Lead scouting should not wait for a separate manual briefing.
- The repository automation should mirror the relevant strategy delta into issue #35 automatically once implemented.
- Until that automation is verified, Claude lead scouting must read this file directly at the start of every run.
- Durable learnings discovered by lead scouting that affect Marketing should flow back into shared context / this strategy process rather than remaining only in a crawler comment.

## Strategy changes

### 2026-10-14 — Embassies & diplomatic missions become a formal account-based outreach segment

**Decision:** Add embassies, diplomatic missions and the EU Delegation in Jordan as a formal priority B2B audience. Treat this as account-based institutional outreach, not a bulk email campaign.

**Why:** Diplomatic missions in Jordan routinely run official meetings, workshops, delegations, development programmes, public-diplomacy events and procurement processes that can require interpretation, translation, conference technology, AV/hybrid support and multilingual event delivery. The fit is directly aligned with Linguative's one-accountable-partner positioning.

**Applies to:** Outreach / institutional buyer messaging / procurement monitoring / website Industries content / SEO-GEO support content.

**Required downstream behavior:**
- Build outreach around verified official mission contacts only; do not guess personal email addresses.
- Prioritize Administration / Procurement / General Services, Public Diplomacy / Culture, Development Cooperation / Programme teams, Economic / Commercial sections, and Protocol / executive offices where appropriate.
- Lead with: **one accountable local partner for the language and technology behind multilingual events in Jordan**.
- Do not lead with "translation agency" positioning.
- Company profile is attached as a real file, not provided only as a Drive link.
- Outreach remains personalized by mission; no bulk-blast copy.
- Initial contact asks to be routed to the correct procurement/vendor-registration path when the public address is general.
- Use `info@linguative.net` for procurement/vendor introductions where possible; use `admin@linguative.net` selectively for senior/personal outreach from Ala. Do not use warmed-up sales/marketing mailboxes for this segment unless Ala changes the rule.
- All embassy outreach emails remain **draft-only until Ala explicitly approves sending**.
- Monitor official embassy/delegation procurement and expression-of-interest pages for relevant interpretation, language, AV, conference-technology and event opportunities. Never submit automatically.
- Client-reference and brand rules remain unchanged.

**Effective:** immediately.

**Evidence/source:** Ala-approved embassy outreach implementation, 14 October 2026.

### 2026-10-14 — Market-response refinement: event continuity, institutional credibility, specialist human language work

**Decision:** Keep Linguative's core positioning unchanged, but sharpen buyer messaging around three themes: **multilingual event continuity and dependable technical delivery**, **institutional/procurement readiness**, and **specialist human language expertise where context, confidentiality and consequences matter**.

**Why:** The October market review found three relevant shifts: regional event organizers are placing greater emphasis on hybrid/remote participation resilience; Arabic-language enterprise AI is moving deeper into corporate and government workflows; and institutional buyers in Jordan are actively engaging qualified local suppliers. None justifies a strategic pivot, but all make generic "translation/interpretation" or "one vendor" claims less distinctive.

**Applies to:** Website / SEO-GEO / content / social / buyer messaging / procurement-facing collateral.

**Required downstream behavior:**
- Preserve the master positioning: **one accountable partner for the language and technology behind multilingual events**.
- Add **event continuity** as a supporting message for Hybrid & Virtual Conference Solutions: multilingual participation should remain dependable when speakers, delegates or plans change. Keep claims tied to confirmed capabilities.
- Show operational proof: real booths, Bosch DICENTIS / Bosch INTEGRUS, signal/distribution workflow, testing, rehearsals, technicians and event-day verification. Avoid generic "breaking language barriers" creative when stronger delivery proof is available.
- Increase institutional-buyer content: capability clarity, service coverage, technical readiness, procurement-friendly FAQs and anonymised/approved case-study proof.
- Translation messaging should not compete with AI on generic speed/scale claims. Explain where specialist human review, terminology control, context, confidentiality and accountability matter; do not frame human and AI as mutually exclusive.
- SEO/GEO content should strengthen buyer-intent themes around hybrid conference solutions in Jordan, remote multilingual participation, conference AV + interpretation technical support, institutional event support, and destination/event planning in Jordan. Treat proposed phrases as content themes unless validated by search data.
- For Arabic Amman targeting, use **عمّان، الأردن** or equivalent disambiguation rather than ambiguous **عمان** alone.
- LinkedIn should carry the strongest procurement/institutional and technical-authority adaptations; GBP should emphasize local service/location relevance; YouTube should prioritize demonstrations and evergreen explainers.
- Do not name clients or use logos/testimonials unless the Client Reference Register and separate permissions allow that use.
- This approval authorizes strategy/calendar/brief updates. Final public assets remain subject to the established content QA/approval gate before publication.

**Effective:** immediately.

**Evidence/source:** Ala-approved competitor and market review, 14 October 2026.

### 2026-09-30 — Measurement, website-builder and production-workflow correction

**Decision:** Treat GA4 as a broken measurement signal until live tagging is repaired; Bricks is the selected website builder; and social creative production is standardized on the local HTML-render workflow for deterministic finished graphics. Adobe Express may be used only when it is useful and reliable, not as a mandatory finishing dependency.

**Why:** Search Console is recording organic visits while the linked GA4 property reports zero sessions/users/events. Ala selected Bricks on 30 September. The prior mandatory Adobe Express assumption conflicts with the proven local design workflow and can block production.

**Applies to:** Website / SEO-GEO / analytics / social creative / publishing workflow.

**Required downstream behavior:**
- Do not interpret GA4 zeroes as zero website traffic while Search Console shows clicks/impressions; flag GA4 as measurement-unreliable until tracking is repaired and validated.
- Website rebuild proceeds in **Bricks**; do not ask Ala to choose Elementor vs Bricks vs a premium theme again.
- Use the local HTML-render pipeline with locked brand assets for deterministic static social designs; preserve exact official logos and approved equipment references.
- Adobe Express is optional rather than a required final step.
- Instagram remains a strategic channel but is not schedulable until its Metricool connection exists.
- LinkedIn's intended publishing destination is the official **Linguative Jordan company page** https://www.linkedin.com/company/linguative/. Ala explicitly confirms it is NOT a personal profile. Metricool's `linkedinData` field returns `urn:li:person:ykKVdfHmOT`; this integration value must not be treated as independent proof of the public post's author. Verify any actual public-post destination if needed, retain the user's existing authorized connection, and never impose a personal-account hold based solely on that field.
- Nothing is published or scheduled without Ala's explicit approval.

**Effective:** immediately.

**Evidence/source:** 30 September 2026 systems check and Ala's direct Bricks decision.

### 2026-09-29 — ChatGPT Marketing Manager takes over October execution

**Decision:** The previous October calendar and briefs are legacy planning input, not the governing marketing plan. October execution is rebuilt under the locked Marketing Bible and ChatGPT Marketing Manager model.

**Why:** The previous plan was created before the final Marketing OS. It used a three-channel model, platform-specific language assumptions, and an older production workflow that conflict with the approved five-channel, rolling-ratio system.

**Applies to:** Social / Content / Creative / GBP / YouTube / Website content reuse / Marketing analytics.

**Required downstream behavior:**
- Use the new ChatGPT-authored `marketing/calendar-2026-10.md` as the October execution calendar.
- Preserve useful factual inputs from older briefs only when they remain accurate; do not inherit their strategic assumptions.
- Five strategic channels: LinkedIn, Instagram, Facebook, Google Business Profile, YouTube.
- Three master concepts per week, adapted by channel.
- Maintain the repeating 10-post sequence so every rolling 10 master concepts remains **70% English / 30% Arabic** and **60% static / 40% video**.
- Marketing starts immediately; migration/parity testing runs in parallel and must not delay content production.
- Client/reference use follows the governed Client Reference Register.
- Final visuals use real approved assets and/or Higgsfield for scene generation, with the local HTML-render pipeline as the default deterministic finishing path; Adobe Express is optional.
- Nothing publishes without Ala's approval.

**Effective:** immediately.

**Evidence/source:** Locked Linguative Marketing Bible / Marketing OS.

### 2026-09-29 — Marketing OS alignment: five channels, rolling language/format ratios, new creative stack

**Decision:** Align downstream marketing execution with the locked Linguative Marketing Bible and ChatGPT Marketing Manager operating model.

**Why:** The previous strategy entry still treated Instagram and YouTube as inactive and used an older platform-by-platform language model. The new Marketing OS uses one master-content system adapted across five channels, with rolling language/format ratios and a controlled creative workflow.

**Applies to:** Social / Content / Website / SEO-GEO / Creative / Marketing analytics.

**Required downstream behavior:**
- Active strategic channels are LinkedIn, Instagram, Facebook, Google Business Profile, and YouTube. If a channel is not technically connected yet, prepare its approved variant but do not claim it was scheduled or published.
- Default output is **3 master content concepts per week**, adapted by channel instead of creating five unrelated calendars.
- Across each rolling 10-post cycle, maintain **70% English / 30% Arabic** and **60% static / 40% video**. Preferred combined matrix: 4 English static, 3 English video, 2 Arabic static, 1 Arabic video.
- Arabic must be written natively in polished professional MSA; do not translate English line-by-line.
- Content priorities rotate across simultaneous interpretation, conference interpretation equipment rental, Bosch DICENTIS, consecutive interpretation, hybrid/multilingual event support, event/AV support, translation/multilingual content, and multimedia/video/event-production support.
- Creative production: ChatGPT concept/copy/creative direction → real approved assets and/or Higgsfield where useful → local HTML-render pipeline for deterministic layout/logo/typography/RTL/finishing; Adobe Express only when useful and reliable → QA → Ala approval → Metricool.
- Generative tools must not redraw or regenerate the logo or invent identifiable equipment.
- Use the governed Client Reference Register before naming any client/reference in proposals, case studies, social, website, testimonials, logo walls, or credentials.
- Marketing performance is judged first by qualified inquiries, quote requests, calls/WhatsApp/DMs, and closed/won attribution; reach/engagement are secondary.
- Nothing is published without Ala's approval unless he explicitly delegates that category later.

**Effective:** immediately.

**Evidence/source:** Linguative Marketing Bible / Marketing OS, approved 2026-09-29.

_Newest entry first. Each entry: what changed, why, and what copy, design, outreach, and lead targeting should now do differently._

### 2026-09-25 — Standing cadence from Oct 4 (confirmed), logo on all posts, October plan

**Confirmed 2026-09-27:** Ala merged draft PR #27 (the October calendar built on this cadence/logo assumption) on 2026-09-25 with no objection — treating both points below as standing, not provisional.

**What changes:**
1. **Cadence after the rebrand week:** the 2026-09-24 entry says "normal cadence resumes 2026-10-04" but never defines "normal". From Sunday 2026-10-04, the standing cadence is **3 posts/week per active platform (LinkedIn, Facebook, Google Business Profile), on Sun/Tue/Thu**. Fri and Sat are left free because they're the Jordanian weekend.
2. **Official logo on every post, not only during the rebrand week.** Ala's "all posts must have the official logo" is read as standing. Use the locked files in `marketing/brand/logos/` per BRAND.md.
3. **Channels briefed:** LinkedIn (English, B2B), Facebook (Arabic-first, local B2B + B2C), GBP (bilingual, local search). Instagram and YouTube are **not active and not briefed** until further notice.
4. **October focus:** Q4 booking (NGO/UN year-end events, Dead Sea conference season). Most of October's revenue effort goes into 1:1 outreach to existing clients and LTA-holding travel agencies/DMCs, within the email warmup limits. See `marketing/calendar-2026-10.md` and `marketing/briefs/2026-10-*.md`.

**Affected and what to do:**
- **Copywriter / Design routines:** work from `marketing/calendar-2026-10.md` and the 16 October briefs. Follow the naming rules in calendar section 6: as a default, don't name any specific client in public-facing copy — get Ala's explicit OK before naming any client, including the media-shortlist event clients. The only equipment brand named is Bosch DICENTIS. No prices, no equipment counts, no "certified translation" claim until Ala confirms accreditation. Arabic type is Cairo/Tajawal until Ala sets an Arabic brand font.
- **Metricool/social-scheduling (publisher) routine:** schedule Sun/Tue/Thu on all three platforms from 2026-10-04. Keep sending Ala the approval email with a link for every post. Nothing goes out unapproved.
- **Outreach-drafting routine:** three October pieces: the Q4 client check-in (5-8 Oct), the post-event follow-up (11-12 Oct), and the LTA/DMC partnership intro (19-22 Oct). Keep to the warmup limits: assume max 3-4 new emails per address per day (max 2/day for cold contacts) until Ala confirms the cap.
- **Monthly-calendar routine:** carry the Sun/Tue/Thu cadence forward unless Ala changes it.

**Why:** routine October planning surfaced a gap. Downstream routines had no defined cadence after 2026-10-03 and no rule on whether the logo requirement continues. The caller directed 3x/week as the default going forward. Ala has not yet confirmed either point.

### 2026-09-24 — Rebranding push, Sept 27–Oct 3

Ala: "Beginning Sunday, all posts should be about rebranding" / "Also, all posts must have the official logo" / "I want to create an animated video about the rebranding" / "Posting schedule should be 3 times a week for all platforms, starting Sunday for 1 week, not 5 days as I said previously" / new posts awaiting his approval must trigger an email notification with a link, sent (not left as a draft).

**What changes:** For one week, Sunday 2026-09-27 through Saturday 2026-10-03, every social post — all channels — is about the rebranding (the brand kit refresh and the in-progress bilingual website rebuild, see `marketing/brand/BRAND.md`), not the usual service/proof-point mix, posting 3 times a week per platform (default Sun/Tue/Thu). Every post in this window must carry the official logo (`marketing/brand/logos/`), placed per BRAND.md — never redrawn or reconstructed. Normal topic rotation and cadence resume 2026-10-04. Whenever a post is created and waiting on his approval, Ala must get a sent email (not a Gmail draft) with a link to it.

**Affected:** Copywriting and Design routines (content for this window), and the Metricool/social-scheduling routine (posting cadence + approval email). Also requested: a short animated video about the rebranding — in progress, not yet a standing routine item.

**Why:** Ala's direct instruction, to drive attention to the rebrand before wider public rollout.

## Current channel strategy

- LinkedIn: B2B authority and institutional credibility.
- Instagram: premium visual discovery; prepare variants, but do not schedule until the Metricool connection exists.
- Facebook: local reach and buyer education.
- Google Business Profile: local search and conversion.
- Embassies & diplomatic missions: formal account-based institutional outreach segment; target procurement/administration/programme/event functions using verified official routes only.
- YouTube: searchable visual authority and evergreen explainers.
- Operating model: three master concepts per week, adapted by channel; rolling 70% English / 30% Arabic and 60% static / 40% video.
- Primary commercial positioning: one accountable premium partner for the language and technology behind multilingual events — interpreters, interpretation technology, hybrid support, AV, and multilingual content.
- Supporting buyer themes: multilingual event continuity; dependable technical delivery; institutional/procurement readiness; specialist human language expertise where context and accountability matter.
- Approval gate: nothing publishes or schedules without Ala's explicit approval.
