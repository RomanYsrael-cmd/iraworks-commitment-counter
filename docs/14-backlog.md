# 14 — Prioritized Implementation Backlog
**Status:** Approved V1 baseline (2026-10-14); implementation pending.

## Phase 1 — domain and persistence (critical path)
- [ ] Set up React/Vite/TypeScript app, lint/test scripts and CI.
- [ ] Implement calendar-day utilities + pure occurrence functions for all four frequencies.
- [ ] Add money-minor-unit arithmetic and safe-range validation.
- [ ] Add documented unit tests and recurrence edge cases.
- [ ] Implement versioned IndexedDB schema, CRUD and transaction tests.
- [ ] Build campaign setup and settings; warn on invalid dates/currency rename.

## Phase 2 — operator experience
- [ ] Create responsive dashboard total and frequency subtotals.
- [ ] Build amount + frequency rapid entry, edit/delete, and clear validation.
- [ ] Persist and load campaigns; handle quota/unsupported storage gracefully.
- [ ] Provide browser-local data warning and entry-count label.

## Phase 3 — presentation
- [ ] Read-only fullscreen live display layout.
- [ ] BroadcastChannel event/revision transport and initial re-read.
- [ ] Handle reload/focus recovery, popup blockers, stale warnings and reduced motion.
- [ ] Test laptop + extended display, including privacy separation.

## Phase 4 — report and backup
- [ ] Generate local XLSX with Summary, Commitment Entries, Campaign Settings.
- [ ] Verify numeric cell types, workbook compatibility, safe text export, and aggregate matching.
- [ ] Generate versioned JSON backups, import preview, schema validation and atomic restore.
- [ ] Add backup reminders after event and before destructive operations.

## Phase 5 — launch quality
- [ ] Keyboard/screen-reader test, contrast, zoom, mobile viewport and projector legibility.
- [ ] CI unit/integration/end-to-end tests and storage-failure tests.
- [ ] Finalize product terms, license, supported currency list, and approved hosting plan.
- [ ] Configure DNS, HTTPS, SPA route fallback, preview and production deployment.
- [ ] Conduct end-user rehearsal with church operator and release guide.

## Definition of done for each ticket
Behavior satisfies linked requirements; unit/behavior tests included; no new privacy leak; local backup/restore and projector workflows unaffected; documentation updated. The owner approved the recurrence rules on 2026-10-14; development may proceed from the merged main branch.