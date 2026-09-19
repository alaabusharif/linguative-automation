"""Entry point: check every source in sources.py, tag new content against
Linguative's service lines, and write a human-readable candidate report.

Usage:
    python3 -m crawler.run

This never talks to HubSpot. It only produces data/leads/latest.md for a
person (or a follow-up review step with HubSpot access) to read and decide
what, if anything, becomes a Company/Deal. First runs for a source always
report "no new content" since there's nothing to diff against yet — that's
expected, not a bug.
"""

from __future__ import annotations

import datetime as dt
from pathlib import Path

from crawler.api_sources import API_FETCHERS
from crawler.contacts import extract_contacts
from crawler.fetch import check_api_source, check_source
from crawler.services import EVENT_SIGNAL_WORDS, SERVICE_LINES
from crawler.sources import SOURCES

REPORT_PATH = Path(__file__).resolve().parent.parent / "data" / "leads" / "latest.md"


def match_keywords(lines: list[str], keywords: list[str]) -> list[str]:
    hits = []
    joined_lower = [line.lower() for line in lines]
    for keyword in keywords:
        for line, lower_line in zip(lines, joined_lower):
            if keyword in lower_line:
                hits.append(line)
                break
    return hits


def tag_service_lines(lines: list[str]) -> dict[str, list[str]]:
    tags = {}
    for service, keywords in SERVICE_LINES.items():
        hits = match_keywords(lines, keywords)
        if hits:
            tags[service] = hits
    return tags


def has_event_signal(lines: list[str]) -> bool:
    return bool(match_keywords(lines, EVENT_SIGNAL_WORDS))


def format_contacts(contacts: dict[str, list[str]]) -> str:
    if not contacts:
        return "Contact info: none found on the page — check it manually before reaching out"
    parts = []
    if contacts.get("emails"):
        parts.append("email(s) " + ", ".join(contacts["emails"]))
    if contacts.get("phones"):
        parts.append("phone(s) " + ", ".join(contacts["phones"]))
    return "Contact info: " + "; ".join(parts)


def run() -> None:
    timestamp = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    report_lines = [f"# Lead scouting report — {timestamp}", ""]

    errors = []
    first_runs = []
    quiet = []
    flagged = []

    for source in SOURCES:
        if source.get("type") == "api":
            result = check_api_source(
                source["key"], source["url"], API_FETCHERS[source["api"]]
            )
        else:
            result = check_source(source["key"], source["url"])

        if not result.ok:
            errors.append((source, result.error))
            continue

        if result.is_first_run:
            contacts = extract_contacts(result.full_text)
            first_runs.append((source, contacts))
            continue

        if not result.new_lines:
            quiet.append(source)
            continue

        event_like = has_event_signal(result.new_lines)
        tags = tag_service_lines(result.new_lines)

        if not event_like and not tags:
            quiet.append(source)
            continue

        contacts = extract_contacts(result.full_text)
        flagged.append((source, result.new_lines, tags, contacts))

    if flagged:
        report_lines.append("## New content worth reviewing")
        report_lines.append("")
        for source, new_lines, tags, contacts in flagged:
            report_lines.append(f"### {source['name']} ({source['url']})")
            if tags:
                tag_names = ", ".join(sorted(tags))
                report_lines.append(f"Possible service fit: {tag_names}")
            else:
                report_lines.append(
                    "Possible service fit: none matched — review manually, "
                    "generic event language only"
                )
            report_lines.append(format_contacts(contacts))
            report_lines.append("")
            report_lines.append("New lines since last check (truncated to 15):")
            for line in new_lines[:15]:
                report_lines.append(f"- {line}")
            report_lines.append("")
    else:
        report_lines.append("## New content worth reviewing")
        report_lines.append("")
        report_lines.append("Nothing new this run.")
        report_lines.append("")

    if first_runs:
        report_lines.append("## First-time checks (no baseline yet, nothing to diff)")
        report_lines.append("")
        for source, contacts in first_runs:
            report_lines.append(f"- {source['name']} ({source['url']}) — {format_contacts(contacts)}")
        report_lines.append("")

    if errors:
        report_lines.append("## Sources that failed to fetch")
        report_lines.append("")
        for source, error in errors:
            verified_note = "" if source["verified"] else " — URL not yet hand-verified"
            report_lines.append(f"- {source['name']} ({source['url']}){verified_note}: {error}")
        report_lines.append("")

    if quiet:
        report_lines.append("## Checked, no notable change")
        report_lines.append("")
        for source in quiet:
            report_lines.append(f"- {source['name']}")
        report_lines.append("")

    REPORT_PATH.parent.mkdir(parents=True, exist_ok=True)
    REPORT_PATH.write_text("\n".join(report_lines), encoding="utf-8")
    print(f"Report written to {REPORT_PATH}")
    print(f"Flagged: {len(flagged)}  First-run: {len(first_runs)}  "
          f"Quiet: {len(quiet)}  Errors: {len(errors)}")


if __name__ == "__main__":
    run()
