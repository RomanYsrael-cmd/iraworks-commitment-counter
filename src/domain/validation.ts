import { z } from 'zod';
import { calculateCampaign } from './calculations';
import { CURRENCIES, FREQUENCIES } from './types';
import { validateCampaignDates } from './dates';
import type { BackupEnvelope, Campaign, CommitmentEntry } from './types';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((value) => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}, 'Must be a real ISO calendar date.');
const timestamp = z.string().datetime({ offset: true });

export const campaignSchema = z.object({
  id: z.string().uuid(),
  title: z.string().trim().min(1).max(100),
  startDate: isoDate,
  endDate: isoDate,
  currencyCode: z.enum(CURRENCIES),
  midweekDay: z.number().int().min(1).max(6),
  archived: z.boolean(),
  revision: z.number().int().nonnegative().safe(),
  createdAt: timestamp,
  updatedAt: timestamp,
}).superRefine((campaign, context) => {
  try { validateCampaignDates(campaign.startDate, campaign.endDate); }
  catch (error) { context.addIssue({ code: 'custom', path: ['endDate'], message: error instanceof Error ? error.message : 'Invalid date range.' }); }
});

export const entrySchema = z.object({
  id: z.string().uuid(),
  campaignId: z.string().uuid(),
  amountMinor: z.number().int().positive().safe(),
  frequency: z.enum(FREQUENCIES),
  note: z.string().max(140).optional(),
  createdAt: timestamp,
  updatedAt: timestamp,
});

export const settingsSchema = z.object({
  schemaVersion: z.literal(1),
  activeCampaignId: z.string().uuid().optional(),
  displayShowCount: z.boolean(),
  displayShowBreakdown: z.boolean(),
  reducedMotionOverride: z.boolean().optional(),
});

export const backupSchema = z.object({
  schemaVersion: z.literal(1),
  appVersion: z.string().min(1).max(40),
  exportedAt: timestamp,
  campaigns: z.array(campaignSchema).max(1000),
  entries: z.array(entrySchema).max(100000),
  settings: settingsSchema,
}).superRefine((backup, context) => {
  const campaignIds = new Set(backup.campaigns.map((campaign) => campaign.id));
  const entryIds = new Set<string>();
  const campaignIdSet = new Set<string>();
  const entriesByCampaign = new Map<string, CommitmentEntry[]>();
  for (const campaign of backup.campaigns) {
    if (campaignIdSet.has(campaign.id)) context.addIssue({ code: 'custom', path: ['campaigns'], message: 'Campaign IDs must be unique.' });
    campaignIdSet.add(campaign.id);
  }
  for (const entry of backup.entries) {
    if (!campaignIds.has(entry.campaignId)) context.addIssue({ code: 'custom', path: ['entries'], message: 'Backup contains an entry without a campaign.' });
    if (entryIds.has(entry.id)) context.addIssue({ code: 'custom', path: ['entries'], message: 'Entry IDs must be unique.' });
    entryIds.add(entry.id);
    const campaignEntries = entriesByCampaign.get(entry.campaignId) ?? [];
    campaignEntries.push(entry);
    entriesByCampaign.set(entry.campaignId, campaignEntries);
  }
  if (backup.settings.activeCampaignId && !campaignIds.has(backup.settings.activeCampaignId)) {
    context.addIssue({ code: 'custom', path: ['settings', 'activeCampaignId'], message: 'Active campaign must exist in the backup.' });
  }
  const activeCampaign = backup.campaigns.find((campaign) => campaign.id === backup.settings.activeCampaignId);
  if (activeCampaign?.archived) {
    context.addIssue({ code: 'custom', path: ['settings', 'activeCampaignId'], message: 'Active campaign cannot be archived.' });
  }
  for (const campaign of backup.campaigns) {
    try { calculateCampaign(campaign, entriesByCampaign.get(campaign.id) ?? []); }
    catch (error) {
      context.addIssue({ code: 'custom', path: ['entries'], message: `Backup has a commitment projection outside the safe calculation range: ${error instanceof Error ? error.message : 'invalid total'}` });
      break;
    }
  }
});

export function validateBackup(value: unknown): BackupEnvelope {
  return backupSchema.parse(value) as BackupEnvelope;
}

export function validateCampaign(value: unknown): Campaign {
  return campaignSchema.parse(value) as Campaign;
}

export function validateEntry(value: unknown): CommitmentEntry {
  return entrySchema.parse(value) as CommitmentEntry;
}
