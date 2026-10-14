import type { Workbook } from 'exceljs';
import { calculateCampaign } from '../domain/calculations';
import { FREQUENCY_LABELS } from '../domain/types';
import type { Campaign, CommitmentEntry, Frequency } from '../domain/types';

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export function safeSpreadsheetText(value: string): string {
  const cleaned = Array.from(value).filter((character) => {
    const code = character.codePointAt(0) ?? 0;
    return !(code <= 8 || code === 11 || code === 12 || (code >= 14 && code <= 31) || code === 127);
  }).join('');
  return /^\s*[=+\-@]/u.test(cleaned) ? `'${cleaned}` : cleaned;
}

function literal(value: string): string {
  return safeSpreadsheetText(value);
}

export async function buildWorkbook(campaign: Campaign, entries: CommitmentEntry[], exportedAt = new Date()): Promise<Workbook> {
  const ExcelJS = (await import('exceljs')).default;
  const projection = calculateCampaign(campaign, entries);
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'IraWorks Commitment Counter';
  workbook.created = exportedAt;
  workbook.modified = exportedAt;

  const summary = workbook.addWorksheet('Summary');
  const summaryRows: Array<[string, string | number]> = [
    ['Campaign', literal(campaign.title)],
    ['Campaign start (inclusive)', campaign.startDate],
    ['Campaign end (inclusive)', campaign.endDate],
    ['Midweek service day', new Intl.DateTimeFormat('en', { weekday: 'long', timeZone: 'UTC' }).format(new Date(Date.UTC(2024, 0, campaign.midweekDay)))],
    ['Currency', campaign.currencyCode],
    ['Exported at (UTC offset)', `${exportedAt.toISOString()} (UTC+00:00)`],
    ['Projected Commitments', projection.totalMinor / 100],
    ['Commitment Entries', projection.entryCount],
    ...Object.entries(projection.byFrequency).map(([frequency, amount]) => [`${FREQUENCY_LABELS[frequency as Frequency]} projected`, amount / 100] as [string, number]),
    ['Notice', 'Projected commitments are pledges, not funds collected.'],
  ];
  summaryRows.forEach(([label, value]) => {
    const row = summary.addRow([literal(label), typeof value === 'number' ? value : literal(value)]);
    row.getCell(1).font = { bold: true, color: { argb: 'FF315847' } };
    if (typeof value === 'number') row.getCell(2).numFmt = '#,##0.00;[Red](#,##0.00)';
  });
  summary.getColumn(1).width = 36;
  summary.getColumn(2).width = 42;
  summary.getCell('A7').font = { bold: true, color: { argb: 'FF193E34' } };
  summary.getCell('B7').font = { bold: true, size: 16, color: { argb: 'FF193E34' } };

  const entriesSheet = workbook.addWorksheet('Commitment Entries');
  entriesSheet.addRow(['Entry ID', 'Created At (UTC)', 'Updated At (UTC)', 'Frequency', `Pledged Amount (${campaign.currencyCode})`, 'Occurrences', `Projected Amount (${campaign.currencyCode})`, 'Note']);
  entriesSheet.getRow(1).font = { bold: true, color: { argb: 'FF315847' } };
  for (const row of projection.entries) {
    entriesSheet.addRow([
      literal(row.entry.id), literal(row.entry.createdAt), literal(row.entry.updatedAt), literal(FREQUENCY_LABELS[row.entry.frequency]),
      row.entry.amountMinor / 100, row.occurrences, row.projectedMinor / 100, literal(row.entry.note ?? ''),
    ]);
  }
  const totalRow = entriesSheet.addRow([
    'TOTAL', '', '', '', projection.entries.reduce((sum, row) => sum + row.entry.amountMinor, 0) / 100,
    projection.entries.reduce((sum, row) => sum + row.occurrences, 0), projection.totalMinor / 100, '',
  ]);
  totalRow.font = { bold: true };
  for (const row of entriesSheet.getRows(2, entriesSheet.rowCount - 1) ?? []) {
    row.getCell(5).numFmt = '#,##0.00;[Red](#,##0.00)';
    row.getCell(7).numFmt = '#,##0.00;[Red](#,##0.00)';
  }
  [38, 26, 26, 19, 22, 14, 24, 38].forEach((width, index) => { entriesSheet.getColumn(index + 1).width = width; });
  entriesSheet.views = [{ state: 'frozen', ySplit: 1 }];
  entriesSheet.autoFilter = { from: 'A1', to: 'H1' };

  const settings = workbook.addWorksheet('Campaign Settings');
  const settingsRows: Array<[string, string | number]> = [
    ['Campaign ID', campaign.id],
    ['Campaign name', literal(campaign.title)],
    ['Start date', campaign.startDate],
    ['End date', campaign.endDate],
    ['Midweek day (Monday = 1)', campaign.midweekDay],
    ['Currency', campaign.currencyCode],
    ['App version', '1.0.0'],
    ['Export version', '1'],
    ['Once rule', 'One occurrence during the inclusive campaign period.'],
    ['Weekly rule', 'Every seven calendar days, anchored to the campaign start date.'],
    ['Monthly rule', 'Original campaign start day each month; clamp to month end without shifting the original anchor.'],
    ['Per Service rule', 'Every Sunday plus the selected midweek weekday; each date counted once.'],
  ];
  settingsRows.forEach(([label, value]) => settings.addRow([literal(label), typeof value === 'number' ? value : literal(value)]));
  settings.getColumn(1).width = 34;
  settings.getColumn(2).width = 88;
  settings.getColumn(1).font = { bold: true, color: { argb: 'FF315847' } };
  return workbook;
}

export async function exportWorkbook(campaign: Campaign, entries: CommitmentEntry[]): Promise<void> {
  const workbook = await buildWorkbook(campaign, entries);
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: XLSX_MIME });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const safeTitle = campaign.title.trim().replace(/[^\p{L}\p{N}-]+/gu, '-').replace(/^-|-$/g, '').slice(0, 60) || 'campaign';
  link.href = url;
  link.download = `commitment-counter_${safeTitle}_${campaign.startDate}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
