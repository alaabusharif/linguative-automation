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
- Localization
- Subtitling / voiceover
- Transcription
- Desktop publishing

It does **not** create HubSpot records or decide fit on its own. Each run
produces `data/leads/latest.md`: a report of what's new on each source page
since the last run, with an assessment of which service line(s) it might
need. A person (or a follow-up review step with HubSpot access) reads that
report and decides what becomes a Company/Deal — in particular, "Match
Type" on a Deal stays a human judgment call, never something automated here.

There are two implementations, for two different ways of running this:

### Primary: `.claude/skills/lead-scouting/SKILL.md` (runs inside Claude)

A skill a Claude Code session (including a scheduled one) can invoke
directly. It fetches each source with the **WebFetch** tool instead of raw
HTTP, which matters because Claude Code sessions route outbound HTTP through
a proxy that blocks arbitrary destination hosts — WebFetch goes through
Anthropic's own infrastructure instead, so it isn't subject to that block.
It also judges service-line fit with actual reasoning about each new
listing, rather than keyword matching.

To run it now, ask Claude (in a session with access to this repo) to "run
the lead-scouting skill". To run it on a recurring cadence, set up a
recurring scheduled task on your Claude account with a prompt like "Run the
lead-scouting skill" pointed at this repo — see the skill file's
"Scheduling this" section for why a session-local cron isn't a substitute.

### Alternative: `crawler/` (a plain Python script)

Same idea, implemented with `requests` + BeautifulSoup and keyword matching
instead of an LLM's judgment. Useful if you'd rather run this from your own
machine or a scheduled CI job (e.g. GitHub Actions) than depend on a Claude
session being scheduled.

```
pip install -r requirements.txt
python3 -m crawler.run
```

The first run against any given source just saves a baseline snapshot and
reports nothing (there's nothing to diff against yet) — that's expected.

**This script cannot run inside a sandboxed Claude Code session** — that's
exactly why the skill above exists as the primary path. Run it once from an
environment with normal outbound internet access and hand-check the sources
that fail (see `verified: False` in `crawler/sources.py`; several site paths
were found via web search and not yet confirmed to be the right events/news
page).

### Adding or fixing sources

Edit `crawler/sources.py`. Each entry needs a `key` (used for the snapshot
filename), `name`, `url` (an events/news/tenders listing page is much more
useful than a bare homepage), `category`, and `verified` (flip to `True`
once you've confirmed the URL is right).

Service-line keyword hints live in `crawler/services.py` — they're a coarse
first pass to flag candidate pages, not a verdict.
