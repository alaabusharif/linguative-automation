# Pre-Test Blockers and Required Corrections

These must be addressed before the parallel test is meaningful. None requires deleting a live routine.

## 1. Current strategy file is stale

`marketing/strategy.md` still says Instagram and YouTube are inactive and uses the prior per-platform language assumptions. The locked Marketing Bible now requires:
- LinkedIn, Instagram, Facebook, GBP and YouTube in the channel system;
- 70% English / 30% Arabic over a rolling 10-post cycle;
- 60% static / 40% video over a rolling 10-post cycle;
- native robust Arabic, not translated copy;
- platform-specific adaptation rather than identical copy-paste.

Before any content parity test, the strategy bus must reflect the new policy so old routines and the new system are not being tested against different instructions.

## 2. Institutional scouting prompt must be captured completely

The current source prompt is a living 9k+ character knowledge base with 10 lead classes, personas, company mappings and Vibe search gotchas. The public migration docs summarize it but do not contain the complete operational knowledge.

Before the source trigger can be retired, copy its complete current prompt into a secure, non-public successor configuration or private migration record and reconcile it into the Sales & BD scouting module.

## 3. Sales & BD successor must be built before retirement testing

The Claude handoff only grouped routines by role label. It did not create a true consolidated successor. Build the modular owner described in `02-sales-bd-consolidation-spec.md` first. Then shadow-test module by module.

## 4. Strategy handoff must be live

ChatGPT owns `marketing/strategy.md` in the target model. Direct-write mechanics must be available before retiring the old marketing-manager strategy author. Until then, the old strategy writer remains rollback/source-of-truth for live downstream routines.

## 5. Design QA must move before the design skill is archived

The old skill's useful value is its failure-detection discipline, not the fact that it is a Claude skill. Implement the expanded QA gate in the Marketing Manager workflow and prove it across the required output mix before archiving the old skill.

## 6. Mailbox safety successor must be shadow-tested

New rule: suspicious first offense is label-for-review, not trash. The live responder should not be changed until the successor or amended prompt is tested on representative mail. Never claim Spam-folder visibility that the connector does not have.

## 7. Instagram publishing connection

Instagram is in scope. If Metricool is not connected to the Instagram professional account, that is a publishing-connection gap, not a reason to omit Instagram from content planning.

## 8. Exact logo verification — PASSED

The two repo logo files were compared against the two user-confirmed uploaded files at the Git-blob level and match exactly:

- `marketing/brand/logos/logo-navy-gold-light-bg.png` Git blob SHA: `c15fa25ab34ac0390aa183dfc8ffc1f53898bb68`
- `marketing/brand/logos/logo-white-gold-dark-bg.png` Git blob SHA: `dbcaae4518f1dc735a61cfa7bba6cddc39297080`

User-uploaded files produced the same Git blob SHAs. The active repo logo files are therefore byte-identical to the two locked versions.

Historical logo variants should remain separated from active-use assets.

## 9. Full-history security claim remains unproven

Current HEAD may be clean, but that is not a full-history secret/client-name audit. Do not state that the entire public repository history is clean until the history review is completed.

This does not block architecture consolidation; it blocks only the stronger security claim.
