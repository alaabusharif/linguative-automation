# Redirect Plan — Template

2026-10-01. Empty until the live site's actual URLs are known (via the WordPress backup or the network-allowlist read-only pass). Per the 37-phase brief, Phase 11: before changing any indexed URL — confirm the change is necessary, implement a 301, update internal links, update canonicals, update the sitemap, and avoid redirect chains.

## Format (fill per URL once the live sitemap/crawl is available)

| Current URL | New URL | Reason for change | Redirect type | Internal links updated? | Canonical updated? | Sitemap updated? | Notes |
|---|---|---|---|---|---|---|---|
| *(pending audit)* | | | | | | | |

## Rules

- A URL only moves here if there's a concrete reason (restructuring a page that's genuinely thin/duplicate/misplaced, consolidating near-duplicate content, fixing a demonstrably broken path). Not changed just because the new IA (`2026-10-01-site-architecture.md`) names it slightly differently.
- No redirect chains — if a URL was already redirected once, point the new redirect at the final destination, not the intermediate hop.
- Every row needs a 301 target and anchor-text check before it's considered done, not just a row in this table.
- Anything with meaningful existing organic traffic or backlinks (determinable only from Search Console / analytics access) gets extra scrutiny before it's allowed to move.
