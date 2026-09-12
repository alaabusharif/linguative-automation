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
        "verified": False,
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
        "known_issue": "Returned 403 on both / and /en as of 2026-09-12 — "
        "looks like bot-blocking (Cloudflare or similar), not a wrong path. "
        "Switched to the dedicated events page in case that's treated "
        "differently; if it still 403s, this needs a different fetch "
        "strategy (e.g. a real browser via Playwright), not another URL.",
    },
    {
        "key": "goethe_institut_jordan",
        "name": "Goethe-Institut Jordan",
        "url": "https://www.goethe.de/ins/jo/en/ver.cfm",
        "category": "cultural_institute",
        "verified": False,
        "known_issue": "Original /index.html path 403'd as of 2026-09-12 — "
        "switched to the actual events listing page (ver.cfm), which is "
        "also just a better target if it works. Same bot-blocking risk as "
        "British Council above if goethe.de blocks non-browser requests "
        "site-wide.",
    },
    {
        "key": "ifpo_amman",
        "name": "Institut Français du Proche-Orient (Ifpo) - Amman",
        "url": "https://www.ifporient.org/a-propos/antennes/amman/",
        "category": "cultural_institute",
        "verified": False,
        "known_issue": "Original /en/amman/ path failed SSL cert "
        "verification as of 2026-09-12 (CERTIFICATE_VERIFY_FAILED) — a "
        "site-side cert config issue, not something a different path "
        "necessarily fixes. Switched to the French-language Amman page "
        "found via search; re-check if this still fails.",
    },
    {
        "key": "german_embassy_amman",
        "name": "German Embassy Amman",
        "url": "https://amman.diplo.de/jo-en/",
        "category": "embassy",
        "verified": False,
        "known_issue": "Original /jo-en (no trailing slash) 404'd as of "
        "2026-09-12. Added a trailing slash since diplo.de sites are "
        "sometimes strict about it; re-check if this still 404s.",
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
        "verified": False,
    },
]
