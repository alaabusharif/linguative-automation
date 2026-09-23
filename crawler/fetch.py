"""Fetching, text-extraction, and snapshot/diff helpers.

The crawler keeps one plain-text snapshot per source under
data/snapshots/<key>.txt. Each run re-fetches the source, extracts visible
text, and diffs it against the previous snapshot to find lines that are new
since last time — those new lines are what get scanned for service-line
keywords and surfaced in the report. Unchanged sources produce no output,
so the report only ever shows what's actually new.
"""

from __future__ import annotations

import difflib
import json
import os
import time
from collections.abc import Callable
from dataclasses import dataclass
from pathlib import Path

import requests
from bs4 import BeautifulSoup

SNAPSHOT_DIR = Path(__file__).resolve().parent.parent / "data" / "snapshots"
REQUEST_TIMEOUT = 20
MAX_ATTEMPTS = 3
RETRY_BACKOFF_SECONDS = 2

# Identifies us honestly to APIs we call directly (ReliefWeb, World Bank,
# TED) — none of them block on this, so there's no reason to hide it there.
USER_AGENT = (
    "Mozilla/5.0 (compatible; LinguativeLeadScout/1.0; "
    "+https://github.com/linguative-automation)"
)

# For plain HTML page fetches, some sites (British Council, Goethe-Institut)
# bot-block on an honest, unfamiliar User-Agent regardless of path — a
# realistic browser UA + Accept + Accept-Language get past simple
# UA-sniffing (though not a full Cloudflare JS challenge, which is what
# FIRECRAWL_API_KEY's fallback below is for).
BROWSER_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.9",
}


class SourceSkipped(Exception):
    """A fetcher can raise this to mean "nothing to check right now" for a
    reason that isn't a real failure — e.g. optional config (an API key or
    app name) hasn't been supplied yet. check_source/check_api_source treat
    this as neither a pass nor an error: the source is left out of the
    report entirely rather than shown as broken.
    """


@dataclass
class FetchResult:
    key: str
    url: str
    ok: bool
    error: str | None = None
    new_lines: list[str] | None = None
    is_first_run: bool = False
    full_text: str = ""
    skipped: bool = False


def raise_for_status_with_body(resp: requests.Response) -> None:
    """Like resp.raise_for_status(), but folds the response body into the
    exception message. A bare "403 Forbidden" or "400 Bad Request" gives no
    clue why an otherwise well-formed API request was rejected — most APIs
    put the actual reason (a validation error, a block notice) in the body.
    """
    try:
        resp.raise_for_status()
    except requests.HTTPError as exc:
        body = resp.text.strip()[:300]
        if body:
            raise requests.HTTPError(f"{exc} — response body: {body}", response=resp) from exc
        raise


def fetch_via_firecrawl(url: str) -> str:
    """Fallback for pages that reject even a browser-like direct fetch (a
    Cloudflare JS challenge, not just UA-sniffing) — renders the page in
    Firecrawl's hosted browser instead. Requires FIRECRAWL_API_KEY; raises
    SourceSkipped if it's not configured, so a source without a key just
    surfaces its original fetch error instead of a confusing new one.
    """
    api_key = os.environ.get("FIRECRAWL_API_KEY")
    if not api_key:
        raise SourceSkipped("no FIRECRAWL_API_KEY configured")

    resp = requests.post(
        "https://api.firecrawl.dev/v2/scrape",
        headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
        json={"url": url, "formats": ["html"]},
        timeout=REQUEST_TIMEOUT * 2,
    )
    raise_for_status_with_body(resp)
    html = (resp.json().get("data") or {}).get("html")
    if not html:
        raise requests.RequestException("Firecrawl returned no html content")
    return html


def fetch_html(url: str) -> str:
    last_exc: requests.RequestException | None = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            resp = requests.get(url, headers=BROWSER_HEADERS, timeout=REQUEST_TIMEOUT)
            resp.raise_for_status()
            return resp.text
        except requests.HTTPError as exc:
            if resp.status_code == 403:
                try:
                    return fetch_via_firecrawl(url)
                except SourceSkipped:
                    pass
                except requests.RequestException as fc_exc:
                    raise requests.HTTPError(
                        f"{exc} — Firecrawl fallback also failed: {fc_exc}"
                    ) from exc
            # A 4xx/5xx status is unlikely to change on immediate retry
            # (e.g. the known 403s on some sources) — fail fast.
            raise
        except requests.RequestException as exc:
            last_exc = exc
            if attempt < MAX_ATTEMPTS:
                time.sleep(RETRY_BACKOFF_SECONDS * attempt)
    raise last_exc


def extract_text(html: str) -> str:
    soup = BeautifulSoup(html, "html.parser")
    for tag in soup(["script", "style", "noscript", "svg"]):
        tag.decompose()
    text = soup.get_text(separator="\n")
    lines = [line.strip() for line in text.splitlines()]
    lines = [line for line in lines if line]
    return "\n".join(lines)


def snapshot_path(key: str) -> Path:
    return SNAPSHOT_DIR / f"{key}.txt"


def check_source(key: str, url: str) -> FetchResult:
    try:
        html = fetch_html(url)
    except SourceSkipped:
        return FetchResult(key=key, url=url, ok=True, skipped=True)
    except requests.RequestException as exc:
        return FetchResult(key=key, url=url, ok=False, error=str(exc))

    text = extract_text(html)
    path = snapshot_path(key)
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)

    if not path.exists():
        path.write_text(text, encoding="utf-8")
        return FetchResult(
            key=key, url=url, ok=True, is_first_run=True, new_lines=[], full_text=text
        )

    previous_lines = path.read_text(encoding="utf-8").splitlines()
    current_lines = text.splitlines()

    diff = difflib.unified_diff(previous_lines, current_lines, lineterm="")
    new_lines = [
        line[1:].strip()
        for line in diff
        if line.startswith("+") and not line.startswith("+++")
    ]
    new_lines = [line for line in new_lines if line]

    path.write_text(text, encoding="utf-8")
    return FetchResult(key=key, url=url, ok=True, new_lines=new_lines, full_text=text)


def api_snapshot_path(key: str) -> Path:
    return SNAPSHOT_DIR / f"{key}.ids.json"


def check_api_source(
    key: str, url: str, fetch_items: Callable[[], list[dict]]
) -> FetchResult:
    """Like check_source, but for a JSON API fetcher instead of an HTML
    page. Diffs on item id (not text lines) against a JSON snapshot of
    previously-seen ids, since API results don't have a stable line-by-line
    shape to diff the way rendered page text does. Each item becomes one
    formatted line so it flows through the same keyword tagging as HTML
    sources.
    """
    try:
        items = fetch_items()
    except SourceSkipped:
        return FetchResult(key=key, url=url, ok=True, skipped=True)
    except requests.RequestException as exc:
        return FetchResult(key=key, url=url, ok=False, error=str(exc))
    except Exception as exc:
        # A fetcher's assumptions about the API's response shape (field
        # names, nesting) can be wrong in ways that surface as a plain
        # Python error rather than a request failure — one bad source
        # shouldn't take down every other source's crawl.
        return FetchResult(key=key, url=url, ok=False, error=str(exc))

    lines_by_id = {}
    for item in items:
        item_id = str(item.get("id") or item.get("url") or item.get("title"))
        line = (
            f"{item.get('title', '(no title)')} — {item.get('date', '')} — "
            f"{item.get('url', '')}"
        ).strip()
        lines_by_id[item_id] = line

    path = api_snapshot_path(key)
    SNAPSHOT_DIR.mkdir(parents=True, exist_ok=True)
    full_text = "\n".join(lines_by_id.values())

    if not path.exists():
        path.write_text(json.dumps(sorted(lines_by_id.keys())), encoding="utf-8")
        return FetchResult(
            key=key, url=url, ok=True, is_first_run=True, new_lines=[], full_text=full_text
        )

    previous_ids = set(json.loads(path.read_text(encoding="utf-8")))
    new_lines = [line for item_id, line in lines_by_id.items() if item_id not in previous_ids]

    path.write_text(json.dumps(sorted(lines_by_id.keys())), encoding="utf-8")
    return FetchResult(key=key, url=url, ok=True, new_lines=new_lines, full_text=full_text)
