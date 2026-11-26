import { expect, test } from '@playwright/test';

const productPath = '/product/wireless-noise-canceling-over-ear-headphones';
const productName = 'Wireless Noise-Canceling Over-Ear Headphones';

test('home page renders the storefront shelves', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Soko/);
  await expect(page.getByText('Deal of the day')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tech & Gaming' })).toBeVisible();
});

test('category page renders products in RWF', async ({ page }) => {
  await page.goto('/category/tech-gaming');
  await expect(page.getByRole('heading', { name: 'Tech & Gaming' })).toBeVisible();
  await expect(page.getByRole('link', { name: productName }).first()).toBeVisible();
  await expect(page.getByText(/RWF\s*116,900/).first()).toBeVisible();
});

test('product page renders the photo gallery', async ({ page }) => {
  await page.goto(productPath);
  await expect(page.getByRole('heading', { name: productName })).toBeVisible();
  await expect(page.getByRole('tab', { name: /View image 1 of/ })).toBeVisible();
});

test('add to cart opens the drawer with the selected product', async ({ page }) => {
  await page.goto(productPath);
  await page.locator('#main-content').getByRole('button', { name: 'Add to Cart' }).first().click();
  const drawer = page.getByRole('dialog', { name: /Cart \(1\)/ });
  await expect(drawer).toBeVisible();
  await expect(drawer.getByText(productName)).toBeVisible();
});
