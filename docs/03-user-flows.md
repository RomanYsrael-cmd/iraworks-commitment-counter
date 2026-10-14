# 03 — User Flows and UX
**Status:** Approved V1 baseline (2026-10-14); implemented on `feat/stitch-commitment-counter-v1`, not yet merged or released.

## Screens
1. **Campaigns:** first-run welcome, new campaign, saved campaigns, prominent local-data notice.
2. **Setup:** name, start/end date, currency, optional midweek service day; defaults sensible.
3. **Operator Dashboard:** projected total, entry count, frequency subtotals, rapid pledge entry, entry history with edit/delete, Export Excel, Backup, Open Live Display.
4. **Presentation:** clean full-screen view of aggregate projected total, optional entry count/breakdown.
5. **Settings:** edit campaign, backup, restore, storage warning, display preferences.

## Primary flow
Open site → Create campaign → Confirm dates → Enter pledged amount → Select one of four frequencies → Add commitment → Dashboard total and presentation update. Amount and frequency are the only required entry fields.

## Second-screen flow
Connect projector as extended monitor → press Open Live Display → move new window to external screen → enable fullscreen → add/edit pledges on laptop. Projector must never reveal entry notes or editing controls. If popups blocked, expose a regular Open Display link. Check a sample entry before event starts.

## Export and recover
Export Excel creates a report of current campaign, not a backup. Download JSON backup to preserve editable data. Restore validates and previews file, then requires explicit choice to replace data or import it as a separate copy, if supported.

## Failure states
Validation errors are specific and inline. Failed IndexedDB save shows “Not saved” and never triggers false success. Date or currency changes warn that projections/labels change (currency is not converted). Delete asks for confirmation; undo desirable. Damaged backup rejected without mutation. Projector may display Reconnecting if stale.

## Design principles
Big, simple controls; high contrast; usable on mobile and desktop; no mandatory person names; term “Projected Commitments” on every summary; tab-accessible dialogs; reduced-motion support; avoid loud animation or flashing during services.
