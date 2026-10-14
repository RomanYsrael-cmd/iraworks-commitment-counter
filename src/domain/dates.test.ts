import { describe, expect, it } from 'vitest';
import { formatCampaignDate } from './dates';

describe('campaign date presentation', () => {
  it('formats ISO calendar components without local-time conversion', () => {
    expect(formatCampaignDate('2026-10-14')).toBe('Oct-14-2026');
    expect(formatCampaignDate('2027-01-04')).toBe('Jan-04-2027');
  });

  it('leaves malformed values unchanged instead of shifting or guessing', () => {
    expect(formatCampaignDate('not-a-date')).toBe('not-a-date');
  });
});
