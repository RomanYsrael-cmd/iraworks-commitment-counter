# 11 — Deployment and Operations Runbook
**Status:** Approved V1 baseline (2026-10-14); implementation pending.

## Environment
The initial architecture is a static React/Vite app; no server or secret environment variables are required to record commitments. Local data belongs to each browser profile, not the hosting platform. Do **not** upload the original financial workbook or pledge exports to the public repo.

## Build / release workflow
1. Run TypeScript lint/type checks, unit and browser tests, and production bundle build.
2. Review dependency license and version lockfile.
3. Preview a pull request; smoke-test dashboard, second-screen behavior, XLSX export, JSON backup/restore.
4. Select hosting: Vercel on a plan permitted for IraWorks business use, or an eligible Cloudflare Pages configuration; recheck current plan limits and policies.
5. Configure DNS and HTTPS for the final subdomain after ownership verification; avoid publishing placeholder URLs as production.
6. Configure SPA route rewrites or hash routing so deep links do not 404.
7. Deploy via protected main branch and review release checklist.

## Suggested public hostname
Product-specific subdomain such as commitments.romanlms.com (proposal, not configured). Marketing/site branding should not block the free product.

## Observability without data collection
Prefer aggregate static traffic and error monitoring that does **not** capture amounts, notes, IDs or exported files. If telemetry is added later, disclose and gain necessary consent. Investigate browser data issues with synthetic reproduction cases rather than collecting private church records.

## Backups and upgrades
App hosting has no authoritative server-side database to back up. Users are prompted to save JSON locally after events. Schema migrations must be backward compatible/tested before release; provide a backup-first notice when storage version changes.

## Rollback
Maintain a known-good deployment for static assets, but remember rolling back application code does **not** restore deleted local IndexedDB data. Do not deploy irreversible schema changes without backup/migration tests.

## Release-gate owners
Product scope/calculation rules: product owner. Functional QA: engineering. Privacy/terms/hosting license decision: IraWorks owner. Accessibility and display verification: product QA.