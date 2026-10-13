# 02 — Product Requirements
**Status: Draft V1. All decisions pending approval.**

## Required capabilities
| ID | Feature | Acceptance |
|---|---|---|
| R01 | Campaign setup: title, inclusive start/end dates, currency (PHP default), midweek service day (Wednesday default) | Reject end before start |
| R02 | Add anonymous pledges as Once, Weekly, Monthly, or Per Service | Amount positive and frequency valid |
| R03 | Edit and delete entries, with clear confirmation | Recalculate totals immediately |
| R04 | Project totals and show active entry count + frequency breakdown | Match calculation specification exactly |
| R05 | Separate live projector window | Read-only aggregate display updates after saved changes |
| R06 | Excel XLSX export | Summary, Entries, Settings sheets reconcile with dashboard |
| R07 | Local data persistence | Campaign survives reload in same browser profile |
| R08 | JSON backup/restore | Preview and explicit overwrite consent; invalid file does not harm existing data |
| R09 | Local storage warnings | Explain risk of deletion and backup recommendation |
| R10 | Mobile-responsive and keyboard-accessible UI | Essential flows work without a mouse |

## UX and validation
Campaign title 1–100 characters; ISO calendar dates; maximum campaign span proposed as five years. Amount is a positive integer number of minor currency units, entered to no more than two decimal places for supported two-decimal currencies. Keep projected totals within safe integer range. Optional note up to 140 characters, with warning against personal details. Entry count means **rows**, never unique donors.

Core workflow: create campaign → enter amount → choose frequency → save → projected total updates. There is no registration, member roster, or recurring donation processing.

## Quality constraints
Pure and testable calculation engine; local-only processing by default; reliable backup recovery; full-screen high-contrast display; suitable keyboard and screen-reader semantics; XLSX totals match app exactly. Performance target: update within 200 ms for ordinary campaigns and update a connected second-screen view within one second on a typical laptop (targets requiring measurement).

## Out of scope
Identity and contacts, actual payments, receipts, accounting/fulfillment, cloud accounts, two-device syncing, multi-user editing, fundraising goals, attendance, AI, SMS, and analytics tracking of pledges.

## Release criteria
All critical tests pass, no known critical data-loss defects, valid XLSX download, restore test, local display reconnection, and clear pledge-versus-cash language.