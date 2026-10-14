# 07 — Data Model and Persistence
**Status:** Approved V1 baseline (2026-10-14); IndexedDB data model implemented on `feat/stitch-commitment-counter-v1`, not yet merged or released.

## Campaign
- id: UUID
- title: string (1–100 characters)
- startDate / endDate: ISO local dates YYYY-MM-DD, inclusive
- currencyCode: supported ISO 4217 currency, PHP default
- midweekDay: 1–6 for Monday–Saturday; Wednesday=3 default
- archived: boolean
- revision: monotonic nonnegative integer
- createdAt / updatedAt: ISO timestamps

## CommitmentEntry
- id: UUID
- campaignId: foreign key to campaign
- amountMinor: positive safe integer in campaign currency minor units
- frequency: ONCE | WEEKLY | MONTHLY | PER_SERVICE
- note: optional <= 140 characters; never required; avoid personal info
- createdAt / updatedAt: ISO timestamps

## AppSettings
- schemaVersion: positive integer
- activeCampaignId: optional UUID
- displayShowCount: boolean
- displayShowBreakdown: boolean
- reducedMotionOverride: optional boolean

## Derived, not authoritative
Occurrence count, row projection, frequency subtotals and grand total are computed, not trusted from imported or cached state. If caching is added, tie invalidation to campaign revision and entry mutation. Use stable currency minor units; enforce integer safety for row projection and grand total.

## Storage
IndexedDB stores campaigns, entries and preferences. Index entries by campaignId. An entry mutation and campaign revision change should be in one transaction, and live update notifications only after commit. Database schema versions and migrations are testable and explicit.

## Integrity
Valid dates, unique IDs, no orphan entries, positive amounts, allowed frequency, bounded strings, recognized currencies, consistent schema version. Backup restore validates everything **before** mutating existing data. Import cannot silently overwrite another campaign or accidentally double-count duplicates.

## Privacy constraints
No donor name, phone, email, member identity, payment credentials or donation receipts in schema. Show reminder not to put personal data in notes. Avoid transmitting pledge amounts to a server or telemetry in V1.
