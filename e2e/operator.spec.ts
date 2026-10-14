import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import ExcelJS from 'exceljs';
import { readFile } from 'node:fs/promises';

async function expectNoAccessibilityViolations(page: import('@playwright/test').Page) {
  const report = await new AxeBuilder({ page }).analyze();
  const details = report.violations.flatMap((violation) => violation.nodes.map((node) => ({
    id: violation.id,
    target: node.target,
    summary: node.failureSummary,
    html: node.html,
  })));
  expect(details).toEqual([]);
}

test('creates a campaign, syncs the projector, survives refresh and exports a backup', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /new campaign/i }).first().click();
  await page.getByLabel('Campaign name').fill('October Community Fund');
  await page.getByLabel(/start date/i).fill('2026-10-11');
  await page.getByLabel(/end date/i).fill('2026-10-25');
  await page.getByRole('button', { name: /create campaign/i }).click();
  await expect(page.getByRole('heading', { name: 'October Community Fund' })).toBeVisible();
  await expectNoAccessibilityViolations(page);

  const popupPromise = context.waitForEvent('page');
  await page.getByRole('button', { name: /open live display/i }).click();
  const display = await popupPromise;
  await display.waitForLoadState();
  await expect(display.getByText(/projected commitments/i)).toBeVisible();
  await expect(display.locator('.display-total')).toHaveText(/0\.00/);
  await expectNoAccessibilityViolations(display);

  await page.getByLabel('Amount').fill('100.00');
  await page.getByRole('radio', { name: 'Once' }).check();
  await page.getByRole('button', { name: /add commitment/i }).click();
  await expect(page.locator('.total-value')).toHaveText(/₱100\.00/);
  await expect(display.locator('.display-total')).toHaveText(/₱100\.00/);
  await expectNoAccessibilityViolations(page);
  const deleteButton = page.getByRole('button', { name: 'Delete Once commitment' });
  await deleteButton.click();
  const deleteDialog = page.getByRole('alertdialog', { name: 'Delete this commitment?' });
  await expect(deleteDialog).toBeVisible();
  await expect(deleteDialog.getByRole('button', { name: 'Cancel' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(deleteDialog).toBeHidden();
  await expect(deleteButton).toBeFocused();

  await page.reload();
  await expect(page.getByRole('heading', { name: 'October Community Fund' })).toBeVisible();
  await expect(page.locator('.total-value')).toHaveText(/₱100\.00/);
  await expect(page.getByRole('table')).toContainText('Once');

  const excelPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /export excel/i }).click();
  const excelDownload = await excelPromise;
  expect(excelDownload.suggestedFilename()).toMatch(/\.xlsx$/);
  const excelPath = await excelDownload.path();
  expect(excelPath).not.toBeNull();
  const exportedWorkbook = new ExcelJS.Workbook();
  await exportedWorkbook.xlsx.readFile(excelPath!);
  expect(exportedWorkbook.worksheets.map((sheet) => sheet.name)).toEqual(['Summary', 'Commitment Entries', 'Campaign Settings']);
  expect(exportedWorkbook.getWorksheet('Summary')?.getCell('B7').value).toBe(100);
  expect(exportedWorkbook.getWorksheet('Commitment Entries')?.getCell('G3').value).toBe(100);

  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /download json backup/i }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.json$/);
  const backupPath = await download.path();
  expect(backupPath).not.toBeNull();
  const backupContents = await readFile(backupPath!);
  const backupJson = JSON.parse(backupContents.toString('utf8')) as { schemaVersion: number; campaigns: unknown[]; entries: unknown[] };
  expect(backupJson.schemaVersion).toBe(1);
  expect(backupJson.campaigns).toHaveLength(1);
  expect(backupJson.entries).toHaveLength(1);
  const backupUpload = { name: download.suggestedFilename(), mimeType: 'application/json', buffer: backupContents };

  await page.getByRole('link', { name: 'Campaign settings' }).click();
  await page.locator('input[type="file"]').setInputFiles(backupUpload);
  const restoreDialog = page.getByRole('dialog', { name: 'Backup ready to restore' });
  await expect(restoreDialog).toContainText('1 campaign');
  await expectNoAccessibilityViolations(page);
  await page.getByRole('button', { name: 'Import as separate copy' }).click();
  await page.getByRole('link', { name: 'IraWorks Commitment Counter home' }).click();
  const importedCampaign = page.getByRole('link', { name: /October Community Fund \(imported\)/ });
  await expect(importedCampaign).toBeVisible();
  await importedCampaign.click();
  await expect(page.locator('.total-value')).toHaveText(/₱100\.00/);

  await page.getByRole('link', { name: 'Campaign settings' }).click();
  await page.locator('input[type="file"]').setInputFiles(backupUpload);
  await page.getByRole('button', { name: 'Replace all local data' }).click();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByRole('link', { name: /October Community Fund \(imported\)/ })).toHaveCount(0);
  await display.close();
});

test('operator, entry history and settings remain usable on a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /count commitments/i })).toBeVisible();
  await page.getByRole('link', { name: /new campaign/i }).first().click();
  await page.getByLabel('Campaign name').fill('Mobile test campaign');
  await page.getByLabel(/start date/i).fill('2026-10-11');
  await page.getByLabel(/end date/i).fill('2026-10-25');
  await page.getByRole('button', { name: /create campaign/i }).click();
  await expect(page.getByRole('heading', { name: 'Mobile test campaign' })).toBeVisible();
  await page.getByLabel('Amount').fill('50.00');
  await page.getByRole('radio', { name: 'Once' }).check();
  await page.getByRole('button', { name: /add commitment/i }).click();
  await expect(page.locator('.total-value')).toHaveText(/₱50\.00/);
  await expect(page.getByRole('table')).toContainText('Once');
  await expectNoAccessibilityViolations(page);
  const dashboardLayout = await page.evaluate(() => {
    const historyScroller = document.querySelector('.table-wrap');
    const historyTable = document.querySelector('.entries-table');
    const originalX = window.scrollX;
    window.scrollTo(1000, 0);
    const canScrollPageHorizontally = window.scrollX > originalX;
    window.scrollTo(originalX, 0);
    return {
      canScrollPageHorizontally,
      historyTableFitsViewport: Boolean(historyScroller && historyTable && historyTable.getBoundingClientRect().width <= historyScroller.clientWidth + 1),
    };
  });
  expect(dashboardLayout.canScrollPageHorizontally, JSON.stringify(dashboardLayout)).toBe(false);
  expect(dashboardLayout.historyTableFitsViewport).toBe(true);

  await page.getByRole('link', { name: 'Campaign settings' }).click();
  await expect(page.getByRole('heading', { name: 'Keep things up to date' })).toBeVisible();
  await expectNoAccessibilityViolations(page);
  const settingsCanScrollHorizontally = await page.evaluate(() => {
    window.scrollTo(1000, 0);
    const canScroll = window.scrollX > 0;
    window.scrollTo(0, 0);
    return canScroll;
  });
  expect(settingsCanScrollHorizontally).toBe(false);
});

test('campaign setup can be opened by keyboard and has accessible page landmarks', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'IraWorks Commitment Counter home' })).toBeFocused();
  await page.keyboard.press('Tab');
  const newCampaign = page.getByRole('link', { name: /new campaign/i }).first();
  await expect(newCampaign).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByLabel('Campaign name')).toBeVisible();
  await expect(page.getByRole('main')).toBeVisible();
  await expectNoAccessibilityViolations(page);
});
