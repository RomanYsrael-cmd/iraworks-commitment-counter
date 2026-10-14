# V1 Implementation Report

**Branch:** `feat/issues-4-5-kbd-banner`

**State:** V1 Issues #4 and #5 implementation and local QA complete; pull request pending. Not merged or deployed.

**Scope:** Approved V1 only. No authentication, hosted database, payment processing, or production configuration.

## Application

The application is a React, Vite, and TypeScript single-page app. Pure calendar-day calculations and validation live under `src/domain/`; `src/data/` owns versioned IndexedDB records and atomic updates; `src/live/` transports revision invalidations; `src/export/` creates XLSX reports and validates/restores JSON backups; and `src/ui/` implements the operator and projector workflows.

Amounts are positive integer minor units, and every view and export uses the same calculation functions. Weekly entries start on the inclusive campaign start date and recur every seven calendar days. Monthly entries preserve the original day-of-month anchor and clamp to each month's final day. Per Service counts Sundays and the configured Monday–Saturday service day once each. The app supports PHP, USD, EUR, GBP, CAD, AUD, NZD, and SGD, with no currency conversion.

Each committed campaign change increments its revision. A same-device display window receives a BroadcastChannel invalidation and re-reads IndexedDB; when BroadcastChannel is unavailable, it polls, and it also re-reads on focus, visibility, and page restoration. The projector route contains aggregates only.

## Issues #4 and #5

- Quick entry supports previous/next frequency selection with the four arrow keys while Amount retains focus. Enter uses the existing form submission path; a synchronous guard prevents double saves. Successful saves clear Amount/Note, keep Amount focused, and retain the selected frequency. Radio keyboard behavior remains native; frequency changes announce through a live region. Canceling an edit restores the pre-edit selection.
- Dashboard dates display `MMM-DD-YYYY` from ISO calendar components without timezone conversion. Its local-storage warning and explanatory total subtitle were removed only from the Campaign Dashboard; onboarding and settings/backup warnings remain.
- Campaign settings support preview, upload, replace, and remove for local JPEG/PNG/WebP images. Files are signature-checked, limited to 5 MB input and 40 MP, resized to fit 1920 × 1080, and compressed to JPEG up to 1 MB. SVG and animated GIF are rejected. A failed write reports the storage error and keeps the previous saved image.
- The optional `liveBannerDataUrl` campaign field is backward-compatible with existing IndexedDB campaign records and V1 backups. Background images remain isolated by campaign ID, trigger the existing post-commit revision sync, are copied during import-as-copy, and are restored with the campaign. Backup imports are bounded to 50 MB with a 12 MB aggregate image-data limit.
- The projector uses centered `cover` scaling, a dark gradient, and an opaque dark content panel; the bright-image browser fixture confirms the text stays readable while the banner remains visible. The branded fallback is unchanged when no custom image is saved.

Issue screenshots generated from synthetic test data: [Campaign Dashboard](screenshots/issues-4-5-dashboard.png) and [Live Display with a bright uploaded banner](screenshots/issues-4-5-live-display.png).

## Google Stitch design work

The real Google Stitch project is [IraWorks Commitment Counter](https://stitch.google.com/projects/656374960065096271), project ID `656374960065096271`. The generated screens, screenshot PNGs, and HTML source references are indexed in [`docs/stitch/screens.json`](stitch/screens.json), with artifacts under `docs/stitch/screenshots/` and `docs/stitch/html/`. The project includes desktop and verified mobile screen designs for welcome/setup, dashboard/entry, history, and settings/backup, plus the widescreen projector view. Stitch returned one desktop result to an earlier mobile history prompt; that result is labeled and preserved alongside the verified mobile screen.

Stitch CLI version used: `@google/stitch` 0.11.1. The project has a Stitch-generated shared design system, ID `bdead35abb514a1c973a4e781fcafc5f`, named “Pastoral Stewardship.” The exact `theme.designMd` content returned by Stitch is preserved as [`docs/stitch/generated/design.md`](stitch/generated/design.md), and the full resource response is saved beside it as JSON. The `design.md` file was extracted from Stitch's returned design-system resource; it was not pre-created or hand-authored.

## Quality assurance

All requested local checks passed:

| Check | Result |
|---|---|
| `npm run lint` | Passed |
| `npm run typecheck` | Passed |
| `npm test` | 26 tests passed across 6 files |
| `npm run build` | Passed |
| `npm run test:e2e` | 5 Playwright Chromium tests passed |

Automated coverage includes recurrence and boundary rules, safe integer money arithmetic, IndexedDB persistence and failed-write/restore rollback, old/new backup validation/copy/replace, workbook sheet and numeric-total checks, formula-like text safety, quick-entry arrow/Enter/sticky-frequency/edit-cancel behavior, campaign date formatting and dashboard copy, image validation/compression/quota handling, banner persistence and live sync, and responsive Chromium/Axe checks. Synthetic screenshots are stored under `docs/screenshots/`. The production build reports the lazy-loaded ExcelJS export chunk at 936.98 kB minified (270.75 kB gzip), and notes two Rollup comments from Zod that it removes. The spreadsheet library loads when the operator requests an export, but this remains a bundle-size follow-up.

## Known limitations

- Data stays in the current browser profile's IndexedDB. There is no cloud backup, login, or cross-device display sync.
- The app does not ship a service worker. An already loaded app tab uses local data, but a fresh load or refresh needs the hosted static assets.
- Automated end-to-end coverage uses Chromium. Other browser families and physical projector hardware were not part of this run.
- The XLSX file was generated and reopened in ExcelJS in tests. Microsoft Excel and LibreOffice desktop applications were not available for a separate manual compatibility check.
- Stitch mockups contain generated illustrative examples (including campaign names and sample totals). They are design references only; the application starts without seeded campaign or commitment data.
- The generated design system recommends web fonts, while the application uses system fonts and makes no external font requests.
- Production hosting, a final domain, product license, and general release approval remain owner decisions.
