import { describe, expect, it } from 'vitest';
import { calculateCampaign, countOccurrences, parseAmountToMinor } from './calculations';
import type { Campaign, CommitmentEntry, Frequency } from './types';

const campaign: Campaign = {
  id: '88888888-8888-4888-8888-888888888888', title: 'Test campaign', startDate: '2026-10-11', endDate: '2026-10-25',
  currencyCode: 'PHP', midweekDay: 3, archived: false, revision: 0, createdAt: '2026-10-14T00:00:00.000Z', updatedAt: '2026-10-14T00:00:00.000Z',
};

function entry(frequency: Frequency, amountMinor: number, id: string): CommitmentEntry {
  return { id, campaignId: campaign.id, amountMinor, frequency, createdAt: campaign.createdAt, updatedAt: campaign.updatedAt };
}

describe('approved calendar recurrence rules', () => {
  it('counts the inclusive mixed-frequency reference campaign as PHP 1,750', () => {
    const entries = [entry('ONCE', 100_000, '1'), entry('WEEKLY', 10_000, '2'), entry('MONTHLY', 20_000, '3'), entry('PER_SERVICE', 5_000, '4')];
    const result = calculateCampaign(campaign, entries);
    expect(result.totalMinor).toBe(175_000);
    expect(result.entryCount).toBe(4);
    expect(result.byFrequency).toEqual({ ONCE: 100_000, WEEKLY: 30_000, MONTHLY: 20_000, PER_SERVICE: 25_000 });
  });

  it('uses start-anchored seven-day weekly cadence, including the start day', () => {
    expect(countOccurrences({ ...campaign, startDate: '2023-10-11', endDate: '2024-01-28' }, 'WEEKLY')).toBe(16);
    expect(countOccurrences({ ...campaign, startDate: '2026-10-11', endDate: '2026-10-25' }, 'WEEKLY')).toBe(3);
  });

  it('keeps the original monthly anchor across short months and leap years', () => {
    expect(countOccurrences({ ...campaign, startDate: '2027-01-31', endDate: '2027-03-31' }, 'MONTHLY')).toBe(3);
    expect(countOccurrences({ ...campaign, startDate: '2028-01-31', endDate: '2028-03-31' }, 'MONTHLY')).toBe(3);
    expect(countOccurrences({ ...campaign, startDate: '2027-01-31', endDate: '2027-03-30' }, 'MONTHLY')).toBe(2);
  });

  it('counts each Sunday and selected midweek date once', () => {
    expect(countOccurrences({ ...campaign, startDate: '2023-10-11', endDate: '2024-01-28' }, 'PER_SERVICE')).toBe(32);
    expect(countOccurrences({ ...campaign, startDate: '2026-10-11', endDate: '2026-10-25' }, 'PER_SERVICE')).toBe(5);
    expect(countOccurrences({ ...campaign, startDate: '2026-10-15', endDate: '2026-10-15' }, 'PER_SERVICE')).toBe(0);
  });

  it('handles a one-day campaign and DST calendar boundaries', () => {
    const thursday = { ...campaign, startDate: '2026-10-15', endDate: '2026-10-15' };
    expect((['ONCE', 'WEEKLY', 'MONTHLY', 'PER_SERVICE'] as Frequency[]).map((frequency) => countOccurrences(thursday, frequency))).toEqual([1, 1, 1, 0]);
    expect(countOccurrences({ ...campaign, startDate: '2026-03-07', endDate: '2026-03-15' }, 'PER_SERVICE')).toBe(3);
  });

  it('rejects reversed dates, bad precision and unsafe totals', () => {
    expect(() => countOccurrences({ ...campaign, startDate: '2026-10-25', endDate: '2026-10-11' }, 'ONCE')).toThrow();
    expect(() => parseAmountToMinor('10.001')).toThrow();
    expect(() => parseAmountToMinor('0')).toThrow();
    expect(() => calculateCampaign(campaign, [entry('ONCE', Number.MAX_SAFE_INTEGER, '5'), entry('ONCE', 1, '6')])).toThrow(/safe calculation limit/i);
  });

  it('rejects a row whose occurrence multiplication exceeds safe integer range', () => {
    expect(() => calculateCampaign({ ...campaign, startDate: '2026-10-11', endDate: '2027-10-10' }, [entry('WEEKLY', Number.MAX_SAFE_INTEGER, '7')])).toThrow(/safe calculation limit/i);
  });

  it('parses decimal input into exact integer minor units', () => {
    expect(parseAmountToMinor('1,234.5')).toBe(123_450);
    expect(parseAmountToMinor('0.01')).toBe(1);
  });
});
