# 07 — Event-Driven Automation Review

Per the migration brief: identify routines that should move from blind schedules to condition/event-driven behavior. **Recommendations only — no schedule changes made or implied by this document.**

## Assessed candidates

### Proposal Drafting → event: a qualified RFQ/opportunity requires a proposal
**Current:** daily scan (Sat–Thu, 10:45am Amman) of all HubSpot RFQ-Pipeline deals in stage "New" with Match Type "Full."
**Recommendation:** keep the daily scan as a safety net, but add a same-day trigger fired when a Deal's Match Type flips to "Full" (a HubSpot workflow/webhook, if the HubSpot plan supports it) so a same-day tender doesn't wait for the next 10:45am run. **Exact replacement:** a HubSpot workflow enrollment trigger on "Match Type changes to Full" that calls the same routine. Needs confirmation the current HubSpot plan/connector supports outbound webhooks (Open Questions #7) — until confirmed, the daily schedule stays as the only mechanism.

### After-event Follow-up → event: an actual event has finished
**Current:** weekly (Saturday) scan for jobs completed in roughly the last 14 days.
**Recommendation:** the *detection* mechanism (HubSpot deal-stage change to Won/Delivered, or a Gmail wrap-up-signal search) is itself already close to event-driven in spirit — it's really "poll weekly for an event that happened," not "act on a schedule regardless of events." A cleaner event trigger would be a HubSpot deal-stage-change webhook to "Closed Won"/whatever the actual won-stage is (the prompt notes the exact stage ID isn't hardcoded and should be checked live). **Exact replacement:** HubSpot stage-change webhook, same open question as above (#7). Until confirmed, weekly polling is a reasonable, low-risk cadence to keep.

### Troubleshooting & Fixing → GitHub issue/alert-driven queue
**Current:** daily (Sat–Thu, right after the crawler) full scan of all GitHub Actions run failures and all open issues.
**Recommendation:** this is the strongest candidate for actual event-driven conversion — GitHub natively supports `workflow_run` (on failure) and `issues: opened` webhook triggers. **Exact replacement:** a new GitHub Actions workflow (or a Claude Code trigger subscribed to repo webhooks, if this project's trigger system supports GitHub event subscriptions — needs a capability check, Open Questions #8) that fires Troubleshooting & Fixing immediately on a workflow failure or new issue, rather than waiting up to 24 hours. Keep the daily scan as a catch-all for anything the event trigger missed (e.g. an issue opened by a human outside a workflow context).

### Lead Contact Enrichment → trigger after lead qualification / enrichment queue
**Current:** 3x/week (Mon/Wed/Sat) scan for HubSpot Companies missing a verified contact.
**Recommendation:** could trigger immediately when Lead Gen, weekly mailbox → CRM sync, or Institutional & Corporate Lead Scouting creates a new Company with no Contact — i.e. chain directly off the other routines' output rather than polling 3x/week. **Risk:** this would increase Vibe credit-gate prompts to Ala from "up to 3x/week" to "every time a lead is created," which may be more interruption, not less — this is a genuine trade-off, not a clear win, and should be Ala's call (Open Questions #9), not a default recommendation.

### Vendor Registration Reminder → condition/weekly cadence instead of daily once appropriate
**Current:** daily (Sat–Thu).
**Recommendation:** agreed — once Ala confirms even one or two platforms registered, the daily cadence stops earning its keep for those items. **Exact replacement:** switch to weekly (e.g. Monday 9:53am Amman) once the list has shrunk below, say, half its current entries, or once no new registration has happened in 2+ consecutive weeks. This is explicitly Ala's list to edit per the routine's own existing rule ("if Ala tells you he's completed one, drop it... on the next send by editing this trigger's prompt") — the cadence step-down should follow the same pattern: a prompt edit, not a code change, whenever Ala says the list is getting short.

## Explicitly NOT recommended for event-driven conversion

- **Client Email Responder** — already effectively near-real-time (hourly), converting to a Gmail push-notification webhook would add complexity (needs a webhook receiver/pub-sub setup) for marginal latency improvement over hourly. Not worth it.
- **Daily Ops Report** — inherently a daily digest by design; event-driven would defeat its purpose as a single daily summary.
- **Sales Agent** — its value is precisely in aggregating the *whole* pipeline once a day into one prioritized plan; converting to event-driven would fragment that into many small alerts, which the routine's own design (a single daily plan, not a stream of nudges) argues against.
- **Institutional & Corporate Lead Scouting, Lead Gen** — these are discovery/research routines with no natural "event" to trigger on; weekly/daily cadence is appropriate.
- **RFQ Watcher** — already near-real-time (9:50am Amman daily, right alongside the crawler); the crawler itself is the real bottleneck (once-daily at 06:17 UTC) and is out of scope for this review (it already runs on the fastest cadence that makes sense for the sites it polls).

## Preconditions before implementing any of the above

None of these are implemented by this document. Each would need:
1. Ala's explicit approval (schedule/trigger changes are covered by the "do not change schedules until approved" rule).
2. A capability check on whether this project's trigger system can subscribe to external webhooks (HubSpot, GitHub) rather than only cron — **this needs a direct answer from whoever manages the Claude Code trigger infrastructure**, flagged in Open Questions #8.
3. A short trial period per routine before fully replacing its schedule, per the same discipline as `09-parallel-test-plan.md`.
