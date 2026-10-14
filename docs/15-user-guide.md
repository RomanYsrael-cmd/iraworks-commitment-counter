# 15 — Operator Quick Start
**Status:** Updated for the V1 implementation on `feat/stitch-commitment-counter-v1` (2026-10-14); not yet merged or released.

## 1. Create a campaign
Open the app in a supported desktop or mobile browser. Select **New campaign**. Enter a title, inclusive start and end dates, currency (PHP default), and midweek service day (Wednesday default). Save. Supported currencies are PHP, USD, EUR, GBP, CAD, AUD, NZD, and SGD; changing currency does not convert amounts.

## 2. Add commitments
Enter the pledged amount and choose:
- **Once:** pledged one time.
- **Weekly:** pledged every seven days, starting with campaign start.
- **Monthly:** pledged on the day-of-month of campaign start, with month-end fallback.
- **Per Service:** pledged each Sunday plus the selected midweek service day.

Press **Add commitment**. The dashboard updates after the IndexedDB save completes. You do **not** need to record member names. Each row is a commitment entry, not necessarily a distinct person.

## 3. Use a projector / TV
Connect your projector or TV as an **extended desktop**. Click **Open live display**, move its separate window to the projector, and choose fullscreen. Leave the dashboard on the operator's screen. The display shows aggregate projected commitments and the optional aggregate entry count/frequency breakdown; it never shows individual entries or notes. Both windows must use the same device, browser profile, and app origin. If the browser blocks popups, allow the popup and try again.

## 4. Correct an entry
Choose Edit or Delete from the entry history. Verify the amount and frequency. Totals and live screen should update after successful save. Changing campaign dates or service day also recalculates recurring projections.

## 5. Download the Excel report
Click **Export Excel**. The `.xlsx` includes Summary, Commitment Entries, and Campaign Settings. Amount and projection cells are numeric. Use it for sharing/reporting. The figures are **pledges projected**, not money actually received. The workbook is not a restorable app backup.

## 6. Back up your editable work
Click **Download JSON backup** after each event. Keep a secure copy outside the browser. To restore, choose a JSON file, review its campaign and entry counts, then import as a copy or explicitly confirm replacement. Invalid or oversized files are rejected before local data changes.

## Important warnings
- Local data may disappear if site storage is cleared, the device is lost, or private/incognito mode ends. There is **no cloud sync in V1**.
- Excel is **not** an app backup: keep the JSON file.
- A second screen works when both windows share the same browser profile on one device. Separate TV/browser devices require a future online feature.
- The current build has no service worker. After initial load, its open tabs use local data; loading or refreshing the app requires the hosted app files to be reachable.
- The app is tested with automated Chromium browser checks. Other browser families and physical projector/TV setups have not been verified for this release candidate.
- This app does not collect payments or verify pledge fulfillment. Do not report projected total as donations received.
- Do not include donor personal information in optional notes.

## Troubleshooting
**Display not updating:** check the same device, browser profile, and app origin; confirm the operator save completed, then return focus to or refresh the display window. **Cannot download:** check browser download settings. **Missing commitments:** check browser profile/campaign; restore a recent JSON backup if available. **Spreadsheet totals differ:** verify campaign dates and recurrence rules, then report as a product defect. **Browser storage unavailable:** use a supported non-private browser profile with site storage enabled; keep a JSON backup before continuing if data remains accessible.
