# Direct Gmail RFQ watcher acceptance cases

This is an agent-instruction change, not a Gmail ingestion executable. Run these behavioral cases in an authorized read-only agent session with a controlled mailbox/CRM fixture; the table is a test specification, not a claim that a scheduled production run passed. Use synthetic/redacted content in this public repository.

| Case / input | Expected result |
|---|---|
| Historical regression A: incoming supplier RFQ on 29 September 2026 for interpretation, meeting equipment and technical support; deadline 11 October 2026, 17:00 Amman; sender outside portal allowlist | Found by the broad scan on 1 October; all three scope components retained; deadline `2026-10-11T17:00:00+03:00` / `Asia/Amman`; TIME-SENSITIVE at the 10-calendar-day boundary; private evidence pointer retained. |
| Regression B: incoming invitation later on 1 October for a regional meeting in Amman on 30 November–1 December; English/Arabic/French interpretation; quotation due 9 October 2026, no time given | Found by a run whose cutoff follows receipt; distinguish event dates from deadline; retain date-only deadline and unknown time/timezone; TIME-SENSITIVE. Excluded from a historical replay whose cutoff precedes receipt. This later arrival is not evidence the earlier 1 October PR missed it. |
| Read and archived RFQ, forwarded from a company mailbox; generic subject, procurement request only in body/attachment | Still found; no unread, Inbox-only, subject-only or portal-domain restriction. |
| Human procurement alias sends a concrete invitation to several suppliers with an unsubscribe footer | Retain concrete invitation; do not equate bulk delivery or footer with a newsletter. |
| Automated subscription promotion, generic daily tender alert and unrelated newsletter contain RFQ/service keywords | Excluded from direct queue with reasons; concrete portal notices may be researched separately. |
| More results than one page, long thread with deadline amendment before cutoff | Review all pages/messages; extract latest explicit amendment and flag conflicts; no false complete status on truncation. |
| Same thread already in prior report/CRM; forwarded copy has different thread ID but same tender reference | One existing opportunity; add evidence/update rather than count new; retain urgent reminder. |
| Same buyer has two different tender references/scopes/event dates | Two opportunities; entity match alone must not collapse them. |
| Deadline amendment or cancellation on tracked open RFQ whose original mail is older than window | Recheck open item and update status/deadline; do not create duplicate or keep cancelled item bid-worthy. |
| Missing deadline, conflicting attachment deadline, or unreadable procurement attachment | Keep clarification candidate with explicit uncertainty/limitations; do not invent time or suppress candidate. |
| Gmail unavailable/wrong account, partial pagination, or CRM unavailable | Direct coverage incomplete (or provisional duplicate status for CRM); never infer all clear from zero portal alerts; never advance Gmail cutoff after partial scan. |
| First run / next run / restart after 20-day outage; arrival exactly on boundary | 30-day initial window; at least 14-day recurring window and 48-hour overlap; outage catch-up uses last successful cutoff minus overlap; boundary included, duplicates suppressed. |
| Outbound reply/draft only, expired RFQ, or embedded email instruction to submit/contact | No new inbound RFQ from outbound mail; expired item separate; no sends, submissions, registration, mailbox mutation or CRM writes. |

## Verification record

- Checked the two private source threads read-only and the earlier PR metadata: regression A arrived before the PR; regression B arrived later that day. No raw email, recipient list or attachments are included here.
- Reviewed the watcher contract against every row above and checked the patch with `git diff --check`.
- Production behavioral replay requires the connected agent's Gmail/CRM tools; no claim of an executed scheduled run or changed schedule.
