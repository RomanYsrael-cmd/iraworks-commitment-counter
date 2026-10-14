import { addMonthsAnchored, daysInclusive, toDayNumber } from './dates';
import type { Campaign, CampaignProjection, CommitmentEntry, EntryProjection, Frequency } from './types';

const MAX_SAFE = Number.MAX_SAFE_INTEGER;

function checkedMultiply(amount: number, count: number): number {
  const projected = amount * count;
  if (!Number.isSafeInteger(projected)) throw new Error('Projected amount exceeds the safe calculation limit.');
  return projected;
}

function checkedAdd(a: number, b: number): number {
  const total = a + b;
  if (!Number.isSafeInteger(total) || Math.abs(total) > MAX_SAFE) throw new Error('Projected total exceeds the safe calculation limit.');
  return total;
}

export function countOccurrences(campaign: Pick<Campaign, 'startDate' | 'endDate' | 'midweekDay'>, frequency: Frequency): number {
  const span = daysInclusive(campaign.startDate, campaign.endDate);
  switch (frequency) {
    case 'ONCE':
      return 1;
    case 'WEEKLY':
      return Math.floor((span - 1) / 7) + 1;
    case 'MONTHLY': {
      let count = 0;
      for (let offset = 0; ; offset += 1) {
        const occurrence = addMonthsAnchored(campaign.startDate, offset);
        if (toDayNumber(occurrence) > toDayNumber(campaign.endDate)) break;
        count += 1;
      }
      return count;
    }
    case 'PER_SERVICE': {
      let count = 0;
      const start = toDayNumber(campaign.startDate);
      for (let index = 0; index < span; index += 1) {
        const weekday = new Date((start + index) * 86_400_000).getUTCDay();
        if (weekday === 0 || weekday === campaign.midweekDay) count += 1;
      }
      return count;
    }
  }
}

export function calculateEntry(campaign: Campaign, entry: CommitmentEntry): EntryProjection {
  const occurrences = countOccurrences(campaign, entry.frequency);
  return { entry, occurrences, projectedMinor: checkedMultiply(entry.amountMinor, occurrences) };
}

export function calculateCampaign(campaign: Campaign, entries: CommitmentEntry[]): CampaignProjection {
  const rows = entries.filter((entry) => entry.campaignId === campaign.id).map((entry) => calculateEntry(campaign, entry));
  const byFrequency: Record<Frequency, number> = { ONCE: 0, WEEKLY: 0, MONTHLY: 0, PER_SERVICE: 0 };
  let totalMinor = 0;
  for (const row of rows) {
    byFrequency[row.entry.frequency] = checkedAdd(byFrequency[row.entry.frequency], row.projectedMinor);
    totalMinor = checkedAdd(totalMinor, row.projectedMinor);
  }
  return { entries: rows, totalMinor, entryCount: rows.length, byFrequency };
}

export function formatMinor(minor: number, currencyCode: string, locale = 'en-PH'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency', currency: currencyCode, minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(minor / 100);
}

export function parseAmountToMinor(value: string): number {
  const normalized = value.trim();
  if (!/^(?:\d+|\d{1,3}(?:,\d{3})+)(?:\.\d{1,2})?$/.test(normalized)) throw new Error('Enter a positive amount with no more than two decimal places.');
  const ungrouped = normalized.replace(/,/g, '');
  const [whole, fraction = ''] = ungrouped.split('.');
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(amount) || amount <= 0) throw new Error('Amount must be positive and within the supported limit.');
  return amount;
}
