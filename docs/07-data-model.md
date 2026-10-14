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
- liveBannerDataUrl: optional bounded `data:image/jpeg;base64,...` image, optimized to <= 1 MB and 1920 × 1080

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
IndexedDB stores campaigns (including optional image data), entries, and preferences. Index entries by campaignId. A banner mutation and campaign revision change are stored in one transaction, and live update notifications are sent only after commit. Adding the optional campaign property does not require an object-store migration; existing records without it and older V1 backups remain valid.

## Integrity
Valid dates, unique IDs, no orphan entries, positive amounts, allowed frequency, bounded strings, recognized currencies, bounded JPEG image data, a 12 MB aggregate image-data cap per backup, and consistent schema version. Backup restore validates everything **before** mutating existing data. Import cannot silently overwrite another campaign or accidentally double-count duplicates.

## Privacy constraints
No donor name, phone, email, member identity, payment credentials or donation receipts in schema. Show reminder not to put personal data in notes. Avoid transmitting pledge amounts to a server or telemetry in V1.
