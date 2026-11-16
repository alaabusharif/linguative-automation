# QA record: bilingual event signage and screen content

**Draft digest:** `a6348412bc65017333c084d33fc4bbb6d04d4eaac8fb2281bde4968e04bf298b`

## Editorial decision

This is the only new EN/AR article pair prepared for ISO week 47. It addresses item-level content control for bilingual signs and screens, which is not covered by the 15 unmanaged live Insights articles or the four managed published articles. It does not duplicate the active interpretation-equipment briefing resource draft.

## Dated SEO/AEO/GEO evidence

### SEO

- **HarborRank Search Console read, 16 November 2026; final GSC window 16 October–13 November 2026; `sc-domain:linguative.net`; Google Web; global property:** 23 query-page rows and zero clicks in the disclosed result. Relevant rows were sparse: `conference management jordan` produced 1 impression for one service URL and 2 for another; `conference organizers aqaba` produced 3 impressions; and `conference equipment rental jordan` produced 1 impression. These observations do not establish stable rankings, demand or likely traffic. The editorial decision therefore rests on a distinct buyer task, not keyword volume.
- **Semrush Site Audit email, 16 November 2026; project linguative.net; 103 crawled pages:** 98% Site Health, 0 errors, 3 warnings and 20 notices, with no significant change from the previous audit. The warnings were two low text-to-HTML pages and one long title; the notices were 20 resources formatted as page links. This is a technical baseline, not evidence that the article topic will rank. No paid Semrush API report was run.
- **Weekly competitor signal, 4 November 2026; review window 29 October–4 November; Jordan market; manual public-web comparison:** a local event/AV competitor added interpretation-equipment language. That signal supports keeping Linguative's integrated scope clear, but this draft deliberately avoids another equipment article and focuses on content ownership across language, branding, screens and delivery.
- **Public Linguative Insights and service pages, checked 16 November 2026:** the indexed library covers the adjacent topics listed in the editorial decision but not a bilingual signage-and-screen content matrix. The title, description and headings answer the new task naturally without a city doorway page or keyword repetition.
- **Current-analysis gaps:** no current daily GA4 report or dated Google Sheet for 16 November was found in the connected Gmail/Drive searches. HarborRank GA4 was not called because it is metered and no new spending authorisation exists. No current Ahrefs export was found, and paid Semrush keyword/SERP/backlink tools were not called.

### AEO

- The opening answers the main question directly: use one content matrix, approve both languages before design lock, assign decision owners and control versions through rehearsal.
- Question-led sections provide a reusable field list, workflow, trade-offs between stacked and side-by-side layouts, separate print/screen requirements, change control and a ten-item checklist.
- Four FAQs answer plausible buyer questions about unequal text length, name approval, print versus screen files and late changes. The visible answers and publisher-generated FAQ structured data use the same exact text. No featured-snippet or rich-result promise is made.

### GEO

- **Google Search Central, AI features guidance, accessed 16 November 2026:** Google states that normal SEO fundamentals and helpful, reliable, people-first content remain the basis for AI features, with no special AI file or schema required. The draft uses the existing Article/FAQ/Breadcrumb output only and makes important claims visible in the article.
- The article identifies Linguative consistently as `شركة الإبداع اللغوي` in Arabic and describes only the public scope verified on Linguative's service pages: translation, event branding, screens/AV and event delivery within an agreed scope.
- Technical statements about Arabic direction and mixed-direction strings are attributable to W3C and Unicode. The worked example is explicitly hypothetical, and Arabic/English dates, place and scope stay consistent.
- No AI-citation claim, special AI schema, invented affiliation, ranking promise or unsupported superlative appears.

## Source and claim log

- **W3C, Arabic & Persian Layout Requirements, accessed 16 November 2026:** supports that Arabic script and Arabic page structure use right-to-left direction, while numbers and embedded left-to-right scripts require bidirectional handling. https://www.w3.org/TR/alreq/
- **Unicode Standard Annex #9, Unicode Bidirectional Algorithm, Revision 52 dated 1 September 2026, accessed 16 November 2026:** supports the handling of right-to-left and left-to-right characters, numerals and neutral punctuation in mixed strings. https://www.unicode.org/reports/tr9/
- **W3C, Unicode Bidirectional Algorithm basics, accessed 16 November 2026:** supports setting base direction and checking punctuation, numbers and embedded strings rather than manually reversing text. https://www.w3.org/International/articles/inline-bidi-markup/uba-basics
- **Google Search Central, AI features and your website, accessed 16 November 2026:** supports people-first content, internal discoverability, visible text and agreement between visible content and structured data. https://developers.google.com/search/docs/appearance/ai-features
- **Linguative public service pages, checked 16 November 2026:** verify the public scope for event branding/directional signage, translation, screens/playback, AV operation and one coordinated event proposal. https://linguative.net/services/event-conference-management ; https://linguative.net/services/conference-technology-av ; https://linguative.net/services/translation
- **Linguative public Insights index, checked 16 November 2026:** establishes topic distinctness against the current library. https://linguative.net/insights ; https://linguative.net/ar/insights

## Data-contract and content QA

- [x] Full EN/AR fields, sections, checklist, FAQs, related-service slugs and quote-service slug are present.
- [x] Status is `draft`; there is no approval object or fabricated approval evidence.
- [x] Canonical digest uses the publisher's sorted compact UTF-8 JSON over `{slug,en,ar}`.
- [x] A temporary in-memory approved copy passes the current publisher validator; the committed catalog remains draft.
- [x] Related and quote-service slugs are in the current publisher allowlist.
- [x] No client names, testimonials, rates, equipment quantities, certifications, venue relationships or confidential details appear.
- [x] The scenario is clearly labelled hypothetical and uses `Amman, Jordan` / `عمّان، الأردن` consistently.
- [x] Arabic is independent professional MSA, uses `شركة الإبداع اللغوي`, and was checked for RTL-sensitive mixed strings.
- [x] EN and AR FAQ visible text is the same text supplied to the existing FAQ structured-data renderer.

## Preview and renderer QA

- [x] Isolated EN/AR HTML previews were rendered with the current `publisher.py` `new_page()` function.
- [x] The renderer source is the current main-branch publisher, and the HTML template is the most recent committed isolated preview derived from the existing article design. This preserves the reviewed layout without touching production.
- [x] EN preview: `lang=en`, `dir=ltr`, unique canonical and reciprocal EN/AR hreflang URLs, article title, all sections, checklist and FAQs present.
- [x] AR preview: `lang=ar`, `dir=rtl`, unique canonical and reciprocal EN/AR hreflang URLs, Arabic title, all sections, checklist and FAQs present.
- [x] Article, FAQPage and BreadcrumbList JSON-LD parse and match visible title/FAQ text.
- [x] Related links use only the three approved service slugs and retain the current design's React-compatible separator.
- [ ] Full disposable-site integration, index mutation, sitemap mutation and JavaScript-bundle checks could not be rerun because the compatible production snapshot is not present in this workspace. The repository unit suite passes, but its six site-integration tests are skipped for that reason.
- [ ] A desktop/mobile visual render could not be completed in this workspace: local headless Chromium was blocked from creating its process socket. The HTML preserves the current responsive classes and its DOM/RTL checks pass, but the draft is not described as fully visually verified.

## Publication hold

Do not change the catalog status to `approved`, merge for publication or expose a public test URL until Ala approves the exact digest above. Any copy change invalidates the digest and requires renewed approval.
