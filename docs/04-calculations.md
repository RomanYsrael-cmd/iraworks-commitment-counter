# 04 — Calculation Specification
**Status: Draft V1; owner must approve recurrence semantics before implementation.**

## Canonical definitions
Campaign start and end are inclusive local calendar dates (YYYY-MM-DD). A pledged amount is stored as a positive integer in minor currency units (PHP centavos by default). Projected value per row = amount × occurrence count. Grand total = sum of row projections. Entry count = number of active rows, **not donors**.

## Frequency rules
- **ONCE:** exactly 1 occurrence for every valid campaign.
- **WEEKLY:** occur on campaign start date, then every 7 calendar days through end inclusive; count = floor(day difference / 7) + 1. This deliberately does not depend on Sunday services.
- **MONTHLY:** occur on the original campaign start day-of-month in each later month until end inclusive; if day does not exist, clamp to the last day of that month, without shifting the original anchor (Jan 31 → Feb 28/29 → Mar 31).
- **PER_SERVICE:** count every Sunday plus every occurrence of the configured midweek day (Monday–Saturday, Wednesday default). Count each date once.

All date counting uses calendar arithmetic, never elapsed UTC milliseconds divided by 24 hours (DST issues). Reject dates out of order, invalid amounts, and numeric overflow. Changing campaign settings recalculates from source entries. Currency changes do not perform conversion and must warn.

## Synthetic test example
2026-10-11 to 2026-10-25 inclusive, Wednesday midweek:
| Frequency | Pledge | Occurrences | Projection |
|---|---:|---:|---:|
| ONCE | PHP 1,000 | 1 | PHP 1,000 |
| WEEKLY | PHP 100 | 3 | PHP 300 |
| MONTHLY | PHP 200 | 1 | PHP 200 |
| PER_SERVICE | PHP 50 | 5 (3 Sundays + 2 Wednesdays) | PHP 250 |
| **Total** | | | **PHP 1,750** |

## Edge cases
A one-day Thursday campaign yields Once=1, Weekly=1, Monthly=1, Service=0. Jan 31–Mar 31 in 2027 yields monthly occurrences Jan 31, Feb 28, Mar 31 (3); in leap year 2028 it uses Feb 29. The original workbook range 2023-10-11 to 2024-01-28 has 110 inclusive days: Weekly=16, Monthly=4 on the 11th, and Sunday+Wednesday Service=32.

## Invariants
Breakdown sums to grand total exactly, every view/export uses the same calculation library, count is never negative, and totals are not misrepresented as cash collected.