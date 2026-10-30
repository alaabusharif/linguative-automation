# QA and approval — interpreter preparation article, 20 October 2026

## Exact copy approval

Ala approved the complete bilingual article in the directly relevant ChatGPT conversation on 20 October 2026 at 10:18 Asia/Amman: “I've read the bilingual article. I approve it for publishing.”

This is an assistant record of direct human approval, not a claim that Ala submitted a separate GitHub review. Approval is tied to the reviewed PR #95 head `3cca4a9c9203ea421e42c540321ab7b00bf71101` and canonical publisher SHA-256 over `{slug,en,ar}`:

`1a650d31126f4250eaa58df93c43930e7f5d540d4f30be2a93fb7357eb0676c6`

The English and Arabic fields are unchanged. Approval metadata is now recorded in the draft catalog and article source. Status remains draft solely to prevent the installed old publisher from releasing the article before the host code update. No further copy approval is needed unless content changes.

## Passed

- Public EN/AR Insights inventories checked; fifteen existing topics preserved. The new pair focuses on document preparation and acknowledged revisions.
- Public native template, application JS, styles and fonts copied into a disposable local site. No private host routing was accessed.
- All nine publisher tests passed against that snapshot without skips, including native design, protection of existing pages, rollback, repeat-run and draft exclusion checks.
- Added EN/AR regression assertions in publisher fix PR #96 for the real observed related-link text boundary defect.
- Generated JS syntax passed. Both native-template and draft meaningful text-node sequences were compared before/after hydration.
- Fixed draft: 118 meaningful text nodes before and after hydration in each language, with no text differences.
- Current native baseline: 101 meaningful text nodes before and after hydration in each language, with no text differences.
- EN/AR at 1440px and 390px: correct language direction, loaded fonts, no missing preview assets, no horizontal overflow, six article sections, six checklist items, three FAQs.
- Arabic mobile layout visually inspected. Sandbox rendering only; no live form submissions or analytics traffic.
- Offline review ZIP retains the unchanged approved copy and native visual design. Its preview date is provisional, not proof of publication.

## Diagnosed mismatch and corrected code

The previous generated page merged each related-service title and its arrow into one HTML text node. The native React component renders two adjacent text children. Preserving React's `<!-- -->` separator eliminates the additional draft-specific #425 error without changing visible text or layout.

PR #96 contains the fix, regression assertions and a checksum-verified deployment runbook. It was merged at `d47791552c34ce8951ff702d204666dec27e95a5`.

Existing #418/#423 recoveries remain in both the untouched baseline and fixed draft (nine #418 and one #423 per tested language). This fix does not claim to repair those pre-existing site recoveries. The article-specific text mismatch has been resolved.

## Remaining deployment hold

The installed host publisher does not automatically update executable code; cron syncs catalog data only. Merging PR #96 therefore does not prove host installation.

Required next action: install the fixed private script using `website/blog-publisher/deploy-related-link-fix.md`, verify SHA-256 `d6812d29027c35688a5b82b734fce31a27f72c891cfb8db243c13be11715d8e9` and dry-run output on the actual host. Preserve the cron and private configuration. No host shell connection is available in this session, so this step has not been performed or inferred.

Then recheck the deployed build, promote only status/evidence metadata, and merge the scoped approved-catalog handoff. Let the existing cron publish. Positively verify both language URLs, exact content, self canonicals/hreflang, Insights links and sitemap before calling it Published.

## Current state

- ISO week: 2026-W43; only pending pair: `prepare-conference-interpreters-documents`.
- Copy: approved by Ala; unchanged.
- Technical fix: tested and merged; host installation unverified.
- Production article catalog: empty and unchanged.
- Publication: held; no published URLs verified.
- Future routine: mandatory dated SEO/AEO/GEO evidence directive added under Ala's instruction, without modifying this approved pair.


## Publication verification — 30 October 2026

The private host publisher update was installed on 29 October 2026 with the existing cron preserved. Ala then confirmed that the article had published. A fresh public verification on 30 October established:

- English URL returned HTTP 200 with the exact approved English title and content: https://linguative.net/insights/prepare-conference-interpreters-documents
- Arabic URL returned HTTP 200 with the exact approved Arabic title and content: https://linguative.net/ar/insights/prepare-conference-interpreters-documents
- Each page had a self-referencing canonical and the expected EN/AR/x-default hreflang set.
- Both live Insights indexes linked to the article.
- The sitemap contained the article slug.
- The approved content digest remained `1a650d31126f4250eaa58df93c43930e7f5d540d4f30be2a93fb7357eb0676c6`.

The source record status is corrected from `draft` to `approved` as metadata only; the bilingual copy and approval digest are unchanged. The article is **Published**. HTTP 200 and sitemap inclusion do not by themselves establish Google indexing, rankings or conversions.
