# IraWorks Commitment Counter

**Status:** V1 implementation is complete on `feat/stitch-commitment-counter-v1`; the pull request is not merged and this is not a production release. Approval of the product requirements does not constitute release sign-off.

A local-first commitment counter and projection tool for churches and nonprofit organizations. It supports anonymous pledge entry, recurring projections, a real Excel report, versioned JSON backup and restore, and a same-device live display for a TV or projector.

> **Projected commitments are pledges, not money received.** This app is not an accounting or payment-processing system.

## Run locally

Requirements: Node.js 24 (the CI baseline) and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. No runtime account, backend, or API key is required. Stitch credentials were used only to create the design references and are not part of the application.

## Features

- Create, edit, select, and archive campaigns. PHP is the default currency; supported two-decimal currencies are PHP, USD, EUR, GBP, CAD, AUD, NZD, and SGD. Changing currency relabels amounts and does not convert them.
- Add, edit, and delete anonymous commitment entries with Once, Weekly, Monthly, or Per Service frequency. While Amount is focused, arrow keys cycle frequencies; Enter saves; the last successful frequency stays selected for the next entry. Counts and projections follow the approved inclusive calendar rules in [the calculation specification](docs/04-calculations.md).
- Persist campaigns and entries in the current browser profile's IndexedDB. Dashboard and read-only display windows on the same device and browser profile re-read the committed data after revision notifications.
- Open the live display in a separate window and fullscreen it for a projector. It shows aggregate amounts and optional aggregate count/frequency breakdown, never entry notes. Campaign Settings can upload, preview, replace, and remove a local background image; a darkened image and high-contrast content panel keep the display readable.
- Export a three-sheet `.xlsx` report (Summary, Commitment Entries, Campaign Settings) and a separate, versioned `.json` backup. Backups include campaign display backgrounds. Validate a backup and preview it before importing as a copy or explicitly replacing local data.
- Responsive layouts, keyboard-operable forms and dialogs, focus handling, reduced-motion controls, semantic live announcements, and Playwright axe checks.

## Quality commands

```sh
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
npm audit
```

The browser suite uses Playwright Chromium; the workflow is also defined in `.github/workflows/ci.yml`.

## Data and backup

Commitments and optimized campaign backgrounds are stored only in IndexedDB for the browser profile and origin in use. Backgrounds accept JPEG, PNG, or WebP up to 5 MB and are stored as JPEG at up to 1920 × 1080 and 1 MB each; SVG and animated GIF are rejected. JSON backups are limited to 50 MB with up to 12 MB of combined background images, and old V1 backups without images remain supported. There is no login, server database, cross-device sync, or cloud backup. Browser storage may be cleared or evicted; private browsing may discard it. Download a JSON backup after each event and keep it somewhere safe. Excel is a report, not a restorable backup. Do not enter donor identities or sensitive information in notes.

The app currently does not cache its static shell with a service worker. Once the app is already loaded, entry and display workflows use local browser data; a fresh load or reload still needs the site assets to be available from the host.

## Documentation and design references

- [Operator quick start](docs/15-user-guide.md)
- [V1 implementation report](docs/implementation-report.md)
- [Approved product and technical documents](docs/)
- [Google Stitch project and screen manifest](docs/stitch/screens.json)
- Stitch source project: [IraWorks Commitment Counter](https://stitch.google.com/projects/656374960065096271)

Generated Stitch screenshots and HTML references are stored under `docs/stitch/`. They document design input; the running React application provides the functional behavior.

## Release boundary

This branch is not merged or deployed. Production hosting, final domain, source-code license, and public release approval remain owner decisions. The public repository does not grant a license by itself.
