# 06 — Excel Export and Restorable Backup
**Status:** Approved V1 baseline (2026-10-14); implementation pending.

## Excel report (.xlsx)
Generate the workbook inside the browser; no upload to conversion service; no macros. Proposed filename: commitment-counter_CAMPAIGN_YYYY-MM-DD.xlsx. It is a **snapshot report**, not a source of truth or restorable app backup.

### Worksheet: Summary
Campaign name, inclusive dates, service day, currency, export date/time and offset, projected grand total, number of active commitment entries, subtotals by frequency, and pledge-not-cash disclaimer.

### Worksheet: Commitment Entries
One row per entry: opaque entry ID, created/updated timestamps, frequency, pledged amount (Excel numeric value), calculated occurrences, projected amount (Excel numeric value), optional note. Sort stably. Final totals row must equal Summary and UI exactly.

### Worksheet: Campaign Settings
Campaign ID, name, dates, selected weekday, currency, app/export version, and short definitions of the four recurrence rules for audit context.

## Export safety and precision
Use the same calculator and snapshot as dashboard. For text from users, write explicit spreadsheet **text**, not formulas; neutralize formula-like prefixes (=, +, -, @ and control characters). Display monetary precision correctly (PHP two decimals); do not export formatted currency strings as if they were numbers. Open resulting workbook in Microsoft Excel and another compatible viewer during QA. No CSV required in V1.

## JSON backup (actual restore format)
Export a versioned envelope with schemaVersion, exportedAt, appVersion, campaigns, entries, and relevant settings. Preserve UUIDs, ISO dates, amount minor units, and revisions. Do not treat XLSX as backup.

Restore sequence: select JSON file → size/type limit → parse and validate full schema and referential integrity → show preview and entry count → explicit replace confirmation (or copy import when supported) → atomic database transaction → verify totals. On any failure, existing local data remains unchanged. Old schema migration only if explicitly supported/tested.

## Data-loss notice
Browser storage may be cleared or evicted, private/incognito data may not persist, and data does not migrate with a new device/browser. Encourage JSON backups after each church event and before destructive operations. Offer backup next to Excel export, not hidden in settings.

## Privacy
Optional notes may be included in XLSX; user should avoid entering identities or confidential information. The public screen never shows notes. Exports stay local unless the operator chooses to share them.