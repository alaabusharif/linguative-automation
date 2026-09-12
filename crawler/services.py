"""Linguative's service lines and the keyword hints used to flag which of
them a scouted event/tender page plausibly needs.

Keyword matching is a coarse first pass, not a verdict — it tags candidate
pages so a human (or a follow-up review step) knows what to look for. It
never decides Match Type or creates HubSpot records by itself.
"""

SERVICE_LINES = {
    "translation": [
        "translation", "translate", "translated", "translator",
        "document translation",
    ],
    "certified_legal_translation": [
        "certified translation", "sworn translation", "legal translation",
        "notarized translation", "official document translation",
        "certified translator",
    ],
    "interpretation": [
        "interpretation", "interpreter", "simultaneous interpretation",
        "consecutive interpretation", "conference interpreting",
        "whisper interpreting",
    ],
    "av_equipment": [
        "audio-visual", "av equipment", "sound system", "simultaneous interpretation booth",
        "interpretation booth", "headsets", "microphones", "av support",
        "technical production",
    ],
    "localization": [
        "localization", "localisation", "website localization",
        "software localization", "app localization",
    ],
    "subtitling_voiceover": [
        "subtitling", "subtitles", "voiceover", "voice-over", "voice over",
        "dubbing", "closed captioning", "captioning",
    ],
    "transcription": [
        "transcription", "transcribe", "transcript service",
    ],
    "desktop_publishing": [
        "desktop publishing", "dtp", "typesetting", "layout formatting",
    ],
}

# Generic "this smells like an event/tender that needs language services"
# signal words, used to decide whether a page changed in a way worth
# surfacing at all (separate from which specific service line applies).
EVENT_SIGNAL_WORDS = [
    "conference", "workshop", "forum", "seminar", "delegation", "exhibition",
    "summit", "training", "tender", "rfq", "rfp", "request for proposal",
    "request for quotation", "call for bids", "invitation to bid",
    "procurement", "bid notice",
]
