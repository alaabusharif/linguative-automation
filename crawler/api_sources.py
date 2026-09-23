"""Fetchers for structured JSON API sources, as opposed to the HTML pages
in sources.py (fetched and text-diffed via fetch.py). Each fetcher takes no
arguments and returns a list of items, each a dict:
  id      - stable identifier for the notice/report, used to detect what's
            new since the last run
  title   - short title/summary line
  url     - link to the full notice/report
  date    - publish or deadline date as a string (whatever the API gives)
  summary - longer text, if available, for keyword tagging

All three APIs here are public and documented, and need no auth or API
key. None of them could be live-tested from this environment (outbound
requests to arbitrary hosts are blocked here the same way they are for the
HTML crawler - see README.md), so field names below are based on published
docs, not a live response. First real run is in GitHub Actions - if a
field name is wrong, check_api_source() will surface it as a fetch error
rather than silently returning nothing, since resp.json() / dict access
will raise.
"""

from __future__ import annotations

import requests

from crawler.fetch import REQUEST_TIMEOUT, USER_AGENT, raise_for_status_with_body

HEADERS = {"User-Agent": USER_AGENT}


def fetch_world_bank() -> list[dict]:
    """World Bank Procurement Notices API. No auth. Docs:
    https://search.worldbank.org/api/v2/procnotices
    """
    resp = requests.get(
        "https://search.worldbank.org/api/v2/procnotices",
        params={"format": "json", "countryname": "Jordan", "rows": 50},
        headers=HEADERS,
        timeout=REQUEST_TIMEOUT,
    )
    raise_for_status_with_body(resp)
    data = resp.json()
    # The live API returns "procnotices" as a list of notices directly,
    # not nested under a "procnotice" key as the docs suggested — this was
    # never confirmed pre-merge since outbound requests are blocked in the
    # sandbox that wrote it. Handle both shapes defensively.
    notices = data.get("procnotices", [])
    if isinstance(notices, dict):
        notices = notices.get("procnotice", [])

    items = []
    for notice in notices:
        notice_id = notice.get("id") or notice.get("bid_ref_no")
        items.append(
            {
                "id": notice_id,
                "title": notice.get("project_name")
                or (notice.get("bid_description") or "")[:120]
                or "(untitled notice)",
                "url": notice.get("notice_url")
                or f"https://projects.worldbank.org/en/projects-operations/procurement/notice-overview?id={notice_id}",
                "date": notice.get("submission_date") or notice.get("publishdate", ""),
                "summary": notice.get("bid_description", ""),
            }
        )
    return items


def fetch_reliefweb() -> list[dict]:
    """ReliefWeb (OCHA) reports API. No auth, but asks for an appname to
    identify the caller for their usage stats. Docs:
    https://apidoc.reliefweb.int/
    """
    resp = requests.post(
        "https://api.reliefweb.int/v2/reports",
        params={"appname": "linguative-lead-scouting"},
        json={
            "limit": 20,
            "filter": {"field": "country", "value": "Jordan"},
            "sort": ["date:desc"],
            "fields": {"include": ["title", "url", "date.created", "body"]},
        },
        headers=HEADERS,
        timeout=REQUEST_TIMEOUT,
    )
    raise_for_status_with_body(resp)
    data = resp.json()

    items = []
    for entry in data.get("data", []):
        fields = entry.get("fields", {})
        items.append(
            {
                "id": entry.get("id"),
                "title": fields.get("title", "(untitled report)"),
                "url": fields.get("url") or entry.get("href", ""),
                "date": (fields.get("date") or {}).get("created", ""),
                "summary": (fields.get("body") or "")[:500],
            }
        )
    return items


def fetch_ted() -> list[dict]:
    """EU TED (Tenders Electronic Daily) Search API. No auth. Docs:
    https://docs.ted.europa.eu/api/latest/search.html

    Scoped to translation (CPV 79530000), interpretation (79540000) and
    event services (79952000) notices with a Jordan place of performance -
    this only catches EU-funded tenders performed in Jordan, not the whole
    TED archive.
    """
    resp = requests.post(
        "https://api.ted.europa.eu/v3/notices/search",
        json={
            "query": (
                "(classification-cpv=79530000* OR classification-cpv=79540000* "
                "OR classification-cpv=79952000*) AND place-of-performance=JOR"
            ),
            "fields": [
                "publication-number",
                "notice-title",
                "publication-date",
                "deadline-date",
            ],
            "limit": 50,
            "scope": "ACTIVE",
        },
        headers={**HEADERS, "Content-Type": "application/json"},
        timeout=REQUEST_TIMEOUT,
    )
    raise_for_status_with_body(resp)
    data = resp.json()

    items = []
    for notice in data.get("notices", []):
        pub_no = notice.get("publication-number")
        title = notice.get("notice-title", "")
        if isinstance(title, dict):
            title = title.get("eng") or next(iter(title.values()), "")
        items.append(
            {
                "id": pub_no,
                "title": title or "(untitled notice)",
                "url": f"https://ted.europa.eu/en/notice/-/detail/{pub_no}" if pub_no else "",
                "date": notice.get("publication-date", ""),
                "summary": f"Deadline: {notice.get('deadline-date', 'n/a')}",
            }
        )
    return items


API_FETCHERS = {
    "world_bank": fetch_world_bank,
    "reliefweb": fetch_reliefweb,
    "ted": fetch_ted,
}
