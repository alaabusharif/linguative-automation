"""Source sites the crawler checks for new events/tenders in Jordan that
could need Linguative's services.

Each source is a dict:
  key      - short unique id, used for the snapshot filename
  name     - human-readable name
  url      - page to fetch (events/news listing preferred over a homepage)
  category - chamber | cultural_institute | embassy | ngo | conference_org
             | training_provider | tender_portal
  verified - True once someone has confirmed the URL actually resolves to
             the intended events/news/tenders listing. Sources found via
             web search and not yet hand-checked are marked False so a
             fetch failure is expected/understood rather than alarming.
  known_issue - optional. Set when a fetch failure has already been
             diagnosed (bot-blocking, bad SSL cert, wrong path) so the next
             person doesn't have to re-diagnose it from scratch. Remove
             once the source is confirmed working.
  type     - optional. "api" for a JSON API source handled by
             crawler/api_sources.py instead of the default HTML fetch+diff.
             Requires an "api" key naming the fetcher in API_FETCHERS.

This list seeds from organizations already in HubSpot as leads (so we know
they're relevant) plus general Jordan tender portals. Add to it as new
relevant sources turn up — there's no need to keep this exhaustive from
day one.
"""

SOURCES = [
    # --- Already-known lead organizations (from HubSpot) ---
    {
        "key": "eurocham_jordan",
        "name": "EuroCham Jordan",
        "url": "https://www.eurocham.jo/",
        "category": "chamber",
        "verified": True,
    },
    {
        "key": "amcham_jordan",
        "name": "AmCham Jordan",
        "url": "https://www.amcham.jo/",
        "category": "chamber",
        "verified": False,
    },
    {
        "key": "jordan_chamber_of_commerce",
        "name": "Jordan Chamber of Commerce",
        "url": "http://www.jocc.org.jo/index_en.php",
        "category": "chamber",
        "verified": False,
    },
    {
        "key": "british_council_jordan",
        "name": "British Council Jordan",
        "url": "https://www.britishcouncil.jo/en/events",
        "category": "cultural_institute",
        "verified": False,
        "known_issue": "CONFIRMED 2026-09-12: 403 on /, /en, AND /en/events "
        "— site-wide bot-blocking (Cloudflare or similar), not a path "
        "problem. 2026-09-23: fetch_html now sends realistic browser "
        "headers and falls back to Firecrawl (FIRECRAWL_API_KEY) on a "
        "403 — verify on the next real run whether that's enough, or "
        "whether this needs the Firecrawl key added as a repo secret.",
    },
    {
        "key": "goethe_institut_jordan",
        "name": "Goethe-Institut Jordan",
        "url": "https://www.goethe.de/ins/jo/en/ver.cfm",
        "category": "cultural_institute",
        "verified": False,
        "known_issue": "CONFIRMED 2026-09-12: 403 on both /index.html and "
        "the dedicated events page /ver.cfm — site-wide bot-blocking, same "
        "as British Council above. 2026-09-23: same browser-headers + "
        "Firecrawl-fallback fix applied — verify on the next real run.",
    },
    # Ifpo Amman was removed 2026-09-23: its SSL cert chain is broken
    # server-side (confirmed 2026-09-12, "unable to get local issuer
    # certificate"), which can't be safely fixed without knowing Ifpo's
    # actual intermediate CA (needs a live TLS handshake with the host to
    # diagnose — not possible from a sandboxed Claude Code session, which
    # has no outbound network access at all; per policy, disabling cert
    # verification is not an option). Also, three separate manual
    # WebSearch passes (2026-09-13, -15, -18) found only small academic
    # talks there, never the scale of event this crawler screens for — so
    # even a working feed would rarely be useful. Re-add if Ala gets a
    # working URL with a valid cert.
    {
        "key": "german_embassy_amman",
        "name": "German Embassy Amman",
        "url": "https://amman.diplo.de/jo-de",
        "category": "embassy",
        "verified": False,
        "known_issue": "URL updated 2026-09-23, twice: first tried "
        "/jo-de/aktuelles (a guessed news-listing path) which also 404'd "
        "on a real test run, so this now points at the bare site root — "
        "the one URL that consistently resolved across several searches. "
        "No working /jo-en (English) section could be found at all; every "
        "real page on this site is under /jo-de/. Lower-value than a "
        "dedicated news page (it's a homepage, not a listing), but it's "
        "the most defensible URL without live access to browse the site's "
        "nav structure directly.",
    },
    {
        "key": "mercy_corps_jordan",
        "name": "Mercy Corps Jordan",
        "url": "https://jordan.mercycorps.org/",
        "category": "ngo",
        "verified": False,
    },
    {
        "key": "drc_jordan",
        "name": "Danish Refugee Council - Jordan",
        "url": "https://drc.ngo/jordan",
        "category": "ngo",
        "verified": False,
    },
    {
        "key": "horeca_jordan",
        "name": "HORECA Jordan",
        "url": "https://horeca-jordan.com/",
        "category": "conference_org",
        "verified": False,
    },
    {
        "key": "jeic_2026",
        "name": "Jordan-EU Investment Conference (JEIC) 2026",
        "url": "https://jeic.invest.jo/",
        "category": "conference_org",
        "verified": False,
    },
    {
        "key": "gentex_training",
        "name": "Gentex Training Center",
        "url": "https://gentextraining.com/",
        "category": "training_provider",
        "verified": False,
    },
    {
        "key": "gh4t",
        "name": "Global Horizon Training Center (GH4T)",
        "url": "https://gh4t.com/",
        "category": "training_provider",
        "verified": False,
    },
    # --- Tender portals (not yet represented by any HubSpot lead) ---
    {
        "key": "jordan_gtd_eprocurement",
        "name": "Jordan Government Tenders Directorate (gtd.gov.jo)",
        "url": "http://www.gtd.gov.jo/",
        "category": "tender_portal",
        "verified": True,
    },
    # --- API sources (JSON, not HTML — see crawler/api_sources.py) ---
    {
        "key": "world_bank_procurement",
        "name": "World Bank Procurement Notices — Jordan",
        "url": "https://search.worldbank.org/api/v2/procnotices",
        "category": "tender_portal",
        "verified": True,
        "type": "api",
        "api": "world_bank",
    },
    {
        "key": "reliefweb_jordan",
        "name": "ReliefWeb — Jordan reports",
        "url": "https://api.reliefweb.int/v2/reports",
        "category": "ngo",
        "verified": True,
        "type": "api",
        "api": "reliefweb",
        "known_issue": "2026-09-23: started 403ing — the appname used "
        "('linguative-lead-scouting') isn't an approved ReliefWeb appname. "
        "Now reads RELIEFWEB_APPNAME from the environment and skips "
        "quietly (no failure logged) until that secret is set with an "
        "approved name Ala has requested from ReliefWeb.",
    },
    {
        "key": "eu_ted_jordan",
        "name": "EU TED — Jordan-related tenders",
        "url": "https://api.ted.europa.eu/v3/notices/search",
        "category": "tender_portal",
        "verified": True,
        "type": "api",
        "api": "ted",
    },
]
