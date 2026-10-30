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

## Exact approval — 30 October 2026

Ala directly approved this exact bilingual revision for publication in the relevant ChatGPT conversation on 30 October 2026: “Approved for publication.” The approval followed delivery of PR #117, the EN/AR review package, the digest and the disclosed limitation that automated desktop/mobile screenshots could not be captured in this environment.

Approval is tied to the unchanged canonical publisher digest over `{slug,en,ar}`:

`2e4599ac7fdc200a7d012e95f649c8aac7ea800a8255d981242f9cd8794b98ff`

This is a record of Ala’s direct human approval, not a claim that a separate GitHub review was submitted. No copy changed after approval. The catalog and focused article record may now change only from `draft` to `approved` and add this approval evidence. The existing publisher cron is responsible for publication after the metadata-only handoff merges.

The missing automated screenshot capture remains disclosed; the exact current-template EN/AR HTML had already rendered successfully and all structural RTL, metadata and schema checks passed. Ala’s publication approval was given with that limitation stated.

## Publication verification — 30 October 2026

The approval handoff merged in PR #119 at 20:53 Asia/Amman. The existing private publisher cron released the article without any manual server change. Positive public verification completed at approximately 21:01 Asia/Amman:

- English: https://linguative.net/insights/how-many-interpreters-conference-needs — HTTP 200, exact approved title and content marker, `lang=en`, `dir=ltr`, self canonical, reciprocal EN/AR/x-default hreflang, and Article/FAQ/Breadcrumb structured data.
- Arabic: https://linguative.net/ar/insights/how-many-interpreters-conference-needs — HTTP 200, exact approved title and content marker, `lang=ar`, `dir=rtl`, self canonical, reciprocal EN/AR/x-default hreflang, and Article/FAQ/Breadcrumb structured data.
- Both EN/AR Insights indexes link to the article with the correct titles.
- The sitemap contains both article URLs.
- The approved digest remains `2e4599ac7fdc200a7d012e95f649c8aac7ea800a8255d981242f9cd8794b98ff`.

State: **Published and positively verified.** This verification does not claim Google indexing, rankings, traffic or conversions.

