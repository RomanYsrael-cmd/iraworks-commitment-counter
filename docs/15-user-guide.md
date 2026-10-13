# 15 — Operator Quick Start
**Status: Draft V1 — planned behavior, not instructions for a released product.**

## 1. Create a campaign
Open the site in your preferred browser. Select New Campaign. Enter campaign title, start date, end date, currency (PHP suggested default), and midweek day (Wednesday suggested default). Save. Dates are inclusive; the system will use these to project recurring pledges.

## 2. Add commitments
Enter the pledged amount and choose:
- **Once:** pledged one time.
- **Weekly:** pledged every seven days, starting with campaign start.
- **Monthly:** pledged on the day-of-month of campaign start, with month-end fallback.
- **Per Service:** pledged each Sunday plus the selected midweek service day.

Press Add Commitment. Totals update automatically. You do **not** need to record member names. Each row is a commitment entry, not necessarily a distinct person.

## 3. Use a projector / TV
Connect your projector or TV as an **extended desktop**. Click Open Live Display, move its window to the projector and turn on fullscreen. Leave the dashboard on the operator's screen. The projector shows aggregate projected commitments only, not private notes. If the browser blocks popups, open the provided display link manually.

## 4. Correct an entry
Choose Edit or Delete from the entry history. Verify the amount and frequency. Totals and live screen should update after successful save. Changing campaign dates or service day also recalculates recurring projections.

## 5. Download the Excel report
Click Export Excel. The XLSX includes Summary, Commitment Entries and Campaign Settings. Use it for sharing/reporting. The figures are **pledges projected**, not money actually received.

## 6. Back up your editable work
Click Download JSON Backup after each event. Keep a secure copy outside the browser. To restore, select Restore JSON, review preview and entry counts, and explicitly confirm the replacement/import.

## Important warnings
- Local data may disappear if site storage is cleared, the device is lost, or private/incognito mode ends. There is **no cloud sync in V1**.
- Excel is **not** an app backup: keep the JSON file.
- A second screen works when both windows share the same browser profile on one device. Separate TV/browser devices require a future online feature.
- This app does not collect payments or verify pledge fulfillment. Do not report projected total as donations received.
- Do not include donor personal information in optional notes.

## Troubleshooting
**Display not updating:** check same browser/profile and origin, ensure operator entry saved, refresh projector window. **Cannot download:** check browser download settings. **Missing commitments:** check browser profile/campaign; restore recent JSON backup if saved. **Spreadsheet totals differ:** verify campaign dates and recurrence rules, then report as a product defect.