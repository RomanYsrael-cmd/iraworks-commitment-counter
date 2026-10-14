# 16 — Codex Stitch + Full V1 Implementation Handoff
**Status:** Implementation authorized by owner (2026-10-14); work has not yet been executed.
**Repository:** RomanYsrael-cmd/iraworks-commitment-counter
**Local Windows path:** `D:\UserData\Documents\GitHub\iraworks-commitment-counter`
**Credential name:** `STITCH_API_KEY` already in the local process environment; **do not ask for or expose its value**.

## Mission
Using the merged and approved docs/01–15 as source of truth, **use Google Stitch to design the app first, then fully implement an operational production-quality V1 website**. This is not a design-only sprint or placeholder proof of concept. Prioritize fast entry at a church service, accurate projected totals, readable projector mode, reliable exports, data safety, and easy setup.

## Step 0 — safe start
- In the path above, inspect `git status`, branches, README, AGENTS and docs. Preserve all pre-existing local changes; do not reset/overwrite unrelated work. Fetch/pull the merged `main` if clean and create a separate feature branch `feat/stitch-commitment-counter-v1`.
- Check environment variable presence without printing it. Use the official Google Stitch SDK/CLI integration. Current official code and usage: https://github.com/google-labs-code/stitch-sdk ; https://www.npmjs.com/package/@google/stitch . Determine the installed version/commands from official help, rather than inventing an API. Node 20+ if required.
- Do not store credentials in any checked-in file or logs. Provide `.env.example` only for optional future nonsecret settings (avoid even needing a key for the runtime app).
- Record Stitch project IDs and screens used, assets imported, and any integration limitations in an implementation report.

## Step 1 — real Stitch generation first
- Generate or refine screens in a Stitch project titled **IraWorks Commitment Counter** using `STITCH_API_KEY`, following official installed SDK or CLI.
- Brief Stitch to make a modern warm, trustworthy, clean church/NPO utility; accessible, minimal, mobile-responsive. Avoid generic SaaS pricing/login screens, gimmicks and unrelated dashboard widgets.
- Generate at least: (1) welcome/new campaign, (2) operator dashboard + ultra-fast pledge entry, (3) entry history/edit state, (4) campaign/settings + backup/export, (5) live TV/projector fullscreen display; adapt desktop/mobile layouts and 16:9 projector view. Provide meaningful empty/loading/error/success states.
- Save/record actual Stitch output HTML/screenshots/references in a safe project design area. **Let Stitch generate `design.md` if supported by its workflow. Do not fabricate or manually precreate that file.** If Stitch does not produce it, record the real source links/assets instead and report that limitation.
- Derive the app look and component hierarchy from the Stitch output, while replacing any placeholder demo data or nonfunctional markup with real React functionality. Stitch-generated HTML is a design reference, not permission to ship a static mockup.
- Do not report Stitch success unless real generated screen IDs/artifacts exist.

## Step 2 — functional implementation
**Stack**: React + Vite + TypeScript, accessibility-oriented semantic UI, lightweight styling/components, IndexedDB local-first; no authentication/backend. Separate domain/calculation, local database, live-sync, and export modules.

1. Campaign: create/select/edit/archive a campaign with name, start/end inclusive local dates, PHP default currency, selected midweek day (Mon–Sat, Wednesday default); validate. No currency conversion. Optional other 2-decimal currencies are okay if clearly documented/tested.
2. Entry CRUD: amount plus Once/Weekly/Monthly/Per Service selector, add/edit/delete, optional short note, entry count as rows, aggregated subtotals.
3. Calculation spec exact: Once ×1; Weekly every seven calendar days from campaign start; Monthly original start day with month-end clamp; Per Service every Sunday plus configured midweek weekday; date interval inclusive; integer minor-unit money; reject overflow/invalid dates. See docs/04 and docs/10 for fixtures/acceptance tests.
4. Persistence: versioned IndexedDB, reliable transaction and revision notifications. Reload, app restart, and multiple campaigns retain their data. Never imply save succeeded if storage failed.
5. Live display: dedicated read-only fullscreen route opened in new window for external monitor, same origin/browser profile; BroadcastChannel invalidation + authoritative IndexedDB re-read on initial load/event/focus; fallback and disconnected warnings where feasible. Expose no notes or individual entries.
6. Report: generate real `.xlsx` locally with Summary, Commitment Entries, Campaign Settings. Numeric money cells, proper dates/timestamps, recurrence descriptions, safe text to prevent spreadsheet formula injection, totals reconciled with UI.
7. Recovery: download versioned JSON backup (distinct from Excel), schema-checked import preview, explicit overwrite/copy decision, atomic restore, no loss on invalid file, robust storage warnings.
8. Offline: optionally cache static app shell using service worker if thoroughly tested; ensure local pledge entry never requires a backend connection after app loads.
9. UX: responsive mobile, desktop and projector; keyboard support, focus handling, sufficient contrast, screen-reader semantics, reduced motion, pleasant clean empty states, minimal click workflow.
10. Safety: no person records, payment collection, cloud data, analytics containing pledge data, external export service, or V1.1/V2 scope.

## Step 3 — robust QA
- Unit tests for each recurrence, leap years/month-end, same-day periods, overflow and invalid input. Include 2026-10-11–2026-10-25 fixture total PHP 1,750.
- Integration tests for CRUD, IndexedDB persistence/transaction failure, JSON roundtrip & corrupted import, XLSX sheet contents/totals/formula-injection safety, cross-window update/reload recovery, and campaign-settings recalculation.
- End-to-end browser tests for onboarding to export and projector using Playwright or equivalent. Test representative mobile width and second-screen aspect ratio.
- Run install/build, lint, typecheck, all tests. Document commands and results. Fix errors; don't leave TODO stubs or placeholder event handlers.
- Run `git diff` / `git status` and inspect for inadvertent secrets, private workbook data, and uncommitted assets.

## Step 4 — handoff and delivery
- Update README with real setup, local run, build/test, known local-storage limitations and backup steps. Update docs when actual implementation differs from specifications, and record any owner-decision items.
- Commit code and generated-safe Stitch artifacts to the feature branch, push and open a PR against main with screenshot(s), test results, architecture summary, Stitch reference IDs/links and clearly identified residual limitations.
- Do not deploy to production or change domains/DNS without separate explicit approval; preview builds are acceptable on eligible hosting.
- If Stitch auth/tooling fails, report the precise blocker rather than claiming screens were generated. Finish any safe independent implementation work you can, but clearly distinguish real Stitch-derived design from placeholders.
- Success = fully functional V1 satisfying approved requirements; not merely a pretty homepage or generated mock screens.

## Authoritative documents
docs/01 product brief; docs/02 PRD; docs/03 UX; docs/04 calculation contract; docs/05 live display; docs/06 Excel and JSON; docs/07 data model; docs/08 architecture; docs/09 safety; docs/10 tests; docs/11 deployment; docs/12 decision log; docs/13 sanitized workbook analysis; docs/14 backlog; docs/15 user guide.

## Non-negotiables
No published secrets; no original workbook in repo; no `design.md` hand-authored before Stitch; no made-up sync between separate devices; no donor tracking/payment collection; don't represent pledge projections as donated funds; no automatic source-code license addition.
