import { expect, test, type APIRequestContext, type Page } from '@playwright/test';
import { API, BASE, captureBoth, expectNoUsd, money, visibleUsd } from './helpers';

const PRICE_PATTERN = /(?:RWF|FRw)\s*([\d,]+)|([\d,]+)\s*(?:RWF|FRw)/i;

async function waitForCards(page: Page): Promise<void> {
  await expect.poll(() => page.locator('article').count(), { timeout: 15_000 }).toBeGreaterThan(0);
}

test('Header — discovery', async ({ page }) => {
  try {
    await page.goto(`${BASE}/`);

    const header = page.locator('header.sticky');
    await expect(header).toHaveCount(1);
    await expect(header).toBeVisible();

    const logo = header.getByRole('link', { name: /Soko home/i }).first();
    await expect(logo).toBeVisible();
    await expect(logo).toHaveAttribute('href', '/');

    const search = page.locator('#site-search').first();
    await expect(search).toBeVisible();

    const cartLink = header.locator('a[href="/cart"]').first();
    await expect(cartLink).toBeVisible();
    await expect(cartLink).toHaveAttribute('aria-label', /,\s*\d+\s+items$/);

    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav).toBeVisible();
    const expectedLinks = [
      { name: /Today's Deals/i, href: '/deals' },
      { name: /Best Sellers/i, href: '/best-sellers' },
      { name: /New Arrivals/i, href: '/new-arrivals' },
      { name: /^Sell$/i, href: '/sell' },
    ];
    for (const link of expectedLinks) {
      const target = nav.getByRole('link', { name: link.name }).first();
      await expect(target).toBeVisible();
      await expect(target).toHaveAttribute('href', link.href);
    }

    const banner = page.locator('p', { hasText: /ship to/i }).filter({ hasText: /Rwanda/ }).first();
    await expect(banner).toBeVisible();
    await expect(banner).toContainText('Rwanda');
  } finally {
    await captureBoth(page, 'header-discovery');
  }
});

test('“All” mega menu — discovery', async ({ page }) => {
  try {
    await page.goto(`${BASE}/`);

    const nav = page.getByRole('navigation', { name: 'Primary' });
    await nav.getByRole('button', { name: /^All$/ }).click();

    const drawer = page.getByRole('dialog', { name: 'Browse Soko' });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByRole('heading', { name: 'Browse Soko' })).toBeVisible();

    const departmentLinks = drawer.locator('ul').first().getByRole('link');
    await expect(departmentLinks).toHaveCount(5);

    const first = departmentLinks.first();
    const href = await first.getAttribute('href');
    expect(href, 'first department link needs a category href').toMatch(/^\/category\/[a-z0-9-]+$/);
    await expect(first).toHaveAttribute('href', '/category/tech-gaming');

    await first.click();
    await expect(page).toHaveURL(/\/category\/tech-gaming$/);

    test.info().annotations.push({
      type: 'limitation',
      description:
        'The All menu is a single-column drawer, not a multi-column mega menu; this row checks that the drawer and its five category links work.',
    });
  } finally {
    await captureBoth(page, 'all-menu-discovery');
  }
});

test('Search with autocomplete — discovery', async ({ page }) => {
  try {
    await page.goto(`${BASE}/`);
    const search = page.locator('#site-search').first();
    const queries = ['mouse', 'serum', 'backpack'];

    for (const query of queries) {
      await page.goto(BASE);
      await expect(search).toBeVisible();
      await search.fill(query);

      const listbox = page.locator('[role="listbox"][id="search-suggestions"]');
      await expect(listbox).toBeVisible();
      await expect.poll(async () => listbox.locator('[role="option"], button').count()).toBeGreaterThan(0);

      await search.press('Enter');
      await expect(page).toHaveURL(/\/search\?q=/);
      await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe(query);
    }

    await page.goto(`${BASE}/search?q=zzzznotfound`);
    await expect(page.getByRole('heading', { name: /No results found/i })).toBeVisible();
    await expect(
      page.locator('main').getByText(/Try removing a filter|Try a different spelling/i).first()
    ).toBeVisible();
  } finally {
    await captureBoth(page, 'search-autocomplete-discovery');
  }
});

test('Category pages — discovery', async ({ page }) => {
  try {
    await page.goto(`${BASE}/category/tech-gaming`);

    await expect(page.getByRole('heading', { level: 1, name: 'Tech & Gaming' })).toBeVisible();

    await waitForCards(page);
    await expect(page.locator('article a[href^="/product/"]').first()).toBeVisible();

    const pricedCard = page.locator('article').filter({ hasText: PRICE_PATTERN }).first();
    await expect(pricedCard).toBeVisible();
    await expect(pricedCard.getByText(PRICE_PATTERN).first()).toBeVisible();

    const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
    await expect(breadcrumb).toBeVisible();
    await expect(breadcrumb).toContainText('Tech & Gaming');
  } finally {
    await captureBoth(page, 'category-pages-discovery');
  }
});

test('Filters: category, brand, RWF price, rating, in stock, discount — discovery', async ({ page }) => {
  test.setTimeout(180_000);
  try {
    await page.goto(`${BASE}/search`);
    await waitForCards(page);

    const titles = async () => (await page.locator('article a[href^="/product/"]').allTextContents()).join('|');
    const readTotal = async () => {
      const text = await page
        .locator('p')
        .filter({ hasText: /Showing\s+[\d,]+(?:[–-][\d,]+)?\s+of\s+[\d,]+/i })
        .first()
        .innerText();
      const match = text.match(/of\s+([\d,]+)/i);
      expect(match, `unexpected result count text: ${text}`).not.toBeNull();
      return Number(match![1].replace(/,/g, ''));
    };

    const baseline = { total: await readTotal(), titles: await titles() };
    expect(baseline.total, 'baseline catalog should not be empty').toBeGreaterThan(0);
    expect(await page.locator('article').count()).toBeGreaterThan(0);

    const panel = page.locator('aside').filter({ hasText: 'Price (RWF)' }).first();
    await expect(panel).toBeVisible();

    const applyAndCheck = async (label: string, param: string, apply: () => Promise<void>) => {
      await page.goto(`${BASE}/search`);
      await waitForCards(page);
      const before = new URL(page.url()).search;

      await apply();

      await expect
        .poll(
          async () => {
            const url = new URL(page.url());
            if (!url.searchParams.has(param)) return false;
            const total = await readTotal();
            return total > 0 && total <= baseline.total;
          },
          { timeout: 15_000, message: `${label} did not change the URL query and result set` }
        )
        .toBe(true);
      await waitForCards(page);

      expect(new URL(page.url()).search, `${label} should change the URL query`).not.toBe(before);
      expect(await page.locator('article').count(), `${label} should leave cards on the page`).toBeGreaterThan(0);
    };

    await applyAndCheck('category filter', 'category', async () => {
      await panel.getByRole('button', { name: /Tech & Gaming/ }).first().click();
    });

    await applyAndCheck('brand filter', 'brands', async () => {
      await panel.getByRole('checkbox').first().click();
    });

    await applyAndCheck('RWF price filter', 'min', async () => {
      await panel.getByLabel('Minimum price').fill('100000');
      await panel.getByLabel('Maximum price').fill('140000');
      await panel.getByRole('button', { name: 'Go', exact: true }).click();
    });

    await applyAndCheck('rating filter', 'rating', async () => {
      await panel.getByRole('button', { name: /&\s*up/i }).first().click();
    });

    await applyAndCheck('in-stock filter', 'inStock', async () => {
      await panel.getByLabel('In stock only').click();
    });

    await applyAndCheck('discount filter', 'deals', async () => {
      await panel.getByLabel('On sale').click();
    });
  } finally {
    await captureBoth(page, 'filters-discovery');
  }
});

test('Merchandising flag filters — discovery', async ({ page }) => {
  try {
    await page.goto(`${BASE}/search`);
    await waitForCards(page);

    const flagPattern = /^(Gen Z Pick|Viral|Best seller|Trending)$/i;
    await expect
      .poll(() => page.locator('article').getByText(flagPattern).count(), { timeout: 15_000 })
      .toBeGreaterThan(0);

    const panel = page.locator('aside').filter({ hasText: 'Price (RWF)' }).first();
    await expect(panel).toBeVisible();

    const buttonFilters = await panel.getByRole('button', { name: flagPattern }).count();
    const checkboxFilters = await panel.getByRole('checkbox', { name: flagPattern }).count();
    const labelFilters = await panel.locator('label').filter({ hasText: flagPattern }).count();
    const found = buttonFilters + checkboxFilters + labelFilters;

    test.info().annotations.push({
      type: 'limitation',
      description:
        'Merchandising flags appear on product cards but FilterPanel exposes no matching filter controls; category names such as "Viral Skincare & Haircare" are not counted as flag filters.',
    });
    expect(
      found,
      'Merchandising flag filter controls are present: this row is now Done and needs reissue.'
    ).toBe(0);
  } finally {
    await captureBoth(page, 'merch-flags-discovery');
  }
});

test('Sorting — discovery', async ({ page }) => {
  try {
    await page.goto(`${BASE}/search`);
    await waitForCards(page);

    const sortSelect = page.getByRole('combobox', { name: /Sort by/i });
    await expect(sortSelect).toBeVisible();

    const readCards = () =>
      page.locator('article').evaluateAll((articles) =>
        articles.map((article) => {
          const text = article.textContent ?? '';
          const priceMatch = text.match(/(?:RWF|FRw)\s*([\d,]+)|([\d,]+)\s*(?:RWF|FRw)/i);
          const ratingMatch = text.match(/(\d\.\d)\s+out of 5 stars/i);
          const titleLink = Array.from(article.querySelectorAll('a[href^="/product/"]')).find((link) =>
            (link.textContent ?? '').trim()
          );
          return {
            price: priceMatch ? Number((priceMatch[1] ?? priceMatch[2]).replace(/,/g, '')) : -1,
            rating: ratingMatch ? Number(ratingMatch[1]) : -1,
            title: (titleLink?.textContent ?? '').trim(),
          };
        })
      );

    const snapshots: Record<string, Awaited<ReturnType<typeof readCards>>> = {};
    const options = [
      { value: 'featured', label: 'Featured' },
      { value: 'price-asc', label: 'Price: low to high' },
      { value: 'price-desc', label: 'Price: high to low' },
      { value: 'rating', label: 'Customer rating' },
      { value: 'newest', label: 'Newest arrivals' },
    ];

    for (const option of options) {
      await expect(sortSelect.locator(`option[value="${option.value}"]`)).toHaveCount(1);
      const previousKey = snapshots.featured?.map((card) => card.title).join('|') ?? '';

      await sortSelect.selectOption(option.value);
      await expect
        .poll(() => new URL(page.url()).searchParams.get('sort'), { timeout: 15_000 })
        .toBe(option.value === 'featured' ? null : option.value);
      await expect.poll(async () => (await readCards()).length, { timeout: 15_000 }).toBeGreaterThan(0);

      if (previousKey) {
        await expect
          .poll(async () => (await readCards()).map((card) => card.title).join('|'), { timeout: 15_000 })
          .not.toBe(previousKey);
      }

      if (option.value === 'price-asc' || option.value === 'price-desc') {
        const ascendingOrder = option.value === 'price-asc';
        await expect
          .poll(
            async () => {
              const prices = (await readCards()).map((card) => card.price);
              return prices.length === 12 && prices.every((price, index) =>
                index === 0 || (ascendingOrder ? price >= prices[index - 1] : price <= prices[index - 1])
              );
            },
            { timeout: 15_000, message: `${option.label} DOM prices did not settle into the expected order` }
          )
          .toBe(true);
      }
      snapshots[option.value] = await readCards();
      expect(snapshots[option.value].length, `${option.label} should render cards`).toBeGreaterThan(0);
      expect(
        snapshots[option.value].every((card) => card.price > 0 && card.rating > 0 && card.title.length > 0),
        `${option.label} should expose price, rating and title in each card`
      ).toBe(true);
    }

    const featuredKey = snapshots.featured.map((card) => card.title).join('|');
    for (const value of ['price-asc', 'price-desc']) {
      expect(snapshots[value].map((card) => card.title).join('|'), `${value} must reorder cards`).not.toBe(featuredKey);
    }

    const ascending = snapshots['price-asc'].map((card) => card.price);
    const descending = snapshots['price-desc'].map((card) => card.price);
    expect(
      ascending.every((price, index) => index === 0 || price >= ascending[index - 1]),
      `price-asc is not monotonic: ${ascending.join(', ')}`
    ).toBe(true);
    expect(
      descending.every((price, index) => index === 0 || price <= descending[index - 1]),
      `price-desc is not monotonic: ${descending.join(', ')}`
    ).toBe(true);
    expect(ascending.join(',')).not.toBe(descending.join(','));
  } finally {
    await captureBoth(page, 'sorting-discovery');
  }
});

test('Pagination — discovery', async ({ page }) => {
  try {
    await page.goto(`${BASE}/search`);
    await waitForCards(page);

    const cards = page.locator('article');
    const titles = async () => (await page.locator('article a[href^="/product/"]').allTextContents()).join('|');
    const pagination = page.getByRole('navigation', { name: 'Product pages' });

    await expect(cards).toHaveCount(12);
    await expect(pagination).toBeVisible();
    const firstPageTitles = await titles();

    await pagination.getByRole('button', { name: /Next/i }).click();
    await expect.poll(() => new URL(page.url()).searchParams.get('page')).toBe('2');
    await waitForCards(page);
    await expect.poll(async () => (await titles()).length > 0).toBe(true);
    await expect.poll(async () => await titles(), { timeout: 15_000 }).not.toBe(firstPageTitles);
    await expect(cards).toHaveCount(12);

    await pagination.getByRole('button', { name: /Previous/i }).click();
    await expect
      .poll(() => {
        const pageParam = new URL(page.url()).searchParams.get('page');
        return pageParam === null || pageParam === '1';
      }, { timeout: 15_000 })
      .toBe(true);
    await waitForCards(page);
    await expect.poll(async () => await titles(), { timeout: 15_000 }).toBe(firstPageTitles);
    await expect(cards).toHaveCount(12);
  } finally {
    await captureBoth(page, 'pagination-discovery');
  }
});

test('Currency — required check', async ({ page }) => {
  try {
    const failures: string[] = [];
    const check = async (path: string) => {
      await page.goto(`${BASE}${path}`);
      await expect(page.locator('#main-content h1, #main-content h2').first()).toBeVisible({ timeout: 15_000 });
      try {
        await expectNoUsd(page);
      } catch {
        failures.push(`${path}: ${(await visibleUsd(page)).join(' | ') || 'USD leak reported by expectNoUsd'}`);
      }
    };

    await check('/');
    await check('/category/tech-gaming');

    const productHref = await page.locator('article a[href^="/product/"]').first().getAttribute('href');
    expect(productHref, 'category page must expose a product link').toMatch(/^\/product\/[^/]+$/);

    for (const path of [productHref!, '/cart', '/checkout', '/orders']) {
      await check(path);
    }

    expect(failures, `Visible USD leaks — ${failures.join(' | ')}`).toEqual([]);
  } finally {
    await captureBoth(page, 'currency-required');
  }
});

async function fetchSeedProduct(request: APIRequestContext): Promise<Record<string, unknown>> {
  const response = await request.get(`${API}/api/products?category=tech-gaming&pageSize=1`);
  expect(response.ok(), `API product request failed with ${response.status()}`).toBeTruthy();
  const body = (await response.json()) as { items?: Array<Record<string, unknown>> };
  const product = body.items?.[0];
  expect(product, 'API must return at least one product to seed the cart').toBeTruthy();
  return product!;
}

test('Free-delivery progress bar boundary RWF 45,500 — required check', async ({ page, request }) => {
  try {
    const product = await fetchSeedProduct(request);
    const threshold = 45_500;

    for (const subtotal of [threshold - 1, threshold, threshold + 1]) {
      const line = {
        productId: String(product.id),
        qty: 1,
        snapshot: { ...product, price: subtotal, priceRwf: subtotal },
      };
      await page.goto(BASE);
      await page.evaluate((cartLine) => {
        localStorage.setItem('soko_cart_v1', JSON.stringify([cartLine]));
      }, line);
      await page.goto(`${BASE}/cart`);
      const progress = page.getByRole('progressbar', { name: /Progress towards free delivery/i });
      await expect(progress).toBeVisible();

      const subtotalCell = page.locator('dl > div').filter({ hasText: /^Subtotal/i }).locator('dd').first();
      expect(money(await subtotalCell.innerText()), `cart subtotal for ${subtotal}`).toBe(subtotal);

      const expectedProgress = Math.min(100, Math.round((subtotal / threshold) * 100));
      await expect(progress).toHaveAttribute('aria-valuenow', String(expectedProgress));

      const copy = page
        .locator('p')
        .filter({ hasText: /away from free delivery|qualifies for free delivery/i })
        .first();
      await expect(copy).toBeVisible();
      if (subtotal < threshold) {
        await expect(copy).toContainText('away from free delivery');
        await expect(copy).not.toContainText('qualifies for free delivery');
      } else {
        await expect(copy).toContainText('qualifies for free delivery');
      }
    }
  } finally {
    await captureBoth(page, 'free-delivery-boundary');
  }
});
