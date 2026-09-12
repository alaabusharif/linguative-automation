# linguative-automation

Automation for Linguative's RFQ/lead pipeline in HubSpot.

## Lead-scouting crawler

`crawler/` checks a list of Jordan-based organizations (chambers, cultural
institutes, embassies, NGOs, conference organizers, tender portals) for new
events or tenders that might need one of Linguative's services:

- Translation
- Certified / legal translation
- Interpretation
- AV equipment
- Localization
- Subtitling / voiceover
- Transcription
- Desktop publishing

It does **not** create HubSpot records or decide fit on its own. Each run
produces `data/leads/latest.md`: a diff-based report of what's new on each
source page since the last run, tagged with which service line(s) the new
text plausibly matches. A person (or a follow-up review step with HubSpot
access) reads that report and decides what becomes a Company/Deal — in
particular, "Match Type" on a Deal stays a human judgment call, never
something the crawler sets.

### Running it

```
pip install -r requirements.txt
python3 -m crawler.run
```

The first run against any given source just saves a baseline snapshot and
reports nothing (there's nothing to diff against yet) — that's expected.
Later runs report new lines since the previous snapshot.

### Known limitation: where this can actually run

**This script cannot run inside a sandboxed Claude Code session** (the kind
this repo was built in). Those sessions route outbound HTTPS through a
policy-enforcing proxy that only allows package registries and Anthropic's
own APIs — arbitrary destination hosts (every source in `crawler/sources.py`)
get a `403` policy denial. That's a hard org-level restriction, not a bug to
route around.

This code is meant to run somewhere with normal outbound internet access:
your own machine, a scheduled CI job (e.g. a GitHub Actions cron workflow),
or any server you control. It has not yet been run end-to-end against the
real sites because of the sandbox restriction above — run it once from an
unrestricted environment and hand-check the sources that fail (see
`verified: False` in `crawler/sources.py`; several site paths were found via
web search and not yet confirmed to be the right events/news page).

If instead you want this to run *as a Claude scheduled task* (like the
existing routine that already populated some HubSpot leads with "automated
Jordan event-scouting routine" in their description), that needs a
different implementation: one that uses Claude's own WebFetch/WebSearch
tools instead of raw HTTP requests, since those aren't subject to the same
proxy allowlist. That's a separate, agent-driven approach rather than a
standalone script — worth doing only if you'd rather not manage a server/CI
job for this.

### Adding or fixing sources

Edit `crawler/sources.py`. Each entry needs a `key` (used for the snapshot
filename), `name`, `url` (an events/news/tenders listing page is much more
useful than a bare homepage), `category`, and `verified` (flip to `True`
once you've confirmed the URL is right).

Service-line keyword hints live in `crawler/services.py` — they're a coarse
first pass to flag candidate pages, not a verdict.
