# IraWorks Commitment Counter

**Status:** Draft V1 — documentation-first, specifications pending owner approval.

A simple, free-to-use commitment counting and projection utility for churches and nonprofit organizations. Core functions: anonymous pledge entry, recurring projections, an Excel (.xlsx) report, same-device live projector display, and offline-friendly local storage with backup/restore.

> **Important:** Projected commitments are pledges, **not money received**. This is not an accounting or payment-processing system.

## Documentation

- [01 — Product brief](docs/01-product-brief.md)
- [02 — Product requirements](docs/02-product-requirements.md)
- [03 — User flows and UI](docs/03-user-flows.md)
- [04 — Calculation specification](docs/04-calculations.md)
- [05 — Live display](docs/05-live-display.md)
- [06 — Excel export and backups](docs/06-exports-backups.md)
- [07 — Data model](docs/07-data-model.md)
- [08 — Technical architecture](docs/08-architecture.md)
- [09 — Privacy, security and accessibility](docs/09-safety-accessibility.md)
- [10 — Test and acceptance plan](docs/10-testing.md)
- [11 — Deployment and operations](docs/11-deployment.md)
- [12 — Roadmap and decisions](docs/12-roadmap-decisions.md)
- [13 — Original Excel workbook analysis](docs/13-workbook-analysis.md)
- [14 — Implementation backlog](docs/14-backlog.md)
- [15 — User guide](docs/15-user-guide.md)

## Proposed V1 stack

React + Vite + TypeScript; IndexedDB for on-device persistence; BroadcastChannel plus persistence re-read for same-browser second-screen updates; client-side XLSX creation; static hosting on an eligible Vercel plan or Cloudflare Pages. No login or cloud database in V1.

## Status and ownership

All product and technical decisions are **proposals**, not signed-off or production-ready requirements. This public repository does **not** grant an open-source license until a license is explicitly selected and added. Avoid uploading the original workbook if it contains private information.
