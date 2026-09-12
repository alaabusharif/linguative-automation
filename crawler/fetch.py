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
from dataclasses import dataclass
from pathlib import Path

import requests
from bs4 import BeautifulSoup

SNAPSHOT_DIR = Path(__file__).resolve().parent.parent / "data" / "snapshots"
REQUEST_TIMEOUT = 20
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


def fetch_html(url: str) -> str:
    resp = requests.get(
        url,
        headers={"User-Agent": USER_AGENT},
        timeout=REQUEST_TIMEOUT,
    )
    resp.raise_for_status()
    return resp.text


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
        return FetchResult(key=key, url=url, ok=True, is_first_run=True, new_lines=[])

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
    return FetchResult(key=key, url=url, ok=True, new_lines=new_lines)
