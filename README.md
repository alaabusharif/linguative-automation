# linguative-automation

Automation for Linguative's RFQ/lead pipeline in HubSpot.

## Lead-scouting

Checks a list of Jordan-based organizations (chambers, cultural institutes,
embassies, NGOs, conference organizers, tender portals) for new events or
tenders that might need one of Linguative's services:

- Translation
- Certified / legal translation
- Interpretation
- AV equipment
- Event / conference management
- Editing / proofreading
- Localization
- Subtitling / voiceover
- Transcription
- Desktop publishing

(Verified against [linguative.net](https://linguative.net) — event/conference
management in particular is a headline service that was missing from an
earlier version of this list.)

It does **not** create HubSpot records or decide fit on its own. Each run
produces `data/leads/latest.md`: a report of what's new on each source page
since the last run, with an assessment of which service line(s) it might
need and any contact info (email/phone) found on the page (`crawler/contacts.py`
— a coarse regex pass, not a verified directory entry: still needs a human
to confirm it's the right contact before anyone reaches out). A person (or
a follow-up review step with HubSpot access) reads that report and decides
what becomes a Company/Deal — in particular, "Match Type" on a Deal stays a
human judgment call, never something automated here.

The actual crawling logic lives in `crawler/` (Python, `requests` +
BeautifulSoup, keyword-based service tagging). It **cannot run inside a
sandboxed Claude Code session** — outbound requests to arbitrary hosts get
blocked by network policy there (confirmed for both raw HTTP and Claude's
own WebFetch tool). It needs to run somewhere with normal internet access.
Two ways to do that:

### Recommended: `.github/workflows/lead-scouting.yml` (automatic)

Runs `crawler/run.py` on a GitHub-hosted runner once a day (06:17 UTC) plus
on manual trigger. GitHub's runners have ordinary internet access, so
nothing here is blocked the way it is in a Claude session. It:

- Keeps `data/snapshots/` between runs using GitHub's build cache (so it
  can tell what's *new* each day, not just what's on the page right now).
- Posts a comment on a tracking issue (labeled `lead-scouting`, created
  automatically) **only** on days something new was actually flagged — a
  quiet day produces no comment, so the issue doesn't turn into noise.

One-time setup required: go to **Settings → Actions → General → Workflow
permissions** on this repo and select **"Read and write permissions"**
(default is usually read-only, which would silently stop the workflow from
posting to issues). Nothing else to configure — the workflow will start
firing on its own schedule once that's flipped, and you can also trigger it
immediately from the **Actions** tab → "Lead scouting crawler" → "Run
workflow" to test it without waiting for the schedule.

### Manual: run it yourself

```
pip install -r requirements.txt
python3 -m crawler.run
```

Useful for a one-off check, or for testing changes to `crawler/sources.py`
before they go live in the scheduled run. First run against any given
source just saves a baseline snapshot and reports nothing (nothing to diff
against yet) — that's expected. Hand-check sources marked `verified: False`
in `crawler/sources.py` — several were found via web search and not yet
confirmed to be the right events/news page.

### Unverified: `.claude/skills/lead-scouting/SKILL.md`

An attempt at a Claude-native version using the WebFetch tool instead of
raw HTTP. Tested live against 5 real domains from a sandboxed session and
all 5 failed (WebFetch is also subject to a network egress block there) —
so this is **not currently a working path**, kept in the repo mainly as a
documented dead end and a starting point if someone wants to retry it with
a WebSearch-based approach instead (see the skill file for details).

### Adding or fixing sources

Edit `crawler/sources.py`. Each entry needs a `key` (used for the snapshot
filename), `name`, `url` (an events/news/tenders listing page is much more
useful than a bare homepage), `category`, and `verified` (flip to `True`
once you've confirmed the URL is right).

Service-line keyword hints live in `crawler/services.py` — they're a coarse
first pass to flag candidate pages, not a verdict.

## Lead-to-deal

`.claude/skills/lead-to-deal/SKILL.md` is the next step after lead-scouting:
it reads the "Lead scouting: new candidates" GitHub issue, checks each new
entry against HubSpot for duplicates, and proposes a Company + Deal (RFQ
Pipeline, stage "New") for approval — nothing gets created without a human
saying yes. It never sets "Match Type" or drafts a proposal; those stay
separate steps.

Run it by asking Claude (in a session with access to both this repo and
HubSpot) to "process new leads." Unlike `lead-scouting`, this isn't a good
fit for a fully unattended schedule — it asks for approval on every
proposed record, so whatever triggers it needs to be able to surface that
approval prompt to a person rather than silently skip it.

State (which issue comments have already been turned into a proposal) lives
in `data/leads/processed_comments.json`, committed to the repo so it
persists across runs.

## LinkedIn content design

A weekly Cowork routine (configured in claude.ai's scheduled-routines
settings, not in this repo) that:

- Reads this week's entry from the "Linguative Content" Google Doc — a
  dated log of LinkedIn post drafts that rotates across three themes: Case
  Studies, Certified Translation Topics, and Behind-the-Scenes Event
  Planning.
- Creates a matching visual design in Canva. No formal Canva brand
  kit/template exists for Linguative yet, so the routine copies the most
  recent prior week's LinkedIn graphic (same navy background, teal accent
  frame, wordmark, hashtag footer) and swaps in the new week's headline,
  quote, and hashtags.
- Saves the result as a Canva draft for review. It never publishes or
  exports anything — a person reviews and does that manually.

There's nothing to configure in this repo for it since it doesn't run as a
GitHub Action or a `.claude/skills/` file — it's listed here only so all of
Linguative's automations are documented in one place.
