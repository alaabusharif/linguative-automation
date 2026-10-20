# QA — interpreter preparation article, 20 October 2026

## Passed

- Both live EN/AR Insights inventories read. Fifteen existing article topics retained; this topic focuses on document handover rather than another general equipment checklist.
- Current public native template, app JS, styles and fonts copied into a disposable local site; no private server files were accessed and no production files were written.
- All nine existing publisher tests passed against that public snapshot, including six integration tests (no skips). These tests use the repository's isolated synthetic fixture, not publication approval for the real article.
- Real article remains `status: draft`; the unchanged publisher validator returns no publishable articles. No Ala approval record was fabricated.
- The actual draft was rendered using the native publisher and current template under an in-memory preview-only gate override. Only an internal digest was used for render-cache bookkeeping; it has no author/approval-reference authority and is never written into the draft catalog.
- Generated application JavaScript passes `node --check`.
- Desktop 1440px and mobile 390px checked in Chromium for EN and AR. Six sections, six checklist entries and three FAQs render; Arabic has `dir=rtl`; fonts load and neither viewport has horizontal overflow.
- Main article text before and after client hydration is identical in the EN comparison.
- Draft offline preview has no analytics, no working enquiry form and no production deployment. Preview date is provisional, not evidence of publication.

## HOLD — not cleared for production

The current native template emits React hydration recoveries (#418/#423) even before adding this draft. The generated draft also emits recoveries and #425. The visible article renders, but the additional draft mismatch has not been isolated. Passing structural tests and correct final appearance are not evidence of error-free hydration.

Claude must inspect the native SSR/client mismatch and confirm whether the draft introduces an additional mismatch before publication. Do not alter the installed publisher executable, live website, analytics or forms in this editorial task. Do not describe this package as fully browser-QA-passed, merge an approved catalog or create an approval record while this material hold remains.

The snapshot is a bounded copy of public linked documents, not the host's authoritative private routing list. Recheck compatibility with the then-current deployed build at final approval. Existing unrelated navigation targets are outside this article's implementation scope.

## Current editorial state

- ISO week: 2026-W43
- Pair: prepare-conference-interpreters-documents
- Copy: complete, ready for Ala's copy review
- Publication approval: none
- Production catalog: unchanged
- Published URLs: none
- Next run: revise this pair / resolve the stated QA hold; do not generate a second pending pair
