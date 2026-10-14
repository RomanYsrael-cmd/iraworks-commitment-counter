# 05 — Same-Device Live Display
**Status:** Approved V1 baseline (2026-10-14); same-device live display implemented on `feat/stitch-commitment-counter-v1`, not yet merged or released.

## Purpose
A read-only screen suitable for a church projector, TV, or second monitor. The operator enters pledges privately on a laptop; the public display automatically shows aggregate **Projected Commitments**.

## Screen content
Campaign title, prominent currency-formatted projected total, optional “Commitment Entries” count, optional breakdown by frequency, connection status, fullscreen control. No donor records, individual entries, notes, or operator edit controls. Use high contrast, auto-sizing type, keyboard focus, and reduced-motion number transitions.

## Optional campaign background
Campaign Settings accepts JPEG, PNG, and WebP files up to 5 MB. SVG and animated GIF are rejected. The browser decodes the selected image, scales it within 1920 × 1080, and compresses it to a JPEG no larger than 1 MB before saving it in that campaign's IndexedDB record. A visible preview is available before save. Replace and remove changes are committed locally; a failed write leaves the previously saved image unchanged. The image is used only on that campaign's live display and is included in JSON backup/restore.

The projector background uses centered `cover` scaling. A dark gradient keeps the image visible, and a dark translucent content panel and text shadows protect title, totals, and breakdown contrast over light or detailed photographs. The default IraWorks green background remains when no custom image is saved. The settings preview uses the same treatment. Each saved image update increments the campaign revision so already-open display windows re-read the campaign from IndexedDB.

## Synchronization contract
1. Operator validates and writes entry/setting changes to IndexedDB and commits transaction.
2. Operator increments campaign revision and publishes a lightweight event with campaign ID + revision through BroadcastChannel. **Do not broadcast raw pledge data.**
3. The display receives the event, re-reads the authoritative saved campaign and entries, and recalculates through the shared calculation engine.
4. Display must read on initial load, refresh, regained focus/visibility, and reconnect; missed events cannot permanently lose updates.
5. For unsupported BroadcastChannel, consider a same-device polling fallback; surface degraded status.

Only tabs/windows on the **same origin, compatible browser storage partition, and browser profile** share data. Different devices, browser profiles, or private windows do not synchronize in V1.

## Acceptance tests
- Add, edit, delete, campaign-date and midweek-day edits update display promptly (< 1 second target under normal conditions).
- Reload display reconstructs accurate totals; refresh and restart do not show an invented zero as if authoritative.
- A failed save never updates public total.
- Closing presentation does not affect saved pledges.
- Stale/disconnected display does not falsely claim LIVE.
- Opening display via button handles popup blockers, with user-visible manual link.
- No private entry notes exposed even via display debug text.

## Event-day operator instructions
Extend the computer screen; open display using direct click; move to projector; fullscreen; make a test entry and verify; keep operator dashboard off public screen. Use the JSON backup after the service.

## Explicit later feature
A Smart TV/browser on another device requires real online sync plus authenticated secure access and is **not** covered by V1.
