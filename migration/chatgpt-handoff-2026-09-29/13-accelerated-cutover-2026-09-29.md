# 13 — Accelerated Marketing Cutover — 2026-09-29

Executed same-day on Ala's explicit instruction ("Accelerated Marketing
Cutover — execute now", 2026-09-29T19:58:50Z, migration thread), ahead of
the full parallel-test window described in `09-parallel-test-plan.md` /
`chatgpt-review-2026-09-29/06-revised-retirement-and-test-plan.md`. This
document is the record required by that instruction's item 9
(Documentation) and item 10 (Final response).

**Scope:** disable jobs that now conflict with the live ChatGPT Marketing
OS. Sales/BD, Operations, Engineering, crawler, and quoting functions were
explicitly left untouched. Disable, not delete — every prompt is preserved
for rollback.

## Jobs disabled

| Trigger ID | Name | Cron (UTC) | Disabled at | Why | Replacement owner | Rollback |
|---|---|---|---|---|---|---|
| `trig_01LMQoxr44t6y4QnN12p8tDm` | Linguative competitor tracking (2x/week) | `0 4 * * 0,3` | 2026-09-29 ~20:00 UTC | Competitor strategic interpretation now belongs to ChatGPT Marketing Manager | ChatGPT Marketing Manager | `enabled: true` via update_trigger restores it; prompt unchanged in place |
| `trig_01LE9Qmu7X4Za3VkvkF8innm` | Linguative monthly calendar and briefs | `0 6 25 * *` | 2026-09-29 ~20:00 UTC | Monthly calendar/briefs authorship now belongs to ChatGPT Marketing Manager | ChatGPT Marketing Manager | same |
| `trig_01M6AWd3BfgQTrZxX4qXL3eB` | Linguative weekly marketing review | `0 6 * * 0` | 2026-09-29 ~20:00 UTC | Weekly marketing review now belongs to ChatGPT Marketing Manager | ChatGPT Marketing Manager | same |
| `trig_01WqeDnJYdzC7ju5ZSuebkwn` | Linguative Copywriting | `0 6 * * 3` | 2026-09-29 ~20:00 UTC | Copywriting now belongs to ChatGPT Marketing Manager | ChatGPT Marketing Manager | same |
| `trig_01E9xFswtc8HE6zqQ8BQQUsd` | Linguative Design | `0 6 * * 1,4` | 2026-09-29 ~20:00 UTC | Stops as primary creative producer | ChatGPT + Higgsfield + Adobe Express Premium | same; `.claude/skills/linguative-design/SKILL.md` kept as archived fallback/reference (exact-logo handling, export-fidelity QA preserved) |
| `trig_01DwEogydkQfukkxzMdPUx7s` | Linguative Social Posting (3x/week) | `0 6 * * 0,2,4` | 2026-09-29 ~20:00 UTC | **Paused**, not retired — built around the old Claude calendar/brief workflow; must not keep reading legacy briefs or scheduling outdated content | PAUSED pending Metricool execution-only refactor (approved-content intake, Metricool scheduling, platform execution, status reporting) — content strategy/copywriting/content selection/calendar/visual concept decisions move to ChatGPT Marketing OS before this is restored | `enabled: true` restores it as-is (still on the old workflow) — must be repointed to ChatGPT Marketing OS outputs and current approval workflow before actually restoring |

Verified via `list_triggers`: all six now show `enabled: false`.

## Prompt change (not a disable) — strategy-authorship removed

**`trig_014kEpUTKHfpQqgMXqZjxXCN`, "Linguative daily lead review"** stays
**active** (Ala's explicit "do NOT stop" list). Its prompt read
`marketing/strategy.md` and, on Sunday/Wednesday runs, could decide to
prepend a strategy-change entry to it based on competitor/sales reports —
that authorship path is removed. Its opportunity-ranking / pipeline-triage
logic (reading the lead-scouting GitHub issue, ranking candidates,
opening a PR to `marketing/opportunities/YYYY-MM-DD.md`) is preserved
unchanged, now explicitly under Sales & BD Operations.

**Mechanism:** this trigger is bound to a different persistent session
(`session_01VHYa2aQnMEXiJr9bxL8L7o`) than this thread's. A routine's
prompt can only be edited from the routine's own session/thread, so the
exact replacement prompt was relayed to that session via `send_message`
with the full text to apply verbatim via `update_trigger`, along with a
request to confirm back once done. **Status: DONE.** That session
independently verified Ala's cutover instruction directly in the project
thread before acting (since it arrived as a cross-session relay rather
than a coordinator relay with a verified citation), then applied the
prompt exactly as proposed. Confirmed via `get_trigger`:
`trig_014kEpUTKHfpQqgMXqZjxXCN` `updated_at` is now `2026-09-29T20:02:51Z`,
`enabled: true`, and its stored prompt no longer contains any step that
writes to `marketing/strategy.md` — steps 1/3/4/6/7 of the old prompt
(reading competitor/sales reports to decide strategy changes, prepending
entries to `marketing/strategy.md`) are gone; the lead-scouting-issue
lookup and opportunity-ranking/PR steps are preserved. No fallback edit
was made to `marketing/strategy.md` itself; ChatGPT continues to own that
file directly.

`marketing/strategy.md` can no longer be overwritten by any Claude
marketing routine: the five routines that could write to it via the old
marketing-manager workflow are disabled, and the one that could write to
it via the daily-lead-review path no longer does.

The `.claude/agents/marketing-manager.md` agent file (source of the
channel-strategy/calendar/briefs/weekly-review/strategy-logging
responsibilities the five disabled routines invoked) was **not deleted** —
a superseded banner was added at the top marking those responsibilities
superseded, while explicitly noting responsibility #4 (opportunity review)
is NOT superseded and continues under Sales & BD Operations. This keeps
the file as rollback/history per the "disable, don't delete" rule.

## Jobs explicitly left untouched

Per Ala's "do NOT stop these jobs" list, no schedule or prompt change was
made to: Lead Gen, Institutional & Corporate Lead Scouting, Lead Contact
Enrichment, Outreach Drafting, Proposal Drafting, Sales Agent, after-event
follow-up, `lead-to-deal`, RFQ Watcher, Client Email Responder, weekly
mailbox → CRM sync, Daily Ops Report, Vendor Registration Reminder,
Troubleshooting & Fixing, the lead-scouting crawler/GitHub Actions, or the
quotes/invoices system. Confirmed still `enabled: true` via `list_triggers`
(see table below).

## Dependency check

- The disabled Design routine (`trig_01E9xFswtc8HE6zqQ8BQQUsd`) was the
  only producer feeding the paused Social Posting routine
  (`trig_01DwEogydkQfukkxzMdPUx7s`) with images; since Social Posting is
  now also paused, this dependency is inert, not broken.
- Copywriting (`trig_01WqeDnJYdzC7ju5ZSuebkwn`) wrote to the "Linguative
  Content" Google Doc that both Design and Social Posting read from — same
  situation: all three are now paused/disabled together, so no dangling
  read against a stale doc will happen unattended.
- No Sales/BD, Operations, Engineering, crawler, CRM, or quotes-system
  routine reads from the five disabled marketing routines' outputs as a
  hard input (they read `marketing/strategy.md`, `marketing/competitors/`,
  and `marketing/sales-reports/` as soft context, tolerating "no new
  entry" already). No broken dependency found.
- Full trigger enabled/disabled state as of this run is in
  `list_triggers` output; not reproduced in full here to avoid duplicating
  data that can drift — see live state via `list_triggers` rather than
  trusting this table if significant time has passed.

## Legacy marketing files

Not deleted. `marketing/strategy.md`'s history and every existing
`marketing/calendar-*.md`, `marketing/briefs/*.md`, `marketing/reviews/*.md`
and `marketing/competitors/*.md` file stays as historical reference. The
current authoritative source for calendar/strategy is whatever ChatGPT
Marketing OS produces going forward via direct writes to
`marketing/strategy.md` and `marketing/calendar-2026-10.md`; anything
written by the now-disabled Claude routines before this cutover should be
read as historical, not as active instruction. A blanket per-file legacy
banner was not added to every existing dated file (dozens of files, no
functional effect since nothing reads them as live instructions once their
authoring routines are disabled) — flagging this scoping choice rather
than silently expanding the task; say if per-file banners are wanted too.

## Safety rules followed

Disable, not delete, throughout. No trigger was deleted. No change was made
to the crawler, the quotes/invoices system, HubSpot logic, Vibe Prospecting
spend gates, proposal rules, RFQ Watcher, or mailbox safety behavior.
Nothing was published or sent.
