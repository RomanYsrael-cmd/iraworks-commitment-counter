# 13 — Source Workbook Analysis (Sanitized)
**Status: Draft V1 · Source:** owner-supplied macro-enabled Excel workbook (not included in public repository).

## Structure verified
The original workbook is one worksheet titled as a church commitment counter. It contains start/end campaign dates, a selected midweek service day, four input columns (Once, Per Week, Per Month, Per Service), summary calculations, and displayed totals. It includes a VBA project and an ActiveX component. The public repository intentionally excludes original institution branding, entry values and financial totals.

## Existing calculation approach
- Once: sum of one-time amounts.
- Per Week: weekly amount sum multiplied by number of Sundays in campaign dates.
- Per Month: monthly amount sum multiplied by DATEDIF start/end in completed calendar months.
- Per Service: service amount sum multiplied by counted Sundays plus selected midweek dates.
- Entry count: COUNT across pledge entry cells, not number of donors.

## Improvements in proposed web product
| Observation | New direction |
|---|---|
| Separate spreadsheet columns | Single amount + frequency selector |
| Week estimate uses Sundays | Start-anchored seven-day cadence (explicit proposal) |
| Monthly DATEDIF excludes partial/inclusive months | Calendar occurrences anchored to start day, inclusive |
| Service counts Sundays and selectable midweek | Same model, with explicit distinct weekday validation |
| Count of numeric cells labeled Count | Label “Commitment Entries” |
| No application backup | Versioned JSON backup and safe restore |
| VBA/ActiveX implementation | Browser-friendly TypeScript with no macros |
| Spreadsheet calculated display | Separate read-only projector view + downloadable XLSX |

## Why this matters
The website should preserve the easy pledge-entry concept while correcting ambiguous recurrence rules and reducing errors. The original workbook is a **reference for user intent**, not a formula-for-formula port.

## Confidentiality
Do not commit the workbook, screenshots containing real pledge numbers, donor information, or unredacted exports. Use synthetic fixture data in public documentation, demos, and automated tests.

## Acceptance note
Owners must approve the shift from “weekly = Sunday count” and “monthly = completed months” to scheduled occurrences before V1 is finalized.