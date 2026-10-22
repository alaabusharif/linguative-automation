# 06 — Agent & Skill Migration Map

## Agents (`.claude/agents/`)

| Agent | Proposed role | Status | Notes |
|---|---|---|---|
| `marketing-manager` | ChatGPT absorbs the strategic responsibilities (channel strategy, calendar, briefs, weekly review); **opportunity-ranking responsibility moves to Sales & BD Operations, not ChatGPT** (see Gap A) | RETIRE AFTER TEST, **partial** — the file cannot simply be deleted; its "opportunity review" section needs to be extracted into a Sales & BD-owned prompt/doc first | Its "Log strategy changes for downstream agents" responsibility (writing `marketing/strategy.md`'s dated log) must have a successor — either ChatGPT writes to this same file/format, or every downstream reader (5+ routines) is repointed. Undecided — Open Questions #1. |
| `competitor-analyst` | ChatGPT absorbs strategic interpretation; roster-maintenance mechanics (WebSearch loop + `marketing/competitors/roster.md` format) can stay Claude-Code-run if Ala wants automated data collection to continue even after ChatGPT owns the strategy read of it | ARCHIVE (mechanics) / RETIRE AFTER TEST (strategic interpretation) | Source-link discipline (never invent a competitor fact) should transfer to whatever runs this next |
| `rfq-watcher` | Operations Monitor | KEEP | Not in scope for migration — explicitly an engineering/ops capability, not marketing |

## Skills (`.claude/skills/`)

| Skill | Proposed role | Status | Notes |
|---|---|---|---|
| `linguative-design` | Fallback behind Adobe Express Premium + Higgsfield | ARCHIVE (not retire) until parallel-tested across several posts | Preserve the exact-logo rendering technique AND the 5-point post-export QA checklist — the checklist is the more important artifact to carry forward, since it's what catches silent Express-export failures regardless of which stack produces the export |
| `lead-to-deal` | Sales & BD Operations | KEEP | Unaffected by the marketing migration; continues gating HubSpot writes on human approval |
| *(retired)* WebFetch-based lead-scouting skill | N/A | Already gone (removed 2026-09-19) | No action — the crawler already fully replaced it; listed here only for completeness per the migration prompt's audit requirement |

## What "RETIRE AFTER TEST" means operationally for `marketing-manager` and `competitor-analyst`

Per the migration prompt's rule ("no agent/routine may be marked safe to retire if even one unique capability remains unmapped"), these two agent files stay in the repo, untouched, through the entire parallel-test window. They are only actually removed (or reduced to a stub pointing at ChatGPT) after:
1. The opportunity-ranking capability has an explicit, tested new home in Sales & BD Operations (Gap A).
2. The `marketing/strategy.md` hand-off question is resolved (Open Questions #1).
3. ChatGPT's Marketing Bible has produced calendar/brief/review output judged equivalent by Ala for the full test window.
