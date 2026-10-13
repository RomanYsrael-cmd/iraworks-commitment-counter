# 08 — Lightweight Technical Architecture
**Status: Draft V1**

## Proposed stack
React + Vite + TypeScript SPA. IndexedDB for device-local persistence. Pure TypeScript calculations/validation. BroadcastChannel for same-browser live notifications. Browser-side XLSX creation. Optional service worker for cached app assets (to be validated by browser support). Static hosting on Vercel **under an eligible usage plan**, or Cloudflare Pages; production host not yet selected.

## Modules
- ui/: campaign setup, dashboard, pledge form, settings, projector display.
- domain/calculations: recurrence rules and integer-minor-unit totals (pure; no IO).
- domain/validation: campaign, pledge and backup schemas.
- data/repository: IndexedDB operations, atomic writes, migrations.
- live/: BroadcastChannel revision notifications and display recovery.
- export/xlsx: XLSX snapshot and consistency checks.
- export/backup: versioned JSON download and safe restore.

## Data flow
Input → validation → IndexedDB committed transaction → revision notification → both views reload/recalculate → Excel export reads same canonical data. Report and public display must never use separate arithmetic logic.

## Suggested routes
/ campaign chooser; /campaign/:id operator; /campaign/:id/display read-only presentation; /campaign/:id/settings. On static hosting configure SPA fallback/rewrites for direct-link navigation, or choose hash routes to avoid 404s. Never put pledge data or notes in URLs.

## Reliability
UI must handle IndexedDB unavailable/quota errors and blocked popups. Re-read state after refresh/focus because messages are best effort. Service worker should cache only app assets, not accidentally expose/export commitment payloads in public caches. PWA/offline claims require tests on target browsers.

## Boundaries and controls
No server API, no cloud database, no login, no cross-device promise in V1. HTTPS delivery, dependency/license review, appropriate Content Security Policy, safe text rendering, import size limits and schema validation. Reconsider auth/data isolation only when online collaboration is explicitly approved.

## Architecture checkpoints
Approve recurrence rules first. Then choose compatible XLSX library and verify license/bundle size, decide routing strategy and supported currencies, test browser storage/second-screen behavior, and settle production host's current usage terms.