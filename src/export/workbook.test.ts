import { describe, expect, it } from 'vitest';
import ExcelJS from 'exceljs';
import { buildWorkbook, safeSpreadsheetText } from './workbook';
import type { Campaign, CommitmentEntry } from '../domain/types';

const campaign: Campaign = { id: '88888888-8888-4888-8888-888888888888', title: '=1+1 campaign', startDate: '2026-10-11', endDate: '2026-10-25', currencyCode: 'PHP', midweekDay: 3, archived: false, revision: 0, createdAt: '2026-10-14T00:00:00.000Z', updatedAt: '2026-10-14T00:00:00.000Z' };
const entries: CommitmentEntry[] = [
  { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', campaignId: campaign.id, amountMinor: 100_000, frequency: 'ONCE', note: '=1+1', createdAt: campaign.createdAt, updatedAt: campaign.updatedAt },
  { id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', campaignId: campaign.id, amountMinor: 10_000, frequency: 'WEEKLY', note: '+1+1', createdAt: campaign.createdAt, updatedAt: campaign.updatedAt },
  { id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc', campaignId: campaign.id, amountMinor: 20_000, frequency: 'MONTHLY', createdAt: campaign.createdAt, updatedAt: campaign.updatedAt },
  { id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd', campaignId: campaign.id, amountMinor: 5_000, frequency: 'PER_SERVICE', createdAt: campaign.createdAt, updatedAt: campaign.updatedAt },
];

describe('XLSX report', () => {
  it('exports three sheets with numeric amounts and reconciled totals', async () => {
    const workbook = await buildWorkbook(campaign, entries, new Date('2026-10-14T00:00:00.000Z'));
    expect(workbook.worksheets.map((sheet) => sheet.name)).toEqual(['Summary', 'Commitment Entries', 'Campaign Settings']);
    const summary = workbook.getWorksheet('Summary');
    expect(summary?.getCell('B7').value).toBe(1750);
    expect(summary?.getCell('B8').value).toBe(4);
    const sheet = workbook.getWorksheet('Commitment Entries');
    expect(sheet?.getCell('E2').value).toBe(1000);
    expect(sheet?.getCell('E2').type).toBe(ExcelJS.ValueType.Number);
    expect(sheet?.getCell('G6').value).toBe(1750);
  });

  it('writes user-controlled formula-like text as safe literal text', async () => {
    expect(safeSpreadsheetText('=2+2')).toBe("'=2+2");
    expect(safeSpreadsheetText('\t@SUM(A1:A2)')).toBe("'\t@SUM(A1:A2)");
    const workbook = await buildWorkbook(campaign, entries);
    const bytes = await workbook.xlsx.writeBuffer();
    const reopened = new ExcelJS.Workbook();
    await reopened.xlsx.load(bytes);
    expect(reopened.getWorksheet('Commitment Entries')?.getCell('H2').value).toBe("'=1+1");
    expect(reopened.getWorksheet('Summary')?.getCell('B1').value).toBe("'=1+1 campaign");
    expect(reopened.getWorksheet('Commitment Entries')?.getCell('H2').type).toBe(ExcelJS.ValueType.String);
  });
});
