# 08 — Repository Security & Exposure Audit

`alaabusharif/linguative-automation` is public, deliberately (Ala's decision, 2026-09-27: "keep this repo public, strip sensitive content rather than go private"). This audit checks whether that decision is still being honored in practice, as of 2026-09-29. **No secret values are reproduced below.**

## Method
- Reviewed `.gitignore` (repo root) and `quotes-system/.gitignore`.
- Reviewed `quotes-system/.env.example` for what a real `.env` would contain (never the real file — it's gitignored).
- Reviewed `quotes-system/db/` contents (only `db.js` and `seed-items.json` are tracked; no `.db`/`.sqlite` files are committed).
- Reviewed `.github/workflows/lead-scouting.yml` for secret usage.
- Searched the repository for common secret patterns (`password`, AWS-style key prefixes, `.env` files) via GitHub code search.
- Cross-checked the standing "repo privacy" rules embedded in multiple routine prompts (Sales Agent, after-event follow-up, daily lead review) against actual repo file contents.
- Reviewed `marketing/brand/logos/` for the brand-asset rule (Section below).

## Findings

### 1. No secrets found committed to the repository (clean)
- Root `.gitignore` excludes `data/snapshots/*.txt` and `data/leads/*.md` (crawler working data — correctly excluded since it can surface prospect-adjacent info from external sites before human review).
- `quotes-system/.gitignore` excludes `.env`, `data/*.db*`, `node_modules/`, `uploads/` — correctly covers the actual secrets/credentials surface for that app (`SESSION_SECRET`, `ADMIN_PASSWORD`) and its client database.
- `quotes-system/.env.example` contains only placeholder values (`change-this-to-a-long-random-string`, `change-this-before-first-run`) — appropriate as a template, no real secret.
- GitHub code search for password/AWS-key/`.env`-extension patterns returned zero results in this repository.
- `.github/workflows/lead-scouting.yml` references `secrets.FIRECRAWL_API_KEY` and `secrets.RELIEFWEB_APPNAME` correctly via GitHub Actions' secrets mechanism (not hardcoded).

**No remediation required for this category.**

### 2. Client-sensitive information — enforced by prompt convention, spot-checked as followed
The repo carries an explicit, repeatedly-stated standing rule (independently present in at least 4 routine prompts: Sales Agent, after-event follow-up, daily lead review, and implied in Proposal Drafting) that no committed repo file may name a client, contact, or rate/price — these must be referenced by HubSpot record ID or generic sector/role description instead, with the real detail living only in the out-of-repo `/mnt/project-files/linguative-company-memory.md`.

Evidence this is actively enforced, not just stated: branch names visible in the local checkout include `claude/scrub-marketing-client-names-2026-09-27`, `claude/scrub-claude-md-2026-09-27`, and `claude/scrub-testimonial-log-20260927` — indicating a deliberate cleanup pass was already run to remove client names that had leaked into repo files before the rule was formalized.

**Recommendation:** spot-check `marketing/sales-reports/`, `marketing/case-studies/testimonial-log.md`, and `marketing/opportunities/` for any regression (a client name that slipped back in on a later run) as part of the parallel-test window's checklist — not urgent, but worth a periodic grep rather than a one-time fix. This audit did not do a full historical-commit scan of every past `marketing/` file for leaked names (out of scope for a point-in-time exposure check); a targeted follow-up (`git log -p -- marketing/` grepped against known client names from the private reference file) would close that gap fully if Ala wants full certainty. Flagged as **Open Questions #10**.

### 3. Prospect data, pricing, tender intelligence, sales pipeline details
Same enforcement mechanism as #2 — these categories are explicitly covered by the same repo-privacy rule (Sales Agent's REPORTING section explicitly lists "no client/contact names or rates" for the repo-committed sales report). No committed file reviewed in this audit contained a rate figure or named client.

### 4. API keys, OAuth tokens, credentials, `.env` files, secrets in git history
Covered under Finding #1 — clean for currently-tracked files. **Full git-history scan (not just current HEAD) was not performed in this pass** — a `.env` or credential could theoretically have been committed once and later removed, which would still leave it recoverable from git history even though it's gone from HEAD. Recommend a one-time `git log --all --full-history -- '**/.env' '**/*.pem' '**/*credentials*'`-style history sweep before treating the repo as fully clean historically, not just currently. Flagged as **Open Questions #11**.

### 5. Infrastructure details that should not be public
The repo itself does not contain server IPs, FastPanel paths, or hosting credentials (these live in project memory and `/mnt/project-files`, outside the repo). `quotes-system/README.md` and `.env.example` describe configuration shape (port, session-secret variable name) without real values — this is normal and expected for a deployable app's documentation, not an exposure.

## Recommendation: should the repository remain public?

**Yes, remain public — the current scrubbing discipline is working and no committed secret or client-identifying detail was found.** Making it private would not undo any exposure that may exist in history (Finding #4) and is not a substitute for the history sweep recommended there, which is available whether the repo is public or private. Recommend closing Open Questions #10 and #11 (spot-check + history sweep) as confirmation steps, not as a prerequisite for staying public.

## Brand Asset Rule — compliance check

Per the migration brief: exactly two approved logos (navy/gold light-bg, white/gold dark-bg), tagline "COMMUNICATION BEYOND LANGUAGE." — all other historical variants superseded, not to be deleted yet but flagged for archival.

**Finding:** `marketing/brand/logos/` currently contains 3 files:
- `logo-navy-gold-light-bg.png` — approved variant 1.
- `logo-white-gold-dark-bg.png` — approved variant 2.
- `old-logo-linguative-bridging-cultures.png` — **superseded**, per the brand rule. Its filename already self-identifies as old, which is good practice, but it sits in the same active `logos/` directory as the two approved files, which risks an agent or a person picking it by accident (a real incident already happened once with a different failure mode — the "Behind the Scenes" post shipping with the logo missing entirely — so accidental-wrong-asset risk in this pipeline is not hypothetical).

**Recommendation (not executed — pending Ala's approval per the migration brief's explicit instruction not to delete/move yet):** once Ala approves the migration, move `old-logo-linguative-bridging-cultures.png` to an explicit `marketing/brand/logos/do-not-use/` subdirectory (or similar), rather than deleting it, so it's preserved for history but structurally separated from the two live-use files.
