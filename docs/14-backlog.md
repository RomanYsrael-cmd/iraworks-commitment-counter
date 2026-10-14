# 14 — Prioritized Implementation Backlog
**Status:** Approved V1 baseline (2026-10-14); implementation status is recorded below for `feat/stitch-commitment-counter-v1`. Production-release gates remain open.

## Phase 1 — domain and persistence (critical path)
- [x] Set up React/Vite/TypeScript app, lint/test scripts and CI.
- [x] Implement calendar-day utilities + pure occurrence functions for all four frequencies.
- [x] Add money-minor-unit arithmetic and safe-range validation.
- [x] Add documented unit tests and recurrence edge cases.
- [x] Implement versioned IndexedDB schema, CRUD and transaction tests.
- [x] Build campaign setup and settings; warn on invalid dates/currency rename.

## Phase 2 — operator experience
- [x] Create responsive dashboard total and frequency subtotals.
- [x] Build amount + frequency rapid entry, edit/delete, and clear validation.
- [x] Persist and load campaigns; handle quota/unsupported storage gracefully.
- [x] Provide browser-local data warning and entry-count label.

## Phase 3 — presentation
- [x] Read-only fullscreen live display layout.
- [x] BroadcastChannel revision invalidations and authoritative IndexedDB re-read.
- [x] Handle reload/focus recovery, popup blockers, reduced motion, and no-BroadcastChannel polling.
- [ ] Rehearse on physical extended display hardware, including privacy separation.

## Phase 4 — report and backup
- [x] Generate local XLSX with Summary, Commitment Entries, Campaign Settings.
- [ ] Verify external Excel/LibreOffice compatibility; unit and browser tests verify numeric cells, safe text export, and reconciled totals using ExcelJS.
- [x] Generate versioned JSON backups, import preview, schema validation and atomic restore.
- [ ] Add post-event backup reminders; the app displays persistent local-storage and backup notices.

## Phase 5 — launch quality
- [x] Automated keyboard, focus, contrast, mobile viewport, and axe accessibility checks. Manual screen-reader, zoom, and projector legibility review remains.
- [ ] CI unit/integration/end-to-end tests and simulated storage-denial/quota tests; transaction rollback is covered.
- [ ] Finalize product terms and license; supported currency list is documented, hosting plan remains pending.
- [ ] Configure DNS, HTTPS, SPA route fallback, preview and production deployment.
- [ ] Conduct end-user rehearsal with church operator and release guide.

## Definition of done for each ticket
Behavior satisfies linked requirements; unit/behavior tests included; no new privacy leak; local backup/restore and projector workflows unaffected; documentation updated. The owner approved the recurrence rules on 2026-10-14; development may proceed from the merged main branch.
