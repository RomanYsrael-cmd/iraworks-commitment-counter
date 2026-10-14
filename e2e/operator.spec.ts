import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import ExcelJS from 'exceljs';
import { mkdir, readFile } from 'node:fs/promises';

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
  await page.locator('input[accept="application/json,.json"]').setInputFiles(backupUpload);
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
  await page.locator('input[accept="application/json,.json"]').setInputFiles(backupUpload);
  await page.getByRole('button', { name: 'Replace all local data' }).click();
  await expect(page).toHaveURL(/#\/$/);
  await expect(page.getByRole('link', { name: /October Community Fund \(imported\)/ })).toHaveCount(0);
  await display.close();
});

test('quick entry cycles frequencies from Amount and keeps the choice after Enter saves', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /new campaign/i }).first().click();
  await page.getByLabel('Campaign name').fill('Keyboard entry test');
  await page.getByLabel(/start date/i).fill('2026-10-11');
  await page.getByLabel(/end date/i).fill('2026-10-25');
  await page.getByRole('button', { name: /create campaign/i }).click();
  await expect(page.getByRole('heading', { name: 'Keyboard entry test' })).toBeVisible();

  const amount = page.getByRole('textbox', { name: 'Amount', exact: true });
  await amount.fill('100.00');
  for (const [key, expected] of [
    ['ArrowDown', 'Weekly'], ['ArrowRight', 'Monthly'], ['ArrowDown', 'Per Service'], ['ArrowRight', 'Once'],
  ] as const) {
    await amount.press(key);
    await expect(page.getByRole('radio', { name: expected })).toBeChecked();
    await expect(amount).toBeFocused();
    await expect(page.getByRole('status').filter({ hasText: `${expected} frequency selected` })).toBeAttached();
  }

  await page.getByPlaceholder('A short reminder').fill('Keyboard regression note');
  await amount.press('Enter');
  await expect(page.locator('tbody tr')).toHaveCount(1);
  await expect(amount).toBeFocused();
  await expect(amount).toHaveValue('');
  await expect(page.getByPlaceholder('A short reminder')).toHaveValue('');
  await expect(page.getByRole('radio', { name: 'Once' })).toBeChecked();

  await amount.press('ArrowDown');
  await amount.fill('10.00');
  await amount.press('Enter');
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await expect(page.getByRole('radio', { name: 'Weekly' })).toBeChecked();
  await expect(amount).toBeFocused();

  await amount.fill('0.00');
  await amount.press('Enter');
  await expect(page.getByRole('alert')).toContainText(/must be positive/i);
  await expect(page.locator('tbody tr')).toHaveCount(2);
  await expect(page.getByRole('radio', { name: 'Weekly' })).toBeChecked();

  await amount.fill('5.00');
  await amount.press('Enter');
  await expect(page.locator('tbody tr')).toHaveCount(3);
  await expect(page.getByRole('radio', { name: 'Weekly' })).toBeChecked();
  await expect(page.locator('.total-value')).toHaveText(/₱145\.00/);
  await expectNoAccessibilityViolations(page);

  await amount.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Monthly' })).toBeChecked();
  await amount.fill('20.00');
  await amount.press('Enter');
  await expect(page.locator('tbody tr')).toHaveCount(4);
  await expect(page.getByRole('radio', { name: 'Monthly' })).toBeChecked();

  await amount.press('ArrowRight');
  await expect(page.getByRole('radio', { name: 'Per Service' })).toBeChecked();
  await amount.fill('2.00');
  await amount.press('Enter');
  await expect(page.locator('tbody tr')).toHaveCount(5);
  await expect(page.getByRole('radio', { name: 'Per Service' })).toBeChecked();
  await expect(page.locator('.total-value')).toHaveText(/₱175\.00/);

  await page.getByRole('button', { name: 'Edit Weekly commitment' }).first().click();
  await expect(page.getByRole('radio', { name: 'Weekly' })).toBeChecked();
  await page.getByRole('button', { name: 'Cancel edit' }).click();
  await expect(page.getByRole('radio', { name: 'Per Service' })).toBeChecked();
  await expect(amount).toBeFocused();

  const onceRadio = page.getByRole('radio', { name: 'Once' });
  await onceRadio.focus();
  await onceRadio.press('ArrowDown');
  const weeklyRadio = page.getByRole('radio', { name: 'Weekly' });
  await expect(weeklyRadio).toBeChecked();
  await expect(weeklyRadio).toBeFocused();

  const workbookPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /export excel/i }).click();
  const workbookDownload = await workbookPromise;
  const workbookPath = await workbookDownload.path();
  expect(workbookPath).not.toBeNull();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.readFile(workbookPath!);
  expect(workbook.getWorksheet('Summary')?.getCell('B7').value).toBe(175);
});

test('campaign display background survives reload and backup, syncs removal, and leaves the dashboard clean', async ({ page, context }) => {
  await page.goto('/');
  await page.getByRole('link', { name: /new campaign/i }).first().click();
  await page.getByLabel('Campaign name').fill('Banner test campaign');
  await page.getByLabel(/start date/i).fill('2026-10-14');
  await page.getByLabel(/end date/i).fill('2027-01-14');
  await page.getByRole('button', { name: /create campaign/i }).click();
  await expect(page.locator('.dashboard-topline .muted')).toHaveText('Oct-14-2026 – Jan-14-2027 · PHP');
  await expect(page.getByText(/Your data stays in this browser\./i)).toHaveCount(0);
  await expect(page.getByText(/Pledges projected across the campaign · not funds collected/i)).toHaveCount(0);
  await expect(page.getByText('Projected Commitments', { exact: true })).toBeVisible();

  await page.getByLabel('Amount').fill('12500.00');
  await page.getByRole('button', { name: /add commitment/i }).click();
  await expect(page.locator('.total-value')).toHaveText(/₱12,500\.00/);
  await mkdir('docs/screenshots', { recursive: true });
  await page.screenshot({ path: 'docs/screenshots/issues-4-5-dashboard.png', fullPage: true });

  const popupPromise = context.waitForEvent('page');
  await page.getByRole('button', { name: /open live display/i }).click();
  const display = await popupPromise;
  await display.waitForLoadState();
  await expect(display.locator('.display-total')).toHaveText(/₱12,500\.00/);

  await page.getByRole('link', { name: 'Campaign settings' }).click();
  await expect(page.getByLabel('Local data and backup notice')).toBeVisible();
  const imageDataUrl = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920; canvas.height = 1080;
    const drawing = canvas.getContext('2d');
    if (!drawing) throw new Error('Canvas is unavailable.');
    drawing.fillStyle = '#ffffff'; drawing.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  });
  const imageBuffer = Buffer.from(imageDataUrl.split(',')[1]!, 'base64');
  await page.getByLabel('Upload live display background').setInputFiles({ name: 'bright-banner.png', mimeType: 'image/png', buffer: imageBuffer });
  await expect(page.getByRole('img', { name: 'Preview of the live display for Banner test campaign' })).toBeVisible();
  await expect(page.getByRole('status')).toContainText(/Preview ready/);
  await page.getByRole('button', { name: 'Save background changes' }).click();
  await expect(page.getByRole('status')).toContainText(/background saved/i);
  const displayScreen = display.locator('.display-screen');
  await expect(displayScreen).toHaveClass(/has-banner/);
  await expect(displayScreen).toHaveAttribute('style', /data:image\/jpeg;base64/);
  await expect(display.locator('.display-total')).toHaveText(/₱12,500\.00/);
  await display.reload();
  await display.waitForLoadState();
  await expect(displayScreen).toHaveClass(/has-banner/);
  const savedBannerStyle = await displayScreen.getAttribute('style');
  await expectNoAccessibilityViolations(page);
  await expectNoAccessibilityViolations(display);

  const bannerInput = page.getByLabel('Upload live display background');
  await bannerInput.setInputFiles({ name: 'unsafe.svg', mimeType: 'image/svg+xml', buffer: Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>') });
  await expect(page.getByRole('alert')).toContainText(/SVG and animated GIF files are not supported/i);
  await expect(displayScreen).toHaveAttribute('style', savedBannerStyle!);
  await bannerInput.setInputFiles({ name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('not an image') });
  await expect(page.getByRole('alert')).toContainText(/valid JPEG, PNG, or WebP/i);
  await expect(displayScreen).toHaveAttribute('style', savedBannerStyle!);
  await bannerInput.setInputFiles({ name: 'large.png', mimeType: 'image/png', buffer: Buffer.alloc(5 * 1024 * 1024 + 1) });
  await expect(page.getByRole('alert')).toContainText(/5 MB or smaller/i);
  await expect(displayScreen).toHaveAttribute('style', savedBannerStyle!);

  await display.setViewportSize({ width: 390, height: 844 });
  const mobileOverflow = await display.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(mobileOverflow).toBe(false);
  await expect(display.locator('.display-total')).toBeVisible();
  await expectNoAccessibilityViolations(display);
  await display.setViewportSize({ width: 1920, height: 1080 });
  await expect(displayScreen).toHaveCSS('background-size', /cover/);
  await display.screenshot({ path: 'docs/screenshots/issues-4-5-live-display.png' });

  const backupPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: /download json backup/i }).click();
  const backupDownload = await backupPromise;
  const backupPath = await backupDownload.path();
  expect(backupPath).not.toBeNull();
  const backupContents = await readFile(backupPath!);
  const backupData = JSON.parse(backupContents.toString('utf8')) as { campaigns: Array<{ liveBannerDataUrl?: string }> };
  expect(backupData.campaigns[0]?.liveBannerDataUrl).toMatch(/^data:image\/jpeg;base64,/);
  const storedImageBytes = Buffer.from(backupData.campaigns[0]!.liveBannerDataUrl!.split(',')[1]!, 'base64').byteLength;
  expect(storedImageBytes).toBeLessThanOrEqual(1024 * 1024);
  const backupUpload = { name: backupDownload.suggestedFilename(), mimeType: 'application/json', buffer: backupContents };

  const replacementDataUrl = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1920; canvas.height = 1080;
    const drawing = canvas.getContext('2d');
    if (!drawing) throw new Error('Canvas is unavailable.');
    drawing.fillStyle = '#050505'; drawing.fillRect(0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  });
  await bannerInput.setInputFiles({ name: 'replacement.png', mimeType: 'image/png', buffer: Buffer.from(replacementDataUrl.split(',')[1]!, 'base64') });
  await expect(page.getByRole('button', { name: 'Save background changes' })).toBeVisible();
  await page.evaluate(() => {
    const target = window as Window & { __originalBannerPut?: IDBObjectStore['put'] };
    target.__originalBannerPut = IDBObjectStore.prototype.put;
    IDBObjectStore.prototype.put = (() => { throw new DOMException('Simulated storage quota failure.', 'QuotaExceededError'); }) as IDBObjectStore['put'];
  });
  await page.getByRole('button', { name: 'Save background changes' }).click();
  await expect(page.getByRole('alert')).toContainText(/Browser storage is full/i);
  await expect(page.getByRole('alert')).toContainText(/previous background is unchanged/i);
  await page.evaluate(() => {
    const target = window as Window & { __originalBannerPut?: IDBObjectStore['put'] };
    if (target.__originalBannerPut) IDBObjectStore.prototype.put = target.__originalBannerPut;
    delete target.__originalBannerPut;
  });
  await expect(displayScreen).toHaveAttribute('style', savedBannerStyle!);

  await bannerInput.setInputFiles({ name: 'replacement.png', mimeType: 'image/png', buffer: Buffer.from(replacementDataUrl.split(',')[1]!, 'base64') });
  await page.getByRole('button', { name: 'Save background changes' }).click();
  await expect(page.getByRole('status')).toContainText(/background saved/i);
  await expect(displayScreen).toHaveClass(/has-banner/);
  await expect(displayScreen).not.toHaveAttribute('style', savedBannerStyle!);

  await page.getByRole('button', { name: 'Remove background' }).click();
  await expect(page.getByRole('status')).toContainText(/Removal preview ready/);
  await page.getByRole('button', { name: 'Save background changes' }).click();
  await expect(displayScreen).not.toHaveClass(/has-banner/);

  await page.locator('input[accept="application/json,.json"]').setInputFiles(backupUpload);
  await expect(page.getByRole('dialog', { name: 'Backup ready to restore' })).toContainText('1 campaign');
  await page.getByRole('button', { name: 'Import as separate copy' }).click();
  await page.getByRole('link', { name: 'IraWorks Commitment Counter home' }).click();
  const copiedCampaign = page.getByRole('link', { name: 'Banner test campaign (imported)' });
  await expect(copiedCampaign).toBeVisible();
  await copiedCampaign.click();
  await page.getByRole('link', { name: 'Campaign settings' }).click();
  await page.getByRole('button', { name: 'Preview live display' }).click();
  await expect(page.getByRole('img', { name: 'Preview of the live display for Banner test campaign (imported)' })).toBeVisible();
  await expectNoAccessibilityViolations(page);
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
