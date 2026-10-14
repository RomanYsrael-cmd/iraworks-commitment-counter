import { describe, expect, it } from 'vitest';
import { validateBackup } from './validation';
import type { BackupEnvelope, Campaign } from './types';

const campaign: Campaign = {
  id: '88888888-8888-4888-8888-888888888888', title: 'Test campaign', startDate: '2026-10-11', endDate: '2026-10-18',
  currencyCode: 'PHP', midweekDay: 3, archived: false, revision: 0, createdAt: '2026-10-14T00:00:00.000Z', updatedAt: '2026-10-14T00:00:00.000Z',
};

function envelope(overrides: Partial<BackupEnvelope> = {}): BackupEnvelope {
  return {
    schemaVersion: 1, appVersion: '1.0.0', exportedAt: campaign.createdAt, campaigns: [campaign], entries: [],
    settings: { schemaVersion: 1, activeCampaignId: campaign.id, displayShowCount: true, displayShowBreakdown: true },
    ...overrides,
  };
}

describe('backup validation', () => {
  it('keeps older V1 backups without a banner compatible', () => {
    const restored = validateBackup(envelope());
    expect(restored.campaigns[0]).not.toHaveProperty('liveBannerDataUrl');
  });

  it('accepts a valid bounded JPEG banner and rejects unsafe or oversized image data', () => {
    const liveBannerDataUrl = 'data:image/jpeg;base64,/9j/2Q==';
    expect(validateBackup(envelope({ campaigns: [{ ...campaign, liveBannerDataUrl }] })).campaigns[0]?.liveBannerDataUrl).toBe(liveBannerDataUrl);
    expect(() => validateBackup(envelope({ campaigns: [{ ...campaign, liveBannerDataUrl: 'data:image/svg+xml;base64,PHN2Zz4=' }] }))).toThrow(/valid JPEG/);
    const oversized = `data:image/jpeg;base64,/9j/${'A'.repeat(1_400_000)}`;
    expect(() => validateBackup(envelope({ campaigns: [{ ...campaign, liveBannerDataUrl: oversized }] }))).toThrow();
  });

  it('rejects an archived campaign selected as active', () => {
    expect(() => validateBackup(envelope({ campaigns: [{ ...campaign, archived: true }] }))).toThrow(/Active campaign cannot be archived/);
  });

  it('rejects commitments whose projected total exceeds the safe integer range', () => {
    expect(() => validateBackup(envelope({
      entries: [{ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', campaignId: campaign.id, amountMinor: Number.MAX_SAFE_INTEGER, frequency: 'WEEKLY', createdAt: campaign.createdAt, updatedAt: campaign.updatedAt }],
    }))).toThrow(/safe calculation range/);
  });
});
