import { mkdirSync } from 'node:fs';
import { expect, test } from '@playwright/test';

test('development image review filters, rejects and exports photo ids', async ({ page }) => {
  mkdirSync('test-results', { recursive: true });
  const photoIds = ['123'];

  await page.route('**/dev-api/image-rejects*', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ photoIds }),
      });
      return;
    }
    if (request.method() === 'POST') {
      const body = request.postDataJSON() as { photoId?: string };
      const id = String(body.photoId ?? '');
      if (id && !photoIds.includes(id)) photoIds.push(id);
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ photoIds, added: true }),
      });
      return;
    }
    await route.fulfill({ status: 405, contentType: 'application/json', body: JSON.stringify({ error: 'Method not allowed' }) });
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/dev/image-review');
  await expect(page.getByRole('heading', { name: 'Image review' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Export rejected ids (1)' })).toBeVisible();
  await page.getByLabel('Category').selectOption('tech-gaming');
  await expect(page.getByText('Showing 20 of 100 products')).toBeVisible();
  await page.getByPlaceholder('e.g. webcam, Rift, ages 8').fill('webcam');
  await expect(page.getByRole('heading', { name: 'PixelNest Stream Webcam' })).toBeVisible();

  await page.getByRole('button', { name: 'Reject slot 1' }).first().click();
  await expect(page.getByRole('status')).toContainText('Rejected photo');
  await expect(page.getByRole('button', { name: 'Export rejected ids (2)' })).toBeVisible();
  await page.screenshot({ path: 'test-results/step0-image-review-1440.png' });

  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: /Export rejected ids/ }).click(),
  ]);
  expect(download.suggestedFilename()).toBe('image-rejects.json');

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/dev/image-review');
  await expect(page.getByRole('heading', { name: 'Image review' })).toBeVisible();
  await page.screenshot({ path: 'test-results/step0-image-review-390.png' });
});
