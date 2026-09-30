# 12 — Open Questions for Ala

Everything below needs your decision before cutover can proceed. Numbered for reference from the other documents.

1. **`marketing/strategy.md` hand-off.** Five-plus Sales & BD routines read this file's dated "Strategy changes" log before acting. Once ChatGPT owns strategy, should ChatGPT (a) write to this exact file/format directly, (b) have Claude Code translate ChatGPT's output into this format each cycle, or (c) should every consuming routine be repointed to a new location? This is the single biggest cross-cutting dependency in the whole system (see `01` §H) and blocks retiring `marketing-manager` cleanly.

2. **weekly mailbox → CRM sync ownership.** Its output is CRM writes (Sales & BD territory) but the migration brief lists it under Operations Monitor. Which role should own it? (Recommendation in `03` Gap B: Sales & BD, with Daily Ops Report still surfacing its results — but this is your call.)

3. **Client Email Responder's Spam-search limitation.** The Gmail tools available to this routine cannot search the Spam folder at all, so it cannot currently restore wrongly-spam-filtered tender-portal alerts. You were sent the manual steps for a Gmail filter fix (from ungm.org, EU/GIZ/World Bank/JONEPS domains, direct to Inbox) separately — has that filter been added yet? Until it has, this gap stays open regardless of the migration.

4. **`linguative-design`'s QA checklist.** Should its 5-point post-export QA checklist be explicitly reused as the acceptance test for Adobe Express Premium/Higgsfield output, or do you want a fresh QA process defined for the new stack? (Recommendation: reuse it — it exists because of a specific past failure mode that could recur in any export-based pipeline.)

5. **Centralizing brand/identity rules now, independent of the rest of the migration.** The masculine Arabic company-name rule, the Bosch-only equipment rule, and the the event-management/AV channel partner naming rule are currently duplicated across 3–4 routine prompts each. Recommend moving them into `CLAUDE.md` now (low-risk, immediately useful, doesn't require the rest of the migration to be approved first) — do you want this done as a standalone small PR ahead of the full migration?

6. **Instagram.** The migration brief's channel list for ChatGPT's Marketing Bible includes Instagram, but it isn't currently connected in Metricool. Do you want it connected before the new marketing system goes live, or should Instagram stay out of scope for now?

7. **HubSpot webhook/workflow support.** The event-driven automation plan (`07`) proposes HubSpot-triggered (rather than schedule-triggered) firing for Proposal Drafting and after-event follow-up. Does your current HubSpot plan support outbound workflow webhooks? If not, these stay on their current schedules.

8. **GitHub webhook subscription capability.** Similarly, `07` proposes an event-driven Troubleshooting & Fixing trigger on workflow failure/new issue. Does this project's Claude Code trigger system support subscribing to GitHub repo events directly, or only cron? This needs a direct answer from whoever manages the trigger infrastructure, not something this analysis pass could confirm on its own.

9. **Lead Contact Enrichment cadence vs. interruption trade-off.** Converting it to fire immediately when a new Company is created (instead of 3x/week) would mean more frequent Vibe credit-approval prompts to you, not fewer. Do you want that trade, or is the current 3x/week batching preferable?

10. **Historical client-name spot-check in `marketing/`.** This audit checked current file contents but not the full commit history for every `marketing/` file. Do you want a full `git log -p` sweep run to confirm nothing ever leaked and was later removed (still recoverable from history), or is the current-state check sufficient for your comfort with the repo staying public?

11. **Git-history secrets sweep.** Similarly, do you want a one-time full-history scan for any credential ever committed and later removed? Current-HEAD is clean; history was not exhaustively checked in this pass.

12. **DIHR payment / tools.linguative.net DNS / website builder choice** — unrelated to this migration directly, but still open per the last status report; flagging here so they don't get lost in this document's focus on the ChatGPT handoff specifically.
