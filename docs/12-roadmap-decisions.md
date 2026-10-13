# 12 — Roadmap, Assumptions and Decision Log
**Status: Draft V1 — no final decisions are considered approved yet.**

## Milestone A — documentation sign-off
Review this package, accept recurrence rules, settle currencies/hosting/license, agree on acceptance criteria.

## Milestone B — UX design
Design campaign setup, operator dashboard, pledge form, export/backup controls and fullscreen second-screen view. Prototype event workflow on laptop + projector.

## Milestone C — V1 engineering
Implement pure calculator and tests, IndexedDB repository, entry CRUD, campaign settings, live same-browser screen, Excel report, JSON backup/restore, and responsive/accessibility work.

## Milestone D — release
Regression tests, XLSX validation, user-guide trial with nontechnical operator, privacy copy, deploy static build to approved host, postrelease bug fixes.

## Proposed V1.1 (not promised)
Authenticated accounts, cloud backup, secure cross-device live display, optional read-only share links with expiry, multi-operator permissions.

## Proposed V2 (not promised)
Actual collection tracking clearly separated from pledges, fulfillment status, reconciliation reports, optional goals and charity-specific enhancements.

## Decision log (all OPEN as of 2026-10-13)
| ID | Decision | Current proposal |
|---|---|---|
| D01 | Product name | IraWorks Commitment Counter |
| D02 | Target | Churches + nonprofits, anonymous-first |
| D03 | Weekly rule | Every seven days from campaign start |
| D04 | Monthly rule | Original start day with month-end clamp |
| D05 | Per-service rule | Sundays + one selected Mon–Sat midweek day |
| D06 | Currency | PHP default; shortlist other supported two-decimal currencies |
| D07 | Storage | IndexedDB local-first; user JSON backup |
| D08 | Display | Same browser profile / connected second screen |
| D09 | Reporting | XLSX summary/entries/settings |
| D10 | Hosting | Static on eligible Vercel plan or Cloudflare Pages |
| D11 | Source license | **Not selected**; do not claim open source |
| D12 | URL | commitments.romanlms.com (candidate) |
| D13 | Long-term pricing | V1 free-to-use; future optional services undecided |
| D14 | Offline support | App-shell caching after first online load, subject to testing |

## Change management
A written approval can promote a decision to Approved V1, but V1 remains editable during development. Each scope or recurrence change updates PRD, calculation tests, user guide and changelog together; changes after launch use versioned migrations where needed.