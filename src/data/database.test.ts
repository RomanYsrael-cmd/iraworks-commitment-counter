import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { deleteDB } from 'idb';
import { archiveCampaign, backupEnvelope, closeDatabaseForTests, createCampaign, deleteEntry, getCampaignSnapshot, getSnapshot, importAsCopy, replaceAllData, saveEntry, STORAGE_DATABASE_NAME, updateCampaign } from './database';
import { validateBackup } from '../domain/validation';

async function newCampaign() {
  return createCampaign({ title: 'Local test', startDate: '2026-10-11', endDate: '2026-10-25', currencyCode: 'PHP', midweekDay: 3 });
}

describe('IndexedDB repository', () => {
  beforeEach(async () => { await closeDatabaseForTests(); await deleteDB(STORAGE_DATABASE_NAME); });
  afterEach(async () => closeDatabaseForTests());

  it('persists campaigns and entries after closing and reopening the database', async () => {
    const campaign = await newCampaign();
    const saved = await saveEntry({ campaignId: campaign.id, amountMinor: 12_500, frequency: 'WEEKLY', note: 'Test only' });
    await closeDatabaseForTests();
    const snapshot = await getCampaignSnapshot(campaign.id);
    expect(snapshot.campaign?.revision).toBe(1);
    expect(snapshot.entries).toEqual([saved]);
  });

  it('increments campaign revision for edits, deletions and setting changes', async () => {
    const campaign = await newCampaign();
    const saved = await saveEntry({ campaignId: campaign.id, amountMinor: 1000, frequency: 'ONCE' });
    const edited = await saveEntry({ id: saved.id, campaignId: campaign.id, amountMinor: 1500, frequency: 'MONTHLY' });
    expect(edited.createdAt).toBe(saved.createdAt);
    expect((await getCampaignSnapshot(campaign.id)).campaign?.revision).toBe(2);
    await deleteEntry(campaign.id, saved.id);
    expect((await getCampaignSnapshot(campaign.id)).campaign?.revision).toBe(3);
  });

  it('restores a versioned backup and can import it as a separate copy', async () => {
    const original = await newCampaign();
    await saveEntry({ campaignId: original.id, amountMinor: 5000, frequency: 'PER_SERVICE' });
    const backup = validateBackup(await backupEnvelope());
    await newCampaign();
    await replaceAllData(backup);
    const replaced = await getSnapshot();
    expect(replaced.campaigns).toHaveLength(1);
    expect(replaced.entries).toHaveLength(1);
    expect(replaced.settings.activeCampaignId).toBe(original.id);
    expect(await importAsCopy(backup)).toBe(1);
    const copied = await getSnapshot();
    expect(copied.campaigns).toHaveLength(2);
    expect(copied.entries).toHaveLength(2);
    expect(copied.campaigns.some((campaign) => campaign.title === 'Local test (imported)')).toBe(true);
  });

  it('rejects a corrupt backup before replacing existing local data', async () => {
    const existing = await newCampaign();
    await saveEntry({ campaignId: existing.id, amountMinor: 2500, frequency: 'ONCE' });
    const valid = await backupEnvelope();
    expect(() => validateBackup({ ...valid, entries: [{ ...valid.entries[0]!, campaignId: '00000000-0000-4000-8000-000000000000' }] })).toThrow();
    expect((await getSnapshot()).campaigns.map((campaign) => campaign.id)).toEqual([existing.id]);
    expect((await getSnapshot()).entries).toHaveLength(1);
  });

  it('rolls a failed restore transaction back without losing existing data', async () => {
    const existing = await newCampaign();
    const oldEntry = await saveEntry({ campaignId: existing.id, amountMinor: 6000, frequency: 'WEEKLY' });
    const backup = await backupEnvelope();
    const malformed = { ...backup, entries: [backup.entries[0], backup.entries[0]] } as typeof backup;
    await expect(replaceAllData(malformed)).rejects.toThrow();
    const saved = await getSnapshot();
    expect(saved.campaigns.map((campaign) => campaign.id)).toEqual([existing.id]);
    expect(saved.entries).toHaveLength(1);
    expect(saved.entries[0]?.id).toBe(oldEntry.id);
  });

  it('retains entries when campaign settings change and archives instead of deleting', async () => {
    const campaign = await newCampaign();
    const entry = await saveEntry({ campaignId: campaign.id, amountMinor: 1000, frequency: 'WEEKLY' });
    await updateCampaign({ ...campaign, endDate: '2026-11-01' });
    await archiveCampaign(campaign.id);
    const saved = await getCampaignSnapshot(campaign.id);
    expect(saved.campaign?.archived).toBe(true);
    expect(saved.entries[0]?.id).toBe(entry.id);
  });
});
