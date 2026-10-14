# Instructions for coding agents

- Read README.md and all docs/01 through docs/16 before modifying product behavior. **Approved V1 baseline:** 2026-10-14.
- Implement the complete V1 app, not a mockup. Create real functional screens, calculations, local persistence, export/restore, live second-screen synchronization, tests, and build.
- **Use Google Stitch first** for screen designs; read docs/16-codex-handoff.md. Use the existing local environment variable `STITCH_API_KEY`. Never print/commit a key or write it into .env files.
- **Do not manually author `design.md` as a substitute for Stitch.** If the Stitch workflow creates it, retain its generated content/provenance. Preserve generated project/screen references and assets so implementation is grounded in the actual design.
- Keep all monetary values in integer minor units; dates are inclusive calendar dates. The approved calculation rules in docs/04 are authoritative and must be tested before UI work is considered done.
- “Projected Commitments” is never “Funds Collected.” No donor names required; no payment processing or cloud sync.
- Privacy: do not check in original workbook, real pledges, screenshots with private records or tokens. Use synthetic test data.
- Public read-only projector display is **same-device/browser-profile** only. XLSX is a report; JSON is the restorable backup.
- Prefer well-maintained dependencies with suitable licenses. Do not add MIT or other source license without explicit owner instruction; public repo alone is unlicensed.
- Work in a dedicated implementation branch. Keep commits focused and open a PR with verifiable test results and screenshots. Do not silently deploy production or modify DNS.
- Favor boring, predictable UX over feature creep. Do not implement V1.1/V2 features until requested.
