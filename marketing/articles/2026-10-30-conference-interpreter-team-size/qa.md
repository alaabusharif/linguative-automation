# QA record: conference interpreter team size

**Draft digest:** `2e4599ac7fdc200a7d012e95f649c8aac7ea800a8255d981242f9cd8794b98ff`

## Completed

- [x] One EN/AR pair only for ISO week 44.
- [x] No other draft article is present in the current catalog.
- [x] Current live EN/AR Insights inventory checked for overlap.
- [x] Existing social/resource brief checked; article expanded into a distinct decision framework.
- [x] Publisher data contract and validation code reviewed.
- [x] Both languages include all renderer fields: title, description, summary, intro, eyebrow, reading time, sections, checklist, FAQs, related services, CTA and quote service.
- [x] Related service slugs and quote service belong to the publisher allowlist.
- [x] Draft contains no approval object and remains `status: draft`.
- [x] EN/AR content digest calculated using the publisher’s canonical JSON rule over `{slug,en,ar}`.
- [x] Technical claims checked against current primary/professional sources.
- [x] Hypothetical example labelled in both languages.
- [x] No client names, testimonials, rates, equipment counts, confidential information or fabricated results.
- [x] Arabic uses `عمّان، الأردن` and `شركة الإبداع اللغوي`.
- [x] SEO/AEO/GEO review completed with dated evidence and claim boundaries.

## Render checks

- [x] Isolated renderer execution against the current article template.
- [x] EN HTML title, canonical/hreflang, headings, FAQ and CTA inspection.
- [x] AR HTML `lang=ar`, `dir=rtl`, title, headings, FAQ and CTA inspection.
- [ ] Desktop and mobile screenshots inspected for clipping and RTL issues.
- [x] Confirm draft entry is ignored by the normal publication validator/build.

The exact current-design EN/AR preview HTML rendered successfully and is included in the review package. Automated desktop/mobile screenshot inspection could not be completed because the disposable headless-browser binary was unavailable and its download failed. This limitation is disclosed rather than treated as a pass. Nothing in this draft has been deployed to staging or production.

## Publication hold

Publication is blocked until:

1. render QA is complete;
2. the draft PR is reviewed; and
3. Ala explicitly approves the exact final EN/AR content.

Passing tests, opening or merging a draft-review PR, or approving the topic alone does not satisfy the content approval gate.

