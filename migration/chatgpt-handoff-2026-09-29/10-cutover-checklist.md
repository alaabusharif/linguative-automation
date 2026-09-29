# 10 — Cutover Checklist

**Not to be executed until Ala explicitly approves cutover.** This is the checklist to run through at that point — today, every box below is unchecked.

## Before starting cutover
- [ ] Ala has reviewed and approved `04-proposed-final-architecture.md`.
- [ ] The 14-day parallel test (`09-parallel-test-plan.md`) has completed with all 12 criteria passing, OR Ala has explicitly accepted a partial result with named exceptions.
- [ ] The monthly-cadence exception (calendar and briefs) has had at least one full monthly cycle tested, per the note in `09`.
- [ ] Every open question in `12-open-questions-for-ala.md` has an answer.
- [ ] Every item in `03-gap-register.md` has its bridge built (not just proposed) and its specific test passed.
- [ ] `08-security-audit.md`'s two follow-ups (client-name spot-check, git-history secret sweep) are complete, whatever their outcome.

## Cutover sequence (once all of the above are checked)
1. **Centralize cross-cutting brand/identity rules into `CLAUDE.md`** (masculine Arabic company name, Bosch-only equipment naming, Guarantee Travel Group rule, two-logo rule) — this decouples them from any routine being retired. Do this FIRST, before touching any routine.
2. **Apply the Gap C mailbox-safety prompt change** (Client Email Responder: label-for-review instead of auto-trash on first offense) if Ala approved it — a prompt-only edit, independently deployable.
3. **Archive, do not delete**, `old-logo-linguative-bridging-cultures.png` into `marketing/brand/logos/do-not-use/`.
4. **Archive, do not delete**, the `linguative-design` skill directory (rename/flag as fallback in its SKILL.md frontmatter, don't remove the files) — only after Gap E's QA-parity test has passed for the new design stack.
5. For each routine marked RETIRE AFTER TEST in `05-routine-migration-map.md`: disable its trigger (do not delete it — triggers can be re-enabled) only after its specific parity test passed and Ala confirms in writing (or in this thread) that ChatGPT's output is an acceptable replacement.
6. **Do not touch** any routine/agent/skill marked KEEP or DO NOT RETIRE anywhere in this folder.
7. Update `CLAUDE.md`'s "Agent team" section to reflect the new role labels (Sales & BD Operations, Operations Monitor) for documentation purposes — this is metadata, not a functional change.
8. Post a final summary in the project thread of exactly what was disabled/archived and what stayed, with links to the specific runs/commits, so there's a clear record.

## What this checklist explicitly does NOT authorize
- Deleting any file, agent, or skill (archive only, per the migration brief's explicit rule).
- Rewriting git history.
- Disabling any routine not individually named as RETIRE AFTER TEST with a passed test.
- Changing the repository's public/private visibility (see `08-security-audit.md`'s recommendation to stay public).
- Any change to `quotes-system/` as part of this migration — it is out of scope entirely (Gap D).
