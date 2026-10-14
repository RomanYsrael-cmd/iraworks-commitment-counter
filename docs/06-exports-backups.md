# 06 — Excel Export and Restorable Backup
**Status:** Approved V1 baseline (2026-10-14); XLSX and JSON workflows implemented on `feat/stitch-commitment-counter-v1`. See [implementation report](implementation-report.md) for validation and release limitations.

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
Export a versioned envelope with schemaVersion, exportedAt, appVersion, campaigns, entries, and relevant settings. Preserve UUIDs, ISO dates, amount minor units, revisions, and optional campaign `liveBannerDataUrl` image data. New backups store optimized JPEGs inline; import-as-copy remaps campaign and entry IDs while keeping each campaign's image. Older V1 backups without the optional image field remain valid. Do not treat XLSX as backup.

Restore sequence: select JSON file → enforce the 50 MB file limit and 12 MB combined image-data limit → parse and validate full schema, image data, and referential integrity → show preview and entry count → explicit replace confirmation (or copy import when supported) → atomic database transaction → verify totals. On any failure, existing local data remains unchanged. Campaign images are optional within schema version 1, so pre-image backups still import without migration.

## Data-loss notice
Browser storage may be cleared or evicted, private/incognito data may not persist, and data does not migrate with a new device/browser. Encourage JSON backups after each church event and before destructive operations. Offer backup next to Excel export, not hidden in settings.

## Privacy
Optional notes may be included in XLSX; user should avoid entering identities or confidential information. The public screen never shows notes. Exports stay local unless the operator chooses to share them.
