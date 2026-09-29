# Client Reference Selection & Case-Study Workflow

This repository is public. This document contains process only, not the private client register.

The private Client Reference Register is the authority for engagement status, naming permissions, evidence, and context-specific restrictions.

## A. Proposal reference selection

### 1. Eligibility gate
A named reference is eligible only when all of the following are true:
- engagement status is verified/confirmed enough to support the claim;
- usage class is `PUBLIC_NAMED` or `PROPOSAL_NAMED`;
- the specific fact being cited is supported by evidence;
- no context-specific restriction blocks the use;
- the prospect is not the same organization where a “do not cite to itself” restriction applies.

`PENDING`, `PRIVATE_ONLY`, and `PROSPECT_ONLY` are never named in an external proposal.

If no named reference is eligible, use an anonymised experience statement only when the register permits it.

### 2. Relevance score
Score each eligible reference before drafting:

| Factor | Weight | Guidance |
|---|---:|---|
| Service match | 30 | Same service/deliverable is strongest |
| Sector/client-type match | 25 | Same sector or institutional profile |
| Event/project-type match | 15 | Same procurement/event/project shape |
| Language/geography match | 10 | Relevant language pair or region |
| Evidence completeness | 10 | Scope/results supported by records |
| Recency | 5 | More recent, comparable work preferred |
| Strategic credibility | 5 | Recognisable/relevant institutional proof |

**Total: 100.**

Do not manufacture a score for missing facts. Missing support gets zero for that factor.

### 3. Selection rule
Default:
- use the strongest **1–3** references in the proposal body;
- add more only in a credentials/experience appendix when useful;
- relevance beats prestige;
- do not repeat the same reference in multiple sections without a reason.

### 4. Drafting rule
For every selected reference:
- state only supported facts;
- keep the description proportional to the evidence;
- do not expose private rates, contacts, participant identities, confidential documents, or unapproved outcomes;
- do not use a logo unless logo permission is separately recorded;
- do not quote a testimonial unless testimonial permission is separately recorded.

### 5. Proposal audit note
The internal proposal working note should record:
- reference ID(s) considered;
- selected reference ID(s);
- reason selected;
- usage class checked;
- evidence checked;
- any anonymisation applied.

The external proposal should not show internal permission labels or reference IDs unless intentionally used as an internal appendix.

---

## B. Public case-study workflow

### 1. Candidate detection
A case-study candidate may be raised after a verified delivered engagement, especially when it demonstrates:
- a priority service;
- complex multilingual/event delivery;
- institutional credibility;
- distinctive equipment/technical integration;
- measurable or documentable outcome;
- a reusable lesson or proof point.

### 2. Evidence gate
Before drafting, collect the supported fields that actually exist:
- client/reference ID;
- engagement/date/location;
- challenge/context;
- services delivered;
- languages;
- equipment/technology actually used;
- scale/counts where documented;
- delivery approach;
- result/feedback where documented;
- approved photos/video;
- naming permission;
- logo permission;
- testimonial permission.

Missing fields remain missing. Do not infer them.

### 3. Identity path
- `PUBLIC_NAMED` → named case study may be drafted.
- `ANONYMISED_ONLY` → case study may be drafted with identifying details removed.
- `PROPOSAL_NAMED` → not sufficient for public named use; anonymise only if separately allowed.
- `PENDING` / `PRIVATE_ONLY` / `PROSPECT_ONLY` → no public case study naming.

### 4. Case-study structure
Use:
1. **Context / challenge**
2. **What Linguative delivered**
3. **Languages / technical setup** — only verified facts
4. **Delivery approach**
5. **Outcome / evidence**
6. **Why it matters** — concise commercial proof, not exaggerated marketing
7. **CTA** appropriate to the service

### 5. Privacy and claims
Never publish:
- contacts;
- attendee identities;
- confidential material;
- rates;
- unapproved client logos;
- unapproved testimonials;
- invented metrics or results.

### 6. Approval
A case study remains a draft until Ala approves the final public version. Approval of the text does not automatically grant a logo/testimonial permission that the register does not already contain.

### 7. Register update
After approval/publication, update the private Client Reference Register with:
- final usage status;
- published URL/file;
- approved wording scope;
- logo/testimonial permissions;
- date last verified.

---

## C. Automation handoff

### Sales & BD Operations
Before generating a proposal or credentials section:
1. retrieve the private register;
2. filter by eligibility;
3. score relevant candidates;
4. choose the smallest useful set;
5. record the internal audit note;
6. draft with evidence-backed facts only.

### ChatGPT Marketing Manager
Before drafting a named case study, client-logo wall, testimonial post, or public credentials section:
1. retrieve the private register;
2. check public naming permission and separate logo/testimonial permissions;
3. choose named or anonymised path;
4. draft only from supported evidence;
5. send through Ala approval before publication.

### Operations / Engineering
May transport/store reference IDs and permission categories, but must not make a client public-use permission decision on their own.
