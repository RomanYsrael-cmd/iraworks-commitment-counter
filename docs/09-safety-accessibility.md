# 09 — Privacy, Security and Accessibility
**Status:** Approved V1 baseline (2026-10-14); implementation and automated Chromium accessibility checks are in place on `feat/stitch-commitment-counter-v1`. This is not a regulatory or accessibility certification.

## Privacy by default
V1 records amounts and pledge frequencies anonymously. It does not require names, contact details or church member accounts. Operator should not put donor identities or sensitive information in the optional note. No pledge data is transmitted to an IraWorks server in the local-first design.

## Data ownership and limitations
Records live in the current browser profile's IndexedDB. Anyone with access to that browser profile and unlocked device could access the records. Private browsing, device loss, clearing site data, or browser eviction may delete them. Neither static hosting nor XLSX export is cloud backup. Provide clear warnings and encourage JSON backups stored securely by the organization.

## Display privacy
Public presentation shows projected totals and optional aggregate counts/breakdown only. No individual amounts, identifiers, notes, edit history, browser debug output, or personal data. Require a separate operator window and recommend extended rather than mirrored display where needed.

## Threats and mitigations
- Malicious/corrupt JSON file → size limit, full schema validation, duplicate-ID and reference checks, atomic restore.
- Spreadsheet formula injection → store user-controlled text as literal cells and neutralize risky prefixes before export.
- XSS → escape strings using framework text rendering; avoid raw HTML for campaign titles/notes.
- Unwanted loss/overwrite → confirmation, transactionality, backup callouts, and restore preview.
- Unauthorized access to shared computer → user is responsible for device/browser access controls; V1 has no authentication.
- Supply-chain risks → lock dependencies; review changes and licenses; enable dependency alerts.
- Cloud or telemetry leakage → no analytics capturing commitments, notes, or detailed errors containing amounts.

## Accessibility goals
Target WCAG 2.2 AA: keyboard-only task completion, labeled inputs, visible focus, sufficient contrast, adaptable text size, semantic table headers, dialog focus return, meaningful error descriptions, screen-reader announcements of saved updates, reduced-motion controls and no flashing. Test at large text zoom and 1366×768 laptop, 1920×1080 projector, and mobile widths.

## Financial wording and boundaries
Every total explicitly says **Projected Commitments**, not “Donations Received.” Product is a pledge projection utility, not a financial ledger, donation processor, tax-receipt generator, or certified accounting tool.

## Open governance
Select a public source-code license (if any), terms/privacy notice, retention guidance, and production-host plan before general public launch. A public GitHub repo alone does not grant an open-source license.
