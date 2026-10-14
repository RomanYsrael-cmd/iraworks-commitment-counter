import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { AppSettings, Campaign, CommitmentEntry, BackupEnvelope } from '../domain/types';
import { campaignSchema, entrySchema, settingsSchema } from '../domain/validation';

const DATABASE_NAME = 'iraworks-commitment-counter';
const DATABASE_VERSION = 1;
const SETTINGS_KEY = 'global';

interface CounterDatabase extends DBSchema {
  campaigns: { key: string; value: Campaign };
  entries: { key: string; value: CommitmentEntry; indexes: { 'by-campaign': string } };
  settings: { key: string; value: AppSettings };
}

export interface DatabaseSnapshot {
  campaigns: Campaign[];
  entries: CommitmentEntry[];
  settings: AppSettings;
}

export interface RevisionMessage {
  campaignId: string;
  revision: number;
}

const DEFAULT_SETTINGS: AppSettings = {
  schemaVersion: 1,
  displayShowCount: true,
  displayShowBreakdown: true,
};

let databasePromise: Promise<IDBPDatabase<CounterDatabase>> | undefined;

function database(): Promise<IDBPDatabase<CounterDatabase>> {
  if (!globalThis.indexedDB) throw new Error('This browser does not support local database storage. Use a current browser and export a JSON backup regularly.');
  databasePromise ??= openDB<CounterDatabase>(DATABASE_NAME, DATABASE_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('campaigns')) db.createObjectStore('campaigns', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('entries')) {
        const entries = db.createObjectStore('entries', { keyPath: 'id' });
        entries.createIndex('by-campaign', 'campaignId');
      }
      if (!db.objectStoreNames.contains('settings')) db.createObjectStore('settings');
    },
    blocked() {
      console.warn('The local database upgrade is blocked by another open tab. Close older tabs and reload.');
    },
  }).catch((error: unknown) => {
    databasePromise = undefined;
    throw storageError(error);
  });
  return databasePromise;
}

function storageError(error: unknown): Error {
  if (error instanceof DOMException && error.name === 'QuotaExceededError') {
    return new Error('Browser storage is full, so this change was not saved. Download a JSON backup and free device storage before trying again.');
  }
  if (error instanceof DOMException && (error.name === 'NotAllowedError' || error.name === 'SecurityError')) {
    return new Error('Browser storage is unavailable. This change was not saved. Check browser privacy settings and try again.');
  }
  return error instanceof Error ? error : new Error('The local database could not save this change. It was not saved.');
}

async function commitTransaction<T>(transaction: { done: Promise<void>; abort: () => void }, write: () => Promise<T>): Promise<T> {
  const completion = transaction.done;
  try {
    const result = await write();
    await completion;
    return result;
  } catch (error) {
    try { transaction.abort(); } catch { /* The transaction may already have completed or aborted. */ }
    await completion.catch(() => undefined);
    throw storageError(error);
  }
}

function newId(): string {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  throw new Error('Secure ID generation is unavailable in this browser. Open the app over HTTPS or localhost.');
}

function now(): string {
  return new Date().toISOString();
}

export function createId(): string {
  return newId();
}

function publishRevision(campaignId: string, revision: number): void {
  if (typeof BroadcastChannel === 'undefined') return;
  try {
    const channel = new BroadcastChannel('iraworks-commitment-counter');
    channel.postMessage({ campaignId, revision } satisfies RevisionMessage);
    channel.close();
  } catch {
    // Persistence remains authoritative. The display also re-reads on focus and visibility.
  }
}

export async function getSnapshot(): Promise<DatabaseSnapshot> {
  const db = await database();
  const [campaigns, entries, settings] = await Promise.all([
    db.getAll('campaigns'), db.getAll('entries'), db.get('settings', SETTINGS_KEY),
  ]);
  return { campaigns, entries, settings: settings ?? DEFAULT_SETTINGS };
}

export async function getCampaignSnapshot(campaignId: string): Promise<{ campaign: Campaign | undefined; entries: CommitmentEntry[]; settings: AppSettings }> {
  const db = await database();
  const [campaign, entries, settings] = await Promise.all([
    db.get('campaigns', campaignId), db.getAllFromIndex('entries', 'by-campaign', campaignId), db.get('settings', SETTINGS_KEY),
  ]);
  return { campaign, entries, settings: settings ?? DEFAULT_SETTINGS };
}

export async function createCampaign(input: Omit<Campaign, 'id' | 'revision' | 'archived' | 'createdAt' | 'updatedAt'>): Promise<Campaign> {
  const timestamp = now();
  const campaign = campaignSchema.parse({ ...input, id: newId(), revision: 0, archived: false, createdAt: timestamp, updatedAt: timestamp });
  const db = await database();
  const tx = db.transaction(['campaigns', 'settings'], 'readwrite');
  await commitTransaction(tx, async () => {
    const settings = await tx.objectStore('settings').get(SETTINGS_KEY);
    await tx.objectStore('campaigns').add(campaign);
    await tx.objectStore('settings').put({ ...(settings ?? DEFAULT_SETTINGS), activeCampaignId: campaign.id }, SETTINGS_KEY);
  });
  publishRevision(campaign.id, campaign.revision);
  return campaign;
}

export async function saveEntry(input: Omit<CommitmentEntry, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<CommitmentEntry> {
  const db = await database();
  const tx = db.transaction(['campaigns', 'entries'], 'readwrite');
  const { entry, nextCampaign } = await commitTransaction(tx, async () => {
    const campaign = await tx.objectStore('campaigns').get(input.campaignId);
    if (!campaign || campaign.archived) throw new Error('This campaign is unavailable or archived. No change was saved.');
    const previous = input.id ? await tx.objectStore('entries').get(input.id) : undefined;
    if (input.id && (!previous || previous.campaignId !== input.campaignId)) throw new Error('This commitment entry could not be found. No change was saved.');
    const timestamp = now();
    const entry = entrySchema.parse({ ...input, id: previous?.id ?? newId(), createdAt: previous?.createdAt ?? timestamp, updatedAt: timestamp });
    const nextCampaign = campaignSchema.parse({ ...campaign, revision: campaign.revision + 1, updatedAt: timestamp });
    await tx.objectStore('entries').put(entry);
    await tx.objectStore('campaigns').put(nextCampaign);
    return { entry, nextCampaign };
  });
  publishRevision(input.campaignId, nextCampaign.revision);
  return entry;
}

export async function deleteEntry(campaignId: string, entryId: string): Promise<void> {
  const db = await database();
  const tx = db.transaction(['campaigns', 'entries'], 'readwrite');
  const next = await commitTransaction(tx, async () => {
    const campaign = await tx.objectStore('campaigns').get(campaignId);
    const entry = await tx.objectStore('entries').get(entryId);
    if (!campaign || !entry || entry.campaignId !== campaignId) throw new Error('This commitment entry could not be found. No change was saved.');
    const updatedAt = now();
    const next = campaignSchema.parse({ ...campaign, revision: campaign.revision + 1, updatedAt });
    await tx.objectStore('entries').delete(entryId);
    await tx.objectStore('campaigns').put(next);
    return next;
  });
  publishRevision(campaignId, next.revision);
}

export async function updateCampaign(input: Campaign): Promise<Campaign> {
  const db = await database();
  const tx = db.transaction('campaigns', 'readwrite');
  const campaign = await commitTransaction(tx, async () => {
    const current = await tx.store.get(input.id);
    if (!current) throw new Error('Campaign not found. No changes were saved.');
    const campaign = campaignSchema.parse({ ...input, revision: current.revision + 1, createdAt: current.createdAt, updatedAt: now() });
    await tx.store.put(campaign);
    return campaign;
  });
  publishRevision(campaign.id, campaign.revision);
  return campaign;
}

export async function saveCampaignBanner(campaignId: string, liveBannerDataUrl?: string): Promise<Campaign> {
  const db = await database();
  const tx = db.transaction('campaigns', 'readwrite');
  const campaign = await commitTransaction(tx, async () => {
    const current = await tx.store.get(campaignId);
    if (!current) throw new Error('Campaign not found. The background was not changed.');
    const nextValue = { ...current, revision: current.revision + 1, updatedAt: now() };
    if (liveBannerDataUrl === undefined) delete nextValue.liveBannerDataUrl;
    else nextValue.liveBannerDataUrl = liveBannerDataUrl;
    const next = campaignSchema.parse(nextValue);
    await tx.store.put(next);
    return next;
  });
  publishRevision(campaignId, campaign.revision);
  return campaign;
}

export async function archiveCampaign(campaignId: string): Promise<void> {
  const db = await database();
  const tx = db.transaction(['campaigns', 'settings'], 'readwrite');
  const archived = await commitTransaction(tx, async () => {
    const campaign = await tx.objectStore('campaigns').get(campaignId);
    if (!campaign) throw new Error('Campaign not found.');
    const timestamp = now();
    const archived = campaignSchema.parse({ ...campaign, archived: true, revision: campaign.revision + 1, updatedAt: timestamp });
    const allCampaigns = await tx.objectStore('campaigns').getAll();
    const settings = await tx.objectStore('settings').get(SETTINGS_KEY) ?? DEFAULT_SETTINGS;
    const nextActive = settings.activeCampaignId === campaignId ? allCampaigns.find((item) => item.id !== campaignId && !item.archived)?.id : settings.activeCampaignId;
    await tx.objectStore('campaigns').put(archived);
    await tx.objectStore('settings').put({ ...settings, activeCampaignId: nextActive }, SETTINGS_KEY);
    return archived;
  });
  publishRevision(campaignId, archived.revision);
}

export async function setActiveCampaign(campaignId: string): Promise<void> {
  const db = await database();
  const campaign = await db.get('campaigns', campaignId);
  if (!campaign || campaign.archived) throw new Error('Choose an active campaign.');
  const tx = db.transaction('settings', 'readwrite');
  await commitTransaction(tx, async () => {
    const settings = await tx.store.get(SETTINGS_KEY) ?? DEFAULT_SETTINGS;
    await tx.store.put({ ...settings, activeCampaignId: campaignId }, SETTINGS_KEY);
  });
}

export async function saveDisplaySettings(patch: Partial<Pick<AppSettings, 'displayShowCount' | 'displayShowBreakdown' | 'reducedMotionOverride'>>): Promise<AppSettings> {
  const db = await database();
  const tx = db.transaction('settings', 'readwrite');
  const next = await commitTransaction(tx, async () => {
    const current = await tx.store.get(SETTINGS_KEY) ?? DEFAULT_SETTINGS;
    const next = settingsSchema.parse({ ...current, ...patch });
    await tx.store.put(next, SETTINGS_KEY);
    return next;
  });
  for (const campaign of await db.getAll('campaigns')) publishRevision(campaign.id, campaign.revision);
  return next;
}

export async function backupEnvelope(): Promise<BackupEnvelope> {
  const snapshot = await getSnapshot();
  return {
    schemaVersion: 1,
    appVersion: '1.0.0',
    exportedAt: now(),
    campaigns: snapshot.campaigns,
    entries: snapshot.entries,
    settings: snapshot.settings,
  };
}

export async function replaceAllData(backup: BackupEnvelope): Promise<void> {
  const db = await database();
  const tx = db.transaction(['campaigns', 'entries', 'settings'], 'readwrite');
  await commitTransaction(tx, async () => {
    const campaigns = tx.objectStore('campaigns');
    const entries = tx.objectStore('entries');
    await Promise.all([campaigns.clear(), entries.clear(), tx.objectStore('settings').clear()]);
    for (const campaign of backup.campaigns) await campaigns.add(campaign);
    for (const entry of backup.entries) await entries.add(entry);
    await tx.objectStore('settings').put(backup.settings, SETTINGS_KEY);
  });
  for (const campaign of backup.campaigns) publishRevision(campaign.id, campaign.revision);
}

export async function importAsCopy(backup: BackupEnvelope): Promise<number> {
  const campaignIds = new Map(backup.campaigns.map((campaign) => [campaign.id, newId()]));
  const timestamp = now();
  const copies = backup.campaigns.map((campaign) => ({ ...campaign, id: campaignIds.get(campaign.id)!, title: `${campaign.title} (imported)`, revision: 0, archived: false, createdAt: timestamp, updatedAt: timestamp }));
  const entryCopies = backup.entries.map((entry) => ({ ...entry, id: newId(), campaignId: campaignIds.get(entry.campaignId)!, createdAt: timestamp, updatedAt: timestamp }));
  const db = await database();
  const tx = db.transaction(['campaigns', 'entries'], 'readwrite');
  await commitTransaction(tx, async () => {
    for (const campaign of copies) await tx.objectStore('campaigns').add(campaign);
    for (const entry of entryCopies) await tx.objectStore('entries').add(entry);
  });
  for (const campaign of copies) publishRevision(campaign.id, campaign.revision);
  return copies.length;
}

export async function closeDatabaseForTests(): Promise<void> {
  const current = databasePromise;
  databasePromise = undefined;
  if (current) (await current).close();
}

export const STORAGE_DATABASE_NAME = DATABASE_NAME;
