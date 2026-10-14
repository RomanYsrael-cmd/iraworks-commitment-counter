# 10 — Test Strategy and Acceptance Criteria
**Status:** Approved V1 baseline (2026-10-14); automated unit, repository, workbook, and Chromium end-to-end coverage is implemented. See [implementation report](implementation-report.md) for the final commands and limitations.

## Calculation tests — must be automated
| Test | Expected |
|---|---|
| Valid one-day Thursday, ONCE/WEEKLY/MONTHLY/PER_SERVICE | 1 / 1 / 1 / 0 |
| 2026-10-11 through 2026-10-25, Wed midweek, mixed synthetic pledges | PHP 1,750 (reference in calculations spec) |
| 2023-10-11 through 2024-01-28, weekly count | 16 |
| Same period, monthly anchored 11th | 4 |
| Same period, per-service Sun + Wed | 32 |
| Jan 31–Mar 31, 2027, monthly | 3 occurrences using Feb 28 |
| Jan 31–Mar 31, 2028, monthly | 3 occurrences using Feb 29 |
| Campaign end before start | Reject |
| Zero, negative, bad amount precision, overflow | Reject |
| Same source entries across calculator/dashboard/export | Exactly equal minor-unit totals |
| Changing midweek day | Only PER_SERVICE projections change |
| Dates spanning DST changes | Calendar counts remain correct |

## Workflow tests
Campaign creation/edit/archive; add/edit/delete entries; entry count defined as rows; persistence after reload and browser restart; storage-denied/quota failure clearly shown; user retains data after failed backup import. Confirm cancellation of deletion leaves data intact.

## Live display tests
Open on second monitor, fullscreen, add/edit/delete propagates after successful save, refresh display reconstructs, campaign-date changes propagate, popup blocked fallback, disconnected state, inactive window recovery, low animation/reduced motion, no notes visible.

## Export/restore tests
XLSX opens in Excel and alternate spreadsheet viewer; exactly three sheets; rows and totals reconcile; entry notes beginning with = or + do not execute as formulas; no macros; JSON round-trip yields exact campaign and entry data; unsupported version/corrupt JSON rejected atomically; duplicate IDs rejected; oversized file rejected.

## Device/browser coverage
Latest supported versions of Chrome, Edge, Firefox and Safari, plus mobile Chrome/Safari for operator. Check which browsers support BroadcastChannel/IndexedDB consistently and use fallback or documented limitation. Test 100, 1,000 and 5,000 entries for response-time target.

## Manual release checklist
- No critical data loss/incorrect total
- Warnings for local storage and projected-versus-collected values visible
- Keyboard-only and screen-reader core tasks pass
- Browser refresh/direct route doesn't 404
- XLSX and JSON exports downloadable and correct
- Display hides private details and recovers from missed updates
- Production domain HTTPS and applicable hosting plan verified
- Product owner signs off open questions and approved V1 scope
