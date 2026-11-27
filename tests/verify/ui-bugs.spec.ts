import { expect, test, type Locator, type Page } from '@playwright/test';
import { BASE, captureAt, captureBoth } from './helpers';

type Box = { x: number; y: number; width: number; height: number };

function intersects(a: Box, b: Box): boolean {
  const ax2 = a.x + a.width;
  const ay2 = a.y + a.height;
  const bx2 = b.x + b.width;
  const by2 = b.y + b.height;
  return Math.max(a.x, b.x) < Math.min(ax2, bx2) && Math.max(a.y, b.y) < Math.min(ay2, by2);
}

async function noticeProbe(page: Page): Promise<{ topTag: string; inNotice: boolean; inHeader: boolean }> {
  const notice = page.getByText('We are showing you items that ship to', { exact: false }).first();
  await expect(notice).toBeVisible();
  return notice.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const top = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    return {
      topTag: top?.tagName ?? 'none',
      inNotice: element.contains(top),
      inHeader: Boolean(top?.closest('header')),
    };
  });
}

async function badgeGeometry(page: Page, category: string): Promise<{ checked: number; overlaps: string[] }> {
  await page.goto(`${BASE}/category/${category}`);
  await expect(page.locator('article').first()).toBeVisible();
  await expect.poll(async () => page.locator('article').count()).toBeGreaterThan(0);
  const cards = page.locator('article');
  const overlaps: string[] = [];
  let checked = 0;
  const count = await cards.count();
  for (let index = 0; index < count; index += 1) {
    const card = cards.nth(index);
    const badge = card.locator('span', { hasText: /^Best seller$/i }).first();
    if ((await badge.count()) === 0) continue;
    checked += 1;
    const badgeBox = await badge.boundingBox();
    if (!badgeBox) continue;
    const targets: Array<[string, Locator]> = [
      ['caption', card.locator('figcaption')],
      ['title', card.locator('a[href^="/product/"]').last()],
      ['price', card.locator(':text-matches("\\d[\\d,]*\\s*(FRw|RWF)|(FRw|RWF)\\s*\\d", "i")')],
    ];
    for (const [name, locator] of targets) {
      const total = await locator.count();
      for (let targetIndex = 0; targetIndex < total; targetIndex += 1) {
        const targetBox = await locator.nth(targetIndex).boundingBox();
        if (targetBox && intersects(badgeBox, targetBox)) {
          overlaps.push(`${category}:card${index + 1}:${name}`);
        }
      }
    }
  }
  return { checked, overlaps };
}

test('Bug: sticky nav overlapping delivery notice', async ({ page }) => {
  const errors: string[] = [];
  try {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(BASE);
      await expect(page.getByText('We are showing you items that ship to', { exact: false })).toBeVisible();
      const probe = await noticeProbe(page);
      errors.push(`${width}:${JSON.stringify(probe)}`);
      expect(probe.inHeader, `at ${width}px header covers notice: ${JSON.stringify(probe)}`).toBe(false);
      expect(probe.inNotice, `at ${width}px elementFromPoint missed notice: ${JSON.stringify(probe)}`).toBe(true);
    }
  } finally {
    await captureBoth(page, 'bug-sticky-nav');
  }
});

test('Bug: BEST SELLER badge covering image caption', async ({ page }) => {
  const results: string[] = [];
  try {
    for (const width of [1440, 390]) {
      await page.setViewportSize({ width, height: 900 });
      for (const category of ['tech-gaming', 'streetwear-footwear', 'viral-skincare-haircare']) {
        const result = await badgeGeometry(page, category);
        results.push(`${width}/${category}:checked=${result.checked},overlaps=${result.overlaps.join(',') || 'none'}`);
        expect(result.overlaps, `${width}px ${category}: ${result.overlaps.join(', ')}`).toEqual([]);
      }
    }
    test.info().annotations.push({ type: 'geometry', description: results.join(' | ') });
  } finally {
    await captureBoth(page, 'bug-best-seller-badge');
  }
});

test('Bug: clipped “Change address”', async ({ page }) => {
  const results: string[] = [];
  try {
    for (const width of [1440, 1024, 768, 390]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(BASE);
      const button = page.getByRole('button', { name: 'Change address' }).first();
      await expect(button).toBeVisible();
      await button.scrollIntoViewIfNeeded();
      const metrics = await button.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          scrollWidth: element.scrollWidth,
          clientWidth: element.clientWidth,
          left: rect.left,
          right: rect.right,
          top: rect.top,
          bottom: rect.bottom,
          viewportWidth: window.innerWidth,
          viewportHeight: window.innerHeight,
        };
      });
      results.push(`${width}:${JSON.stringify(metrics)}`);
      expect(metrics.scrollWidth <= metrics.clientWidth + 1, `${width}px clipped: ${JSON.stringify(metrics)}`).toBe(true);
      expect(metrics.left >= 0 && metrics.right <= width + 1, `${width}px outside viewport horizontally: ${JSON.stringify(metrics)}`).toBe(true);
      expect(metrics.top >= 0 && metrics.bottom <= 900 + 1, `${width}px outside viewport vertically: ${JSON.stringify(metrics)}`).toBe(true);
      await captureAt(page, 'bug-change-address', width, 900);
    }
    test.info().annotations.push({ type: 'geometry', description: results.join(' | ') });
  } finally {
    await captureBoth(page, 'bug-change-address-final');
  }
});
