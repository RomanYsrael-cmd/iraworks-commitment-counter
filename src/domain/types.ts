export const FREQUENCIES = ['ONCE', 'WEEKLY', 'MONTHLY', 'PER_SERVICE'] as const;
export type Frequency = (typeof FREQUENCIES)[number];

export const CURRENCIES = ['PHP', 'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NZD', 'SGD'] as const;
export type CurrencyCode = (typeof CURRENCIES)[number];

export interface Campaign {
  id: string;
  title: string;
  startDate: string;
  endDate: string;
  currencyCode: CurrencyCode;
  midweekDay: number;
  archived: boolean;
  revision: number;
  createdAt: string;
  updatedAt: string;
}

export interface CommitmentEntry {
  id: string;
  campaignId: string;
  amountMinor: number;
  frequency: Frequency;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  schemaVersion: number;
  activeCampaignId?: string;
  displayShowCount: boolean;
  displayShowBreakdown: boolean;
  reducedMotionOverride?: boolean;
}

export interface EntryProjection {
  entry: CommitmentEntry;
  occurrences: number;
  projectedMinor: number;
}

export interface CampaignProjection {
  entries: EntryProjection[];
  totalMinor: number;
  entryCount: number;
  byFrequency: Record<Frequency, number>;
}

export interface BackupEnvelope {
  schemaVersion: 1;
  appVersion: string;
  exportedAt: string;
  campaigns: Campaign[];
  entries: CommitmentEntry[];
  settings: AppSettings;
}

export const FREQUENCY_LABELS: Record<Frequency, string> = {
  ONCE: 'Once',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
  PER_SERVICE: 'Per Service',
};

export const WEEKDAYS = [
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
] as const;
