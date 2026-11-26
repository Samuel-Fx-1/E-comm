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
  await expect(page.getByRole('link', { name: productName })).toBeVisible();
  await expect(page.getByText('116,900')).toBeVisible();
});

test('product page renders the photo gallery', async ({ page }) => {
  await page.goto(productPath);
  await expect(page.getByRole('heading', { name: productName })).toBeVisible();
  await expect(page.getByRole('tab', { name: /View image 1 of/ })).toBeVisible();
});

test('add to cart opens the drawer with the selected product', async ({ page }) => {
  await page.goto(productPath);
  await page.getByRole('button', { name: 'Add to Cart' }).click();
  await expect(page.getByRole('dialog', { name: /Cart \(1\)/ })).toBeVisible();
  await expect(page.getByText(productName)).toBeVisible();
});
