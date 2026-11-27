import { mkdirSync } from 'node:fs';
import { expect, type Page } from '@playwright/test';

export const SHOT_DIR = 'test-results/verification';
export const BASE = 'http://127.0.0.1:3000';
export const API = 'http://127.0.0.1:3001';

mkdirSync(SHOT_DIR, { recursive: true });

export async function captureBoth(page: Page, name: string): Promise<void> {
  const original = page.viewportSize();
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: `${SHOT_DIR}/${name}-1440.png` });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: `${SHOT_DIR}/${name}-390.png` });
  if (original) await page.setViewportSize(original);
}

export async function captureAt(page: Page, name: string, width: number, height = 900): Promise<void> {
  const original = page.viewportSize();
  await page.setViewportSize({ width, height });
  await page.screenshot({ path: `${SHOT_DIR}/${name}-${width}.png` });
  if (original) await page.setViewportSize(original);
}

export function money(text: string): number {
  const digits = text.replace(/[^\d]/g, '');
  return Number(digits);
}

export function visibleUsd(page: Page): Promise<string[]> {
  return page.locator('body').evaluate((body) => {
    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT);
    const hits: string[] = [];
    while (walker.nextNode()) {
      const node = walker.currentNode as Text;
      if (!node.parentElement || node.parentElement.closest('script,style')) continue;
      const text = node.textContent ?? '';
      if (/\$\s?\d/.test(text)) hits.push(text.trim());
    }
    return hits;
  });
}

export async function expectNoUsd(page: Page): Promise<void> {
  const hits = await visibleUsd(page);
  expect(hits, `visible USD text: ${hits.join(' | ')}`).toEqual([]);
}
