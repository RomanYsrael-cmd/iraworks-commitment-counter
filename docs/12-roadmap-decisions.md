# 12 — Roadmap and Decision Log
**Status:** Approved V1 baseline (2026-10-14); application not yet implemented or released.

## Owner approval
On **2026-10-14 (Asia/Manila)** the product owner explicitly approved the draft V1 documentation in PR #1 and authorized moving into Google Stitch UI design and complete V1 implementation. Scope and calculation decisions are approved but remain **V1** and may be revised in later reviewed changes. Approval does not imply QA completion, production launch, licensing, or paid service commitments.

## Milestone A — documentation (approved)
V1 PRD, formulas, workflows, local storage, same-device live display, Excel export, JSON backup, testing and architecture are the approved implementation baseline.

## Milestone B — Stitch design (next)
Use actual Google Stitch project/screen generation with the developer's local STITCH_API_KEY; create/edit polished designs for campaign setup, operator dashboard/entry, report/backup/settings, and projector view. Stitch must generate any design.md artifact; do **not** invent or hand-author design.md as a substitute for using Stitch. Preserve real Stitch project IDs, screen references and assets when available. Review responsive and accessibility behavior.

## Milestone C — complete V1 app
Implement React/Vite/TypeScript, calculation tests, IndexedDB, campaigns, entries, read-only same-browser projector sync, local XLSX generation, versioned JSON backup/restore, keyboard/mobile access, offline-friendly operation and clear error states.

## Milestone D — QA and launch readiness
Automated and manual tests, projector rehearsal, backups, browser compatibility, accessibility review, license selection, approved commercial hosting plan and deployment. No production deploy until hosting/domain approvals.

## Future iterations (not V1 promises)
**V1.1:** Secure authenticated cloud backup/cross-device presentation/collaboration. **V2:** Optional collected payments and fulfillment, visibly separate from pledge projections.

## Decision register
| ID | Decision | Status | Notes |
|---|---|---|---|
| D01 | IraWorks Commitment Counter | Approved V1 | Product name |
| D02 | Churches/NPOs, anonymous-first | Approved V1 | No member identity needed |
| D03 | Weekly every seven calendar days from campaign start | Approved V1 | Not tied to Sunday count |
| D04 | Monthly anchored to campaign start day, month-end clamp | Approved V1 | Original anchor preserved |
| D05 | Per-service counts Sunday + selected distinct Mon–Sat weekday | Approved V1 | Wednesday default |
| D06 | PHP currency default; no FX conversion | Approved V1 default | Exact optional additional supported two-decimal currencies is an implementation detail to document |
| D07 | IndexedDB and user-managed versioned JSON backup | Approved V1 | No cloud persistence |
| D08 | Same-device/profile live projector view | Approved V1 | Separate-device TV sync deferred |
| D09 | XLSX: Summary, Commitment Entries, Campaign Settings | Approved V1 | Restorable backup is JSON instead |
| D10 | Static hosting, production eligibility/plan | Pending release decision | Vercel eligible paid plan or Cloudflare Pages |
| D11 | Source code license | Pending owner decision | Public repo is NOT automatically open source |
| D12 | Production URL: commitments.romanlms.com | Proposed / unconfigured | Owner to approve DNS and domain |
| D13 | V1 free to use | Approved V1 | Future paid services undecided |
| D14 | Local-first/offline-friendly design | Approved V1 | Offline availability depends on verified browser cache support |

## Change policy
Update affected documentation and regression tests together. New requirements require owner review; avoid scope creep and do not silently convert V1 into church management or accounting software. Owner approval is not a certification of app behavior until tested.