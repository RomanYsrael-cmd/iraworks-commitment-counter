const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function parseLocalDate(value: string): { year: number; month: number; day: number } {
  const match = DATE_PATTERN.exec(value);
  if (!match) throw new Error('Enter a valid calendar date.');
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const check = new Date(Date.UTC(year, month - 1, day));
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) {
    throw new Error('Enter a valid calendar date.');
  }
  return { year, month, day };
}

export function toDayNumber(value: string): number {
  const { year, month, day } = parseLocalDate(value);
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function fromDayNumber(dayNumber: number): string {
  const date = new Date(dayNumber * 86_400_000);
  return `${date.getUTCFullYear().toString().padStart(4, '0')}-${(date.getUTCMonth() + 1).toString().padStart(2, '0')}-${date.getUTCDate().toString().padStart(2, '0')}`;
}

export function daysInclusive(startDate: string, endDate: string): number {
  const start = toDayNumber(startDate);
  const end = toDayNumber(endDate);
  if (end < start) throw new Error('Campaign end date must be on or after the start date.');
  return end - start + 1;
}

export function weekdayOf(value: string): number {
  const { year, month, day } = parseLocalDate(value);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

export function daysInMonth(year: number, monthOneBased: number): number {
  return new Date(Date.UTC(year, monthOneBased, 0)).getUTCDate();
}

export function addMonthsAnchored(startDate: string, monthOffset: number): string {
  const { year, month, day } = parseLocalDate(startDate);
  const absoluteMonth = year * 12 + month - 1 + monthOffset;
  const targetYear = Math.floor(absoluteMonth / 12);
  const targetMonth = (absoluteMonth % 12) + 1;
  return fromDayNumber(Math.floor(Date.UTC(targetYear, targetMonth - 1, Math.min(day, daysInMonth(targetYear, targetMonth))) / 86_400_000));
}

const MONTH_ABBREVIATIONS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'] as const;

export function formatCampaignDate(isoDate: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) return isoDate;
  const [, year, month, day] = match;
  const monthLabel = MONTH_ABBREVIATIONS[Number(month) - 1];
  if (!monthLabel) return isoDate;
  return `${monthLabel}-${day}-${year}`;
}

export function validateCampaignDates(startDate: string, endDate: string): void {
  const span = daysInclusive(startDate, endDate);
  if (span > 5 * 366) throw new Error('Campaigns can be up to five years long.');
}
