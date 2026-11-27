import { expect, test, type Page } from '@playwright/test';
import { API, BASE, captureBoth, money } from './helpers';

interface ApiProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  images: string[];
  variants: Array<{ type: string; name: string; value: string }>;
}

const XSS_IMAGE = '<img src=x onerror=window.__xss=1>';
const XSS_SCRIPT = '<script>';
const XSS_PAYLOAD = `${XSS_IMAGE} ${XSS_SCRIPT} literal verification payload </script>`;
const TECH_QUERY = 'category=tech-gaming&pageSize=48&limit=48';

async function readProducts(page: Page, query: string): Promise<ApiProduct[]> {
  const response = await page.request.get(`${API}/api/products?${query}`);
  expect(response.ok(), `API ${query} responded ${response.status()}`).toBeTruthy();
  const body = (await response.json()) as { items?: ApiProduct[] };
  const items = Array.isArray(body.items) ? body.items : [];
  expect(items.length, `API returned no products for ${query}`).toBeGreaterThan(0);
  return items;
}

async function openProductFromCategory(page: Page, slug: string): Promise<void> {
  await page.goto(`${BASE}/category/tech-gaming`);
  await expect(page.getByRole('heading', { name: 'Tech & Gaming' })).toBeVisible();
  await page.locator(`#main-content a[href="/product/${slug}"]`).first().click();
  await expect(page).toHaveURL(`${BASE}/product/${slug}`);
}

async function countLiteralTextNodes(page: Page, selector: string, needle: string): Promise<number> {
  return page.evaluate(
    ({ selector: css, needle: text }) => {
      let count = 0;
      document.querySelectorAll(css).forEach((element) => {
        element.childNodes.forEach((node) => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent === text) count += 1;
        });
      });
      return count;
    },
    { selector, needle }
  );
}

async function xssFlag(page: Page): Promise<unknown> {
  return page.evaluate(() => (window as Window & { __xss?: unknown }).__xss);
}

async function expectNoInjectedPayloads(page: Page): Promise<void> {
  expect(await xssFlag(page), 'window.__xss must remain undefined').toBeUndefined();
  await expect(page.locator('img[src="x"]'), 'payload must not create an img element').toHaveCount(0);
  const scriptHits = await page.evaluate(
    (payloads) =>
      Array.from(document.querySelectorAll('script')).filter((script) =>
        payloads.some(
          (payload) =>
            (script.textContent ?? '').includes(payload) || (script.getAttribute('src') ?? '').includes(payload)
        )
      ).length,
    [XSS_PAYLOAD, XSS_IMAGE, XSS_SCRIPT]
  );
  expect(scriptHits, 'payload must not create an injected script element').toBe(0);
}

async function expectPayloadRendered(page: Page, selector: string, payload: string): Promise<void> {
  expect(
    await countLiteralTextNodes(page, selector, payload),
    `expected a literal text node in ${selector}`
  ).toBeGreaterThan(0);
  await expect(page.locator(selector).filter({ hasText: payload }).first()).toBeVisible();
}

async function submitReview(page: Page, body: string): Promise<void> {
  await page.getByRole('button', { name: 'Write a customer review' }).click();
  const form = page.locator('#reviews form');
  await expect(form).toBeVisible();
  await form.getByRole('radio', { name: '5 stars' }).click();
  await form.getByLabel('Your name').fill('Verification Agent');
  await form.getByLabel('Headline').fill('Literal payload check');
  await form.getByLabel('Your review').fill(body);
  await form.getByRole('button', { name: 'Submit review' }).click();
  await expect(form).toHaveCount(0);
}

async function submitQuestion(page: Page, body: string): Promise<void> {
  await page.getByRole('button', { name: 'Ask a question' }).click();
  const form = page.locator('#questions form');
  await expect(form).toBeVisible();
  await form.getByLabel('Your name').fill('Verification Agent');
  await form.getByLabel('Your question').fill(body);
  await form.getByRole('button', { name: 'Post question' }).click();
  await expect(form).toHaveCount(0);
}

test('Product gallery — product', async ({ page }) => {
  try {
    const products = await readProducts(page, TECH_QUERY);
    // The category UI renders 12 products per page; keep to that first page.
    const product = products.slice(0, 12).find((entry) => Array.isArray(entry.images) && entry.images.length === 4);
    expect(product, 'expected a tech-gaming product with exactly four gallery images').toBeTruthy();
    const slug = product!.slug;

    await openProductFromCategory(page, slug);
    await expect(page.getByRole('heading', { name: product!.title })).toBeVisible();

    const priceText = (await page.locator('#main-content').getByText(/RWF\s*[\d,]+/).first().textContent()) ?? '';
    // Rwanda prices are displayed rounded to the nearest 100 RWF.
    expect(Math.abs(money(priceText) - product!.price), `visible price text was ${priceText}`).toBeLessThanOrEqual(50);

    const thumbnails = page.getByRole('tab', { name: /^View image \d+ of 4$/ });
    await expect(thumbnails).toHaveCount(4);
    const labels = await thumbnails.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('aria-label') ?? '')
    );
    expect(labels.slice().sort()).toEqual(
      [
        'View image 1 of 4',
        'View image 2 of 4',
        'View image 3 of 4',
        'View image 4 of 4',
      ].sort()
    );
    // srcSet is stable even if a hotlinked photo falls back to a placeholder.
    const thumbnailSources = await thumbnails.locator('img').evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('srcset') || element.getAttribute('src') || '')
    );
    expect(new Set(thumbnailSources).size, 'thumbnails must be distinct images').toBe(4);

    const frame = page.locator('[role="button"][aria-label^="Open full-size image"]').first();
    const mainImage = frame.locator('img').first();
    const before = await mainImage.getAttribute('srcset');
    await thumbnails.nth(1).click();
    await expect(thumbnails.nth(1)).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByText(/Image 2 of 4/)).toBeVisible();
    await expect
      .poll(() => mainImage.getAttribute('srcset'), { message: 'main image did not switch photos' })
      .not.toBe(before);

    await expect(page.getByText(/Photo by/)).toBeVisible();
  } finally {
    await captureBoth(page, 'product-gallery');
  }
});

test('Zoom — product', async ({ page }) => {
  try {
    const products = await readProducts(page, TECH_QUERY);
    const product = products[0];
    await page.goto(`${BASE}/product/${product.slug}`);
    await expect(page.getByRole('heading', { name: product.title })).toBeVisible();

    await expect(page.getByText('Click or hover to zoom')).toBeVisible();
    const frame = page.locator('[role="button"][aria-label^="Open full-size image"]').first();
    const image = frame.locator('img').first();
    await expect(image).toBeVisible();

    const before = await image.evaluate((element) => getComputedStyle(element).transform);
    await frame.hover();
    await expect
      .poll(
        () => image.evaluate((element) => getComputedStyle(element).transform),
        { message: 'hover did not change the main image CSS transform' }
      )
      .not.toBe(before);

    await frame.click();
    const lightbox = page.getByRole('dialog', { name: /image viewer/i });
    await expect(lightbox).toBeVisible();
    await expect(lightbox.getByRole('button', { name: 'Close', exact: true })).toBeVisible();
    await expect(lightbox.locator('img').first()).toBeVisible();
  } finally {
    await captureBoth(page, 'product-zoom');
  }
});

test('Variants — product', async ({ page }) => {
  try {
    const products = await readProducts(page, TECH_QUERY);
    const product = products.find((entry) => Array.isArray(entry.variants) && entry.variants.length > 0);
    expect(product, 'expected an API product with variants').toBeTruthy();
    expect(product!.variants.length).toBeGreaterThan(0);
    test.info().annotations.push({
      type: 'matrix-row',
      description:
        `Variants — product is Partial: API data exposes ${product!.variants.length} variant value(s) ` +
        `(${product!.variants.map((variant) => variant.value).join(', ')}) but the product page has no colour/size selector UI. ` +
        'This test passes unless a selector appears; if it appears the row is Done and the matrix must be reissued.',
    });

    await page.goto(`${BASE}/product/${product!.slug}`);
    await expect(page.getByRole('heading', { name: product!.title })).toBeVisible();

    await expect(page.getByRole('combobox', { name: /colou?r|size/i })).toHaveCount(0);
    await expect(page.getByRole('radiogroup', { name: /colou?r|size/i })).toHaveCount(0);
    await expect(page.getByRole('group', { name: /colou?r|size/i })).toHaveCount(0);

    const variantValues = [...new Set(product!.variants.map((variant) => variant.value))];
    for (const value of variantValues) {
      const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      await expect(page.getByRole('button', { name: new RegExp(`^${escaped}$`, 'i') })).toHaveCount(0);
    }
  } finally {
    await captureBoth(page, 'product-variants');
  }
});

test('Delivery estimate by district — product', async ({ page }) => {
  try {
    const products = await readProducts(page, TECH_QUERY);
    const product = products[0];
    await page.goto(`${BASE}/product/${product.slug}`);
    await expect(page.getByRole('heading', { name: product.title })).toBeVisible();
    test.info().annotations.push({
      type: 'matrix-row',
      description:
        'Delivery estimate by district — product is Partial: country/city selection updates the Arrives estimate, ' +
        'but there is no district/sector field or control. This test passes for that observed limitation and fails if a district control appears.',
    });

    const arrives = page.locator('aside p').filter({ hasText: /^Arrives\b/ }).first();
    await expect(arrives).toBeVisible();
    const before = await arrives.innerText();
    expect(before, `initial estimate was ${before}`).toMatch(
      /Arrives\s+\w{3},\s+\w{3}\s+\d+\s*[–-]\s*\w{3},\s+\w{3}\s+\d+/
    );

    const deliverButton = page
      .locator('aside')
      .getByRole('button', { name: /Deliver to .*— change/ })
      .first();
    await expect(deliverButton).toBeVisible();
    await deliverButton.click();
    const dialog = page.getByRole('dialog', { name: 'Choose your delivery location' });
    await expect(dialog).toBeVisible();
    await dialog.getByRole('radio', { name: /Kenya/ }).click();
    await dialog.getByRole('button', { name: 'Done', exact: true }).click();
    await expect(dialog).toHaveCount(0);

    await expect(
      page.locator('aside').getByRole('button', { name: /Deliver to .*Kenya.*— change/ })
    ).toBeVisible();
    const after = await arrives.innerText();
    expect(after, `estimate should change from ${before}`).not.toBe(before);
    expect(after, `updated estimate was ${after}`).toMatch(
      /Arrives\s+\w{3},\s+\w{3}\s+\d+\s*[–-]\s*\w{3},\s+\w{3}\s+\d+/
    );

    const districtControls = await page
      .locator('input, select, textarea, [role="combobox"]')
      .evaluateAll((elements) =>
        elements.filter((element) =>
          /district|sector/i.test(
            [
              element.getAttribute('aria-label'),
              element.getAttribute('name'),
              element.getAttribute('placeholder'),
              element.getAttribute('id'),
            ]
              .filter(Boolean)
              .join(' ')
          )
        ).length
      );
    expect(districtControls, 'unexpected district/sector control found').toBe(0);
  } finally {
    await captureBoth(page, 'product-delivery');
  }
});

test('Reviews — product', async ({ page }) => {
  try {
    const products = await readProducts(page, TECH_QUERY);
    const product = products[0];
    await page.goto(`${BASE}/product/${product.slug}`);
    await expect(page.getByRole('heading', { name: product.title })).toBeVisible();

    const reviews = page.locator('#reviews');
    await expect(reviews.getByRole('heading', { name: 'Customer reviews' })).toBeVisible();
    expect(await reviews.locator('ul > li').count(), 'seed reviews should render').toBeGreaterThanOrEqual(4);
    await expect(reviews.getByText('5 star', { exact: true })).toBeVisible();
    await expect(reviews.getByText('4 star', { exact: true })).toBeVisible();
    await expect(reviews.getByRole('button', { name: 'Write a customer review' })).toBeVisible();

    await submitReview(page, XSS_PAYLOAD);
    await expectPayloadRendered(page, '#reviews p', XSS_PAYLOAD);
    await expectNoInjectedPayloads(page);
  } finally {
    await captureBoth(page, 'product-reviews');
  }
});

test('Q&A — product', async ({ page }) => {
  try {
    const products = await readProducts(page, TECH_QUERY);
    const product = products[0];
    await page.goto(`${BASE}/product/${product.slug}`);
    await expect(page.getByRole('heading', { name: product.title })).toBeVisible();

    const questions = page.locator('#questions');
    await expect(questions.getByRole('heading', { name: /Questions & answers/ })).toBeVisible();
    await expect(questions.getByText('Does this ship to my country?')).toBeVisible();
    await expect(questions.getByRole('button', { name: 'Ask a question' })).toBeVisible();

    await submitQuestion(page, XSS_PAYLOAD);
    await expectPayloadRendered(page, '#questions p', XSS_PAYLOAD);
    await expectNoInjectedPayloads(page);
  } finally {
    await captureBoth(page, 'product-qa');
  }
});

test('Related products — product', async ({ page }) => {
  try {
    const products = await readProducts(page, TECH_QUERY);
    const product = products[0];
    await page.goto(`${BASE}/product/${product.slug}`);
    await expect(page.getByRole('heading', { name: product.title })).toBeVisible();

    const related = page.getByRole('region', { name: 'Customers also viewed' });
    await expect(related).toBeVisible();
    await expect(related.getByRole('heading', { name: 'Customers also viewed' })).toBeVisible();

    const links = related.locator('a[href^="/product/"]');
    expect(await links.count(), 'expected at least two related product cards').toBeGreaterThanOrEqual(2);
    const slugs = (await links.evaluateAll((elements) =>
      elements.map((element) => element.getAttribute('href') ?? '')
    )).map((href) => href.replace('/product/', '').split('?')[0]);
    expect(new Set(slugs).size, 'related cards should point to different products').toBeGreaterThanOrEqual(2);
    expect(slugs.every((slug) => Boolean(slug) && slug !== product.slug), 'related links must exclude current product').toBeTruthy();
  } finally {
    await captureBoth(page, 'product-related');
  }
});

test('Recently viewed on product page — product', async ({ page }) => {
  try {
    const products = await readProducts(page, TECH_QUERY);
    const chosen = products.slice(0, 3);
    expect(chosen.length).toBe(3);
    test.info().annotations.push({
      type: 'matrix-row',
      description:
        'Recently viewed on product page — product is Partial: the home page shows a Recently viewed rail after visiting products, ' +
        'but the product page itself has no Recently viewed heading. This test passes for that observed limitation and fails if the heading appears.',
    });

    for (const item of chosen) {
      await page.goto(`${BASE}/product/${item.slug}`);
      await expect(page.getByRole('heading', { name: item.title })).toBeVisible();
    }
    await expect(page.getByRole('heading', { name: 'Recently viewed', exact: true })).toHaveCount(0);

    const recentStorage = await page.evaluate(() => localStorage.getItem('soko_recent_v1') ?? '');
    expect(recentStorage, 'recent product ids should be persisted').toContain(chosen[2].id);

    await page.goto(`${BASE}/`);
    const rail = page.getByRole('region', { name: 'Recently viewed' });
    await expect(rail).toBeVisible();
    expect(await rail.locator('a[href^="/product/"]').count(), 'home rail should show product cards').toBeGreaterThanOrEqual(2);

    await page.goto(`${BASE}/product/${chosen[2].slug}`);
    await expect(page.getByRole('heading', { name: chosen[2].title })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Recently viewed', exact: true })).toHaveCount(0);
  } finally {
    await captureBoth(page, 'product-recent');
  }
});

test('XSS — required check', async ({ page }) => {
  try {
    const products = await readProducts(page, TECH_QUERY);
    const product = products[0];
    await page.goto(`${BASE}/product/${product.slug}`);
    await expect(page.getByRole('heading', { name: product.title })).toBeVisible();

    await submitReview(page, XSS_PAYLOAD);
    await submitQuestion(page, XSS_PAYLOAD);

    await expectPayloadRendered(page, '#reviews p', XSS_PAYLOAD);
    await expectPayloadRendered(page, '#questions p', XSS_PAYLOAD);
    expect(await page.evaluate(() => JSON.stringify(localStorage))).toContain(XSS_PAYLOAD);
    await expectNoInjectedPayloads(page);

    await page.reload();
    await expect(page.getByRole('heading', { name: product.title })).toBeVisible();
    await expectPayloadRendered(page, '#reviews p', XSS_PAYLOAD);
    await expectPayloadRendered(page, '#questions p', XSS_PAYLOAD);
    await expectNoInjectedPayloads(page);
  } finally {
    await captureBoth(page, 'product-xss');
  }
});
