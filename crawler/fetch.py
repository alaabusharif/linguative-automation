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
USER_AGENT = (
    "Mozilla/5.0 (compatible; LinguativeLeadScout/1.0; "
    "+https://github.com/linguative-automation)"
)


@dataclass
class FetchResult:
    key: str
    url: str
    ok: bool
    error: str | None = None
    new_lines: list[str] | None = None
    is_first_run: bool = False
    full_text: str = ""


def fetch_html(url: str) -> str:
    last_exc: requests.RequestException | None = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        try:
            resp = requests.get(
                url,
                headers={"User-Agent": USER_AGENT},
                timeout=REQUEST_TIMEOUT,
            )
            resp.raise_for_status()
            return resp.text
        except requests.HTTPError:
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
    except requests.RequestException as exc:
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
