"""Best-effort contact info extraction from a source page's text.

This is a coarse regex pass over the page, not a verified directory entry —
a matched email or phone number still needs a human to confirm it's the
right contact before anyone reaches out. Its only job is to save someone
from having to re-open the page themselves to find a way in.

This module runs unattended in `crawler/run.py` on a GitHub-hosted runner,
so it never calls a paid enrichment service (no human present to see or
approve the cost). Verifying what this finds — or finding a contact this
missed — against Apollo.io happens one stage later, in the `lead-to-deal`
skill's "Contact research" step, where a human approves each proposal.
"""

from __future__ import annotations

import re

EMAIL_RE = re.compile(r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}")

# Loose international/local phone pattern: an optional +country code, then
# groups of digits separated by spaces, dots, or dashes, 7-15 digits total.
# Deliberately permissive — false positives are cheap to eyeball and discard,
# missed phone numbers are not.
PHONE_RE = re.compile(
    r"(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?){2,4}\d{2,4}"
)

# Lines that look like they're introducing a contact rather than being an
# arbitrary run of digits (e.g. a copyright year or an unrelated ID).
CONTACT_CONTEXT_WORDS = [
    "contact", "tel", "phone", "mobile", "whatsapp", "email", "e-mail",
    "reach us", "get in touch", "inquiries", "enquiries",
]


def extract_emails(text: str) -> list[str]:
    return sorted(set(EMAIL_RE.findall(text)))


def extract_phones(text: str) -> list[str]:
    hits = []
    for line in text.splitlines():
        lower = line.lower()
        if any(word in lower for word in CONTACT_CONTEXT_WORDS):
            hits.extend(m.strip() for m in PHONE_RE.findall(line))
    # Drop anything too short to plausibly be a phone number (stray digit
    # groups like a year or a heading number).
    return sorted({h for h in hits if len(re.sub(r"\D", "", h)) >= 7})


def extract_contacts(text: str) -> dict[str, list[str]]:
    contacts = {}
    emails = extract_emails(text)
    phones = extract_phones(text)
    if emails:
        contacts["emails"] = emails
    if phones:
        contacts["phones"] = phones
    return contacts
