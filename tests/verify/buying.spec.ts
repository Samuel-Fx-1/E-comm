import { expect, test, type Locator, type Page } from '@playwright/test';
import { BASE, API, captureBoth, money } from './helpers';

const FREE_DELIVERY_THRESHOLD = 45_500;
const STANDARD_FEE = 6_500;
const EXPRESS_FEE = 16_900;

interface DiscoveredProduct {
  id: string;
  slug: string;
  title: string;
  price: number;
  stock: number;
}

/** Fresh storage per test, but do not wipe it on the reloads used to verify persistence. */
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    try {
      if (sessionStorage.getItem('buying-verify-initialised') !== '1') {
        localStorage.clear();
        sessionStorage.setItem('buying-verify-initialised', '1');
      }
    } catch {
      /* storage can be unavailable; the demo app then keeps state in memory */
    }
  });
});

/** Discover a category slug from /api/meta and a product slug from the category page. */
async function discoverProduct(page: Page): Promise<DiscoveredProduct> {
  const metaResponse = await page.request.get(`${API}/api/meta`);
  expect(metaResponse.ok(), `${API}/api/meta should be available`).toBeTruthy();
  const meta = (await metaResponse.json()) as { categories?: Array<{ slug: string; name: string }> };
  const category = meta.categories?.find((entry) => entry.slug === 'tech-gaming') ?? meta.categories?.[0];
  expect(category?.slug, 'API meta must expose at least one category slug').toBeTruthy();

  await page.goto(`${BASE}/category/${category!.slug}`);
  const card = firstProductCard(page);
  await expect(card, 'the category page should render product cards').toBeVisible();

  const titleLink = card.locator('a[href^="/product/"]').last();
  const title = (await titleLink.innerText()).trim();
  const href = (await titleLink.getAttribute('href')) ?? '';
  const slug = href.split('/').filter(Boolean).pop() ?? '';
  expect(title.length, 'a product title should be discoverable').toBeGreaterThan(2);
  expect(slug, 'a product slug should be discoverable from the category page').toBeTruthy();

  const detail = await page.request.get(`${API}/api/products/${encodeURIComponent(slug)}`);
  expect(detail.ok(), `API product ${slug} should exist`).toBeTruthy();
  const product = await detail.json();
  const price = Number(product.price ?? product.priceRwf);
  const stock = Number(product.stock ?? 1);
  expect(product.id, 'the API product should expose the id used by local wishlist storage').toBeTruthy();
  expect(Number.isFinite(price), 'the API product should have a numeric price').toBe(true);
  return { id: String(product.id), slug, title, price, stock };
}

function firstProductCard(page: Page): Locator {
  return page.locator('article').filter({ has: page.getByRole('button', { name: 'Add to Cart' }) }).first();
}

function cartLine(page: Page, title: string): Locator {
  return page.locator('li').filter({ hasText: title }).first();
}

async function addCardToCart(page: Page): Promise<void> {
  const card = firstProductCard(page);
  await expect(card).toBeVisible();
  await card.getByRole('button', { name: 'Add to Cart' }).first().click();
  await expect(page.getByRole('dialog', { name: /^Cart \(1\)$/ }), 'add-to-cart should open the drawer').toBeVisible();
}

async function summaryValue(page: Page, label: RegExp): Promise<string> {
  return page.evaluate((pattern) => {
    const re = new RegExp(pattern);
    const node = Array.from(document.querySelectorAll('dt')).find((element) =>
      re.test((element.textContent ?? '').trim())
    );
    return node?.nextElementSibling?.textContent ?? '';
  }, label.source);
}

async function fillAddressAndContinue(page: Page): Promise<void> {
  await expect(page.getByRole('heading', { name: 'Delivery address' })).toBeVisible();
  await page.getByLabel('Full name').fill('Aline Mukamana');
  await page.getByLabel('Phone number').fill('+250 788 123 456');
  await expect(page.getByLabel('Country')).toHaveValue('RW');
  await page.getByLabel('City / town').selectOption('Kigali');
  await page.getByLabel('Street address').fill('12 KG 7 Avenue');
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Delivery speed' })).toBeVisible();
}

async function completeCheckout(page: Page, payment: 'card' | 'cash' = 'card'): Promise<string> {
  await page.goto(`${BASE}/checkout`);
  await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
  await fillAddressAndContinue(page);
  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Payment method' })).toBeVisible();

  if (payment === 'cash') {
    await page.getByRole('radio', { name: /Cash on delivery/i }).check();
  } else {
    await page.getByLabel('Card number (demo)').fill('4242 4242 4242 4242');
    await page.getByLabel('Name on card').fill('Aline Mukamana');
    await page.getByLabel('Expiry (MM/YY)').fill('12/28');
    await page.getByLabel('CVV').fill('123');
  }

  await page.getByRole('button', { name: 'Continue' }).click();
  await expect(page.getByRole('heading', { name: 'Review your order' })).toBeVisible();
  await page.getByRole('button', { name: /Place demo order/ }).click();
  await expect(page).toHaveURL(/\/order-confirmation\/[^/]+$/);
  return decodeURIComponent(page.url().split('/').filter(Boolean).pop() ?? '');
}

function deliveryRow(page: Page, index: number): Locator {
  return page.getByRole('radiogroup', { name: 'Delivery speed' }).locator('label').nth(index);
}

async function deliveryFee(row: Locator): Promise<number> {
  return money(await row.locator('span.font-bold').nth(1).innerText());
}

test('Cart drawer and page — buying', async ({ page }) => {
  try {
    const product = await discoverProduct(page);
    await addCardToCart(page);

    const drawer = page.getByRole('dialog', { name: 'Cart (1)' });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(product.title)).toBeVisible();
    await expect(drawer.getByText('Subtotal')).toBeVisible();
    await drawer.getByRole('button', { name: 'Close', exact: true }).click();
    await expect(page.getByRole('dialog')).toHaveCount(0);

    await page.goto(`${BASE}/cart`);
    await expect(page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible();
    await expect(cartLine(page, product.title)).toBeVisible();
    const quantity = page.getByLabel(`Quantity for ${product.title}`);
    await expect(quantity, 'quantity controls should be rendered').toBeVisible();
    await expect(quantity).toHaveValue('1');
    expect(money(await summaryValue(page, /^Subtotal/)), 'subtotal should match the cart line').toBe(product.price);

    test.info().annotations.push({
      type: 'persistence',
      description: `Reloaded /cart after adding ${product.title}; the line and subtotal must survive.`,
    });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Shopping cart' })).toBeVisible();
    await expect(cartLine(page, product.title), 'cart must persist across reload').toBeVisible();
    expect(money(await summaryValue(page, /^Subtotal/))).toBe(product.price);

    await cartLine(page, product.title).getByRole('button', { name: 'Delete' }).click();
    await expect(page.getByText('Your Soko cart is empty')).toBeVisible();
    await expect(cartLine(page, product.title)).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('soko_cart_v1'))).toBe('[]');
  } finally {
    await captureBoth(page, 'cart-drawer-page');
  }
});

test('Wishlist — buying', async ({ page }) => {
  try {
    const product = await discoverProduct(page);
    const card = firstProductCard(page);
    await expect(card.getByRole('button', { name: 'Add to wishlist' })).toBeVisible();
    await card.getByRole('button', { name: 'Add to wishlist' }).click();
    await expect(card.getByRole('button', { name: 'Remove from wishlist' })).toBeVisible();

    await page.goto(`${BASE}/wishlist`);
    await expect(page.getByRole('heading', { name: 'Your wishlist' })).toBeVisible();
    await expect(page.getByText(/1 saved item/)).toBeVisible();
    await expect(page.locator('article').filter({ hasText: product.title }).first()).toBeVisible();

    test.info().annotations.push({
      type: 'persistence',
      description: `Reloaded /wishlist; ${product.title} should still be saved in soko_wishlist_v1.`,
    });
    await page.reload();
    await expect(page.locator('article').filter({ hasText: product.title }).first(), 'wishlist must persist').toBeVisible();
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('soko_wishlist_v1') ?? '[]'))).toContain(product.id);

    const savedCard = page.locator('article').filter({ hasText: product.title }).first();
    await savedCard.getByRole('button', { name: 'Remove from wishlist' }).click();
    await expect(page.getByText('Your wishlist is empty')).toBeVisible();
    await expect(page.locator('article').filter({ hasText: product.title })).toHaveCount(0);
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('soko_wishlist_v1') ?? '[]'))).toEqual([]);
  } finally {
    await captureBoth(page, 'wishlist');
  }
});

test('Checkout — buying', async ({ page }) => {
  try {
    const product = await discoverProduct(page);
    await addCardToCart(page);
    await page.goto(`${BASE}/cart`);
    await expect(cartLine(page, product.title)).toBeVisible();

    test.info().annotations.push({
      type: 'persistence',
      description: 'Reloaded /cart between add and checkout; the cart line must still be there.',
    });
    await page.reload();
    await expect(cartLine(page, product.title), 'cart must survive the pre-checkout reload').toBeVisible();

    await page.goto(`${BASE}/checkout`);
    await expect(page.getByRole('heading', { name: 'Checkout' })).toBeVisible();
    await fillAddressAndContinue(page);
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: 'Payment method' })).toBeVisible();
    await page.getByLabel('Card number (demo)').fill('4242 4242 4242 4242');
    await page.getByLabel('Name on card').fill('Aline Mukamana');
    await page.getByLabel('Expiry (MM/YY)').fill('12/28');
    await page.getByLabel('CVV').fill('123');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: 'Review your order' })).toBeVisible();
    await expect(page.getByText(product.title).first()).toBeVisible();
    await page.getByRole('button', { name: /Place demo order/ }).click();

    await expect(page).toHaveURL(/\/order-confirmation\/[^/]+$/);
    const orderId = page.url().split('/').filter(Boolean).pop() ?? '';
    expect(orderId, 'a new order id should be generated').toMatch(/^SK-/i);
    await expect(page.getByRole('heading', { name: 'Order placed' })).toBeVisible();

    test.info().annotations.push({
      type: 'persistence',
      description: `Reloaded /order-confirmation/${orderId}; the browser-local order must remain visible.`,
    });
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Order placed' }), 'confirmation must survive reload').toBeVisible();
    await expect(page.getByText(orderId, { exact: false }).first()).toBeVisible();

    await page.goto(`${BASE}/orders`);
    await expect(page.getByRole('heading', { name: 'Your orders' })).toBeVisible();
    await expect(page.getByText(`Order # ${orderId}`), 'new order should appear in history').toBeVisible();
    test.info().annotations.push({
      type: 'scope',
      description: 'Orders are stored in localStorage only (soko_orders_v1); there is no server order record.',
    });
  } finally {
    await captureBoth(page, 'checkout');
  }
});

test('Accounts — buying', async ({ page }) => {
  try {
    await page.goto(`${BASE}/signin`);
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible();
    await page.goto(`${BASE}/register`);
    await expect(page.getByRole('heading', { name: 'Create your account' })).toBeVisible();

    const email = `buying.verify.${Date.now()}@example.com`;
    await page.getByLabel('Full name').fill('Demo Buyer');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('DemoPass123!');
    await page.getByLabel('Confirm password').fill('DemoPass123!');
    await page.getByRole('button', { name: 'Create account' }).click();
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByRole('heading', { name: 'Hello, Demo' })).toBeVisible();
    await expect(page.getByText(email, { exact: false }), 'account page should show the email').toBeVisible();

    // The registered demo account can sign back in; there is still no server session.
    await page.getByRole('button', { name: 'Sign out' }).click();
    await expect(page.getByRole('heading', { name: 'Sign in to your account' })).toBeVisible();
    await page.goto(`${BASE}/signin`);
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password', { exact: true }).fill('DemoPass123!');
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page).toHaveURL(/\/account$/);
    await expect(page.getByRole('heading', { name: 'Hello, Demo' })).toBeVisible();

    const cookies = await page.evaluate(() => document.cookie);
    expect(cookies, 'no server session cookie should be issued').not.toContain('soko_session');
    expect(await page.evaluate(() => localStorage.getItem('soko_session_v1'))).toBeTruthy();
    test.info().annotations.push({
      type: 'scope',
      description: 'Client-demo only: identity lives in soko_users_v1/soko_session_v1; document.cookie has no soko_session.',
    });
  } finally {
    await captureBoth(page, 'accounts');
  }
});

test('Rwandan addresses — buying', async ({ page }) => {
  try {
    test.info().annotations.push({
      type: 'gap',
      description: 'Admin hierarchy is missing: checkout offers only a city select, with no province/district/sector fields.',
    });
    const product = await discoverProduct(page);
    await addCardToCart(page);
    await page.goto(`${BASE}/checkout`);
    await expect(page.getByRole('heading', { name: 'Delivery address' })).toBeVisible();

    await expect(page.getByLabel('Country'), 'Rwanda should be the selected country').toHaveValue('RW');
    await expect(page.getByLabel('Phone number'), 'a phone field should be present').toBeVisible();
    await expect(page.getByLabel('City / town'), 'a city field should be present').toBeVisible();

    const hierarchy = await page.evaluate(() => {
      const count = (term: string) =>
        Array.from(document.querySelectorAll('label')).filter((label) =>
          (label.textContent ?? '').toLowerCase().includes(term)
        ).length;
      return { province: count('province'), district: count('district'), sector: count('sector') };
    });
    expect(
      hierarchy,
      'admin hierarchy is missing: the Rwandan address step has no province, district or sector fields (only a flat city select)'
    ).toEqual({ province: 1, district: 1, sector: 1 });
    expect(product.title.length).toBeGreaterThan(0);
  } finally {
    await captureBoth(page, 'rwandan-addresses');
  }
});

test('Delivery fee rules — buying', async ({ page }) => {
  try {
    test.info().annotations.push({
      type: 'gap',
      description: 'No zone table exists: fees are a flat global threshold (45,500 RWF) and a flat express fee (16,900 RWF).',
    });
    const response = await page.request.get(`${API}/api/products?sort=price-asc&pageSize=1`);
    expect(response.ok(), 'the product API should return the cheapest product').toBeTruthy();
    const data = await response.json();
    const product = data.items?.[0];
    expect(product?.slug, 'API should return at least one product').toBeTruthy();
    const price = Number(product.price);
    expect(price, 'product price should be numeric').toBeGreaterThan(0);

    await page.goto(`${BASE}/product/${product.slug}`);
    await expect(page.getByRole('heading', { name: product.title })).toBeVisible();
    await page.locator('#main-content').getByRole('button', { name: 'Add to Cart' }).first().click();
    await expect(page.getByRole('dialog', { name: /^Cart \(1\)$/ })).toBeVisible();

    await page.goto(`${BASE}/checkout`);
    await fillAddressAndContinue(page);
    expect(await deliveryFee(deliveryRow(page, 0)), 'standard fee on a low-value cart').toBe(STANDARD_FEE);
    expect(await deliveryFee(deliveryRow(page, 1)), 'express fee should be displayed').toBe(EXPRESS_FEE);
    await expect(page.getByLabel(/Zone|Province|District|Sector/i), 'there should be a delivery zone selector').toHaveCount(0);

    const needed = Math.floor(FREE_DELIVERY_THRESHOLD / price) + 1;
    const qty = Math.min(Number(product.stock), needed);
    expect(qty, 'the cheapest product needs enough stock to cross the free-delivery threshold').toBe(needed);
    await page.goto(`${BASE}/cart`);
    await page.getByLabel(`Quantity for ${product.title}`).selectOption(String(qty));
    expect(money(await summaryValue(page, /^Subtotal/))).toBe(price * qty);
    expect(money(await summaryValue(page, /^Subtotal/))).toBeGreaterThan(FREE_DELIVERY_THRESHOLD);

    await page.goto(`${BASE}/checkout`);
    await fillAddressAndContinue(page);
    const freeFee = (await deliveryRow(page, 0).locator('span.font-bold').nth(1).innerText()).trim();
    expect(freeFee, 'standard delivery should become Free above the threshold').toBe('Free');
    expect(await deliveryFee(deliveryRow(page, 1))).toBe(EXPRESS_FEE);
  } finally {
    await captureBoth(page, 'delivery-fees');
  }
});

test('Payment providers — buying', async ({ page }) => {
  try {
    test.info().annotations.push({
      type: 'gap',
      description: 'No provider abstraction exists: card / Mobile money / cash are hard-coded labels with mock-only validation.',
    });
    const externalPaymentCalls: string[] = [];
    page.on('request', (request) => {
      if (/stripe|paypal|braintree|flutterwave|paystack|mpesa|m-pesa|mtn|airtel|safaricom/i.test(request.url())) {
        externalPaymentCalls.push(request.url());
      }
    });

    await discoverProduct(page);
    await addCardToCart(page);
    await page.goto(`${BASE}/checkout`);
    await fillAddressAndContinue(page);
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: 'Payment method' })).toBeVisible();

    const methods = page.getByRole('radiogroup', { name: 'Payment method' });
    await expect(methods.getByRole('radio', { name: /^Card$/i }), 'card option').toBeVisible();
    await expect(methods.getByRole('radio', { name: /Mobile money/i }), 'Mobile Money option').toBeVisible();
    await expect(methods.getByRole('radio', { name: /Cash on delivery/i }), 'Cash on Delivery option').toBeVisible();
    await expect(page.getByText(/this checkout simulates payment/i), 'mock-only copy').toBeVisible();
    await expect(page.getByText(/no real payment is taken/i), 'no real charge copy').toBeVisible();
    await expect(page.getByText(/Simulated checkout/i), 'simulated checkout copy').toBeVisible();

    await methods.getByRole('radio', { name: /Mobile money/i }).check();
    await expect(page.getByText(/never contacts a payment provider/i)).toBeVisible();
    expect(externalPaymentCalls, 'mock-only checkout must not call a real payment provider').toEqual([]);
  } finally {
    await captureBoth(page, 'payment-providers');
  }
});

test('Orders and history — buying', async ({ page }) => {
  try {
    const product = await discoverProduct(page);
    await addCardToCart(page);
    const orderId = await completeCheckout(page, 'cash');

    await page.goto(`${BASE}/orders`);
    await expect(page.getByRole('heading', { name: 'Your orders' })).toBeVisible();
    await expect(page.getByText('Sample order').first(), 'sample orders should be listed').toBeVisible();
    await expect(page.getByText(`Order # ${orderId}`), 'the new order should be listed').toBeVisible();

    const orderedFilter = page.getByRole('button', { name: 'Ordered', exact: true });
    await expect(orderedFilter).toBeVisible();
    await orderedFilter.click();
    await expect(orderedFilter).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByText(`Order # ${orderId}`), 'new order has status Ordered').toBeVisible();
    await expect(page.getByText('Sample order', { exact: true })).toHaveCount(0);

    await page.goto(`${BASE}/orders/${orderId}`);
    await expect(page.getByRole('heading', { name: orderId })).toBeVisible();
    expect(money(await summaryValue(page, /^Total$/)), 'order detail should show a total').toBeGreaterThan(0);
    await page.getByRole('button', { name: 'Buy it again' }).click();
    const drawer = page.getByRole('dialog', { name: /^Cart \(/ });
    await expect(drawer).toBeVisible();
    await expect(drawer.getByText(product.title)).toBeVisible();

    test.info().annotations.push({
      type: 'persistence',
      description: `Reloaded /orders; order ${orderId} must persist in soko_orders_v1 (sample orders are code-defined).`,
    });
    await page.goto(`${BASE}/orders`);
    await page.reload();
    await expect(page.getByText(`Order # ${orderId}`), 'order history must survive reload').toBeVisible();
    expect(await page.evaluate(() => localStorage.getItem('soko_orders_v1'))).toContain(orderId);
  } finally {
    await captureBoth(page, 'orders-history');
  }
});

test('Tracking statuses — buying', async ({ page }) => {
  try {
    test.info().annotations.push({
      type: 'scope',
      description: 'Partial: timeline shows Ordered/Shipped/Out for delivery/Delivered, but new orders stay Ordered and no status mutation control exists.',
    });
    await discoverProduct(page);
    await addCardToCart(page);
    const orderId = await completeCheckout(page, 'cash');

    await expect(page.locator('ol[aria-label="Order status: Ordered"]'), 'new order should start Ordered').toBeVisible();
    await page.goto(`${BASE}/orders/${orderId}`);
    await expect(page.getByRole('heading', { name: 'Status: Ordered' }), 'new order must remain Ordered').toBeVisible();

    const timeline = page.locator('ol[aria-label^="Order status"]');
    await expect(timeline).toBeVisible();
    for (const label of ['Order placed', 'Shipped', 'Out for delivery', 'Delivered']) {
      await expect(timeline.getByText(label, { exact: true }), `timeline should render ${label}`).toBeVisible();
    }
    await expect(
      page.getByRole('button', { name: /mark (as )?(shipped|delivered)|advance status|update status|change status|edit status/i }),
      'there should be a status mutation control'
    ).toHaveCount(0);
    await expect(page.locator('select[aria-label*="status" i], input[aria-label*="status" i]')).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Status: Ordered' }), 'status must still be Ordered after reload').toBeVisible();
  } finally {
    await captureBoth(page, 'tracking-statuses');
  }
});

test('Server-side totals/price/stock validation at order time — buying', async ({ page, request }) => {
  try {
    await page.goto(`${BASE}/`);
    test.info().annotations.push({
      type: 'gap',
      description: 'Requirement missing server-side: there is no order endpoint, so totals/price/stock cannot be revalidated at order time.',
    });

    // Pass the existing CSRF skeleton so the POST reaches the API catch-all.
    const csrf = await request.get(`${API}/api/csrf`);
    expect(csrf.ok(), 'CSRF token endpoint should be available').toBeTruthy();
    const { csrfToken } = (await csrf.json()) as { csrfToken?: string };
    expect(csrfToken, 'a CSRF token should be returned').toBeTruthy();

    const tamperedBody = {
      items: [
        {
          productId: 'rgb-smart-led-room-strip-lights',
          title: 'Tampered line',
          slug: 'rgb-smart-led-room-strip-lights',
          price: 1,
          qty: 999,
        },
      ],
      subtotal: 1,
      shipping: 0,
      tax: 0,
      total: 1,
      address: { fullName: 'Attacker', phone: '1', country: 'RW', city: 'Kigali', line1: 'x' },
      deliveryMethod: 'standard',
      paymentLabel: 'free',
    };
    const response = await request.post(`${API}/api/orders`, {
      headers: { 'x-csrf-token': csrfToken! },
      data: tamperedBody,
    });
    expect(response.status(), 'no /api/orders endpoint exists; the API catch-all should reject the POST').toBe(404);
    expect(await response.json()).toEqual({ error: 'Not found' });
  } finally {
    await captureBoth(page, 'server-order-validation');
  }
});

test('Idempotent order creation — buying', async ({ page }) => {
  try {
    test.info().annotations.push({
      type: 'gap',
      description: 'Expected failure: no idempotency key/guard; Place order is a plain client handler with a Date.now() id.',
    });
    await discoverProduct(page);
    await addCardToCart(page);
    await page.goto(`${BASE}/checkout`);
    await fillAddressAndContinue(page);
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: 'Payment method' })).toBeVisible();
    await page.getByLabel('Card number (demo)').fill('4242 4242 4242 4242');
    await page.getByLabel('Name on card').fill('Aline Mukamana');
    await page.getByLabel('Expiry (MM/YY)').fill('12/28');
    await page.getByLabel('CVV').fill('123');
    await page.getByRole('button', { name: 'Continue' }).click();
    await expect(page.getByRole('heading', { name: 'Review your order' })).toBeVisible();

    const storedIds = () =>
      page.evaluate(() => {
        const raw = localStorage.getItem('soko_orders_v1');
        const orders = raw ? (JSON.parse(raw) as Array<{ id: string }>) : [];
        return orders.map((order) => order.id);
      });
    const beforeIds = await storedIds();

    // Two synchronous clicks: one user intent, no idempotency key attached.
    await page.getByRole('button', { name: /Place demo order/ }).evaluate((button) => {
      const element = button as HTMLButtonElement;
      element.click();
      element.click();
    });
    await expect(page).toHaveURL(/\/order-confirmation\/[^/]+$/);
    await expect
      .poll(async () => (await storedIds()).length, { message: 'the double click should be reflected in order storage' })
      .toBeGreaterThan(beforeIds.length);

    const afterIds = await storedIds();
    const appended = afterIds.length - beforeIds.length;
    expect(
      appended,
      'no idempotency key/guard: the double click appended more than one order instead of deduplicating'
    ).toBe(1);

    // Even if the UI happened to swallow the second click, no idempotency mechanism is exposed.
    await page.goto(`${BASE}/checkout`);
    const idempotencyControls = page.getByLabel(/idempotency|request id|order key/i);
    expect(
      await idempotencyControls.count(),
      'no idempotency key/guard: there is no idempotency key field or guard anywhere in checkout'
    ).toBeGreaterThan(0);
  } finally {
    await captureBoth(page, 'idempotent-orders');
  }
});

test('Persistence after reload — required check', async ({ page }) => {
  try {
    const product = await discoverProduct(page);
    await firstProductCard(page).getByRole('button', { name: 'Add to wishlist' }).click();
    await expect(firstProductCard(page).getByRole('button', { name: 'Remove from wishlist' })).toBeVisible();
    await addCardToCart(page);
    const orderId = await completeCheckout(page, 'cash');

    // Seed a cart again because checkout clears it, then verify all four local stores.
    await page.goto(`${BASE}/product/${product.slug}`);
    await expect(page.getByRole('heading', { name: product.title })).toBeVisible();
    await page.locator('#main-content').getByRole('button', { name: 'Add to Cart' }).first().click();
    await expect(page.getByRole('dialog', { name: /^Cart \(1\)$/ })).toBeVisible();

    const stored = await page.evaluate(() => ({
      cart: JSON.parse(localStorage.getItem('soko_cart_v1') ?? '[]') as Array<{ productId: string }>,
      wishlist: JSON.parse(localStorage.getItem('soko_wishlist_v1') ?? '[]') as string[],
      orders: JSON.parse(localStorage.getItem('soko_orders_v1') ?? '[]') as Array<{ id: string }>,
      session: localStorage.getItem('soko_session_v1'),
    }));
    expect(stored.cart.length, 'soko_cart_v1 should be seeded').toBeGreaterThan(0);
    expect(stored.wishlist, 'soko_wishlist_v1 should be seeded').toContain(product.id);
    expect(stored.orders.some((order) => order.id === orderId), 'soko_orders_v1 should contain the new order').toBe(true);
    test.info().annotations.push({
      type: 'persistence',
      description:
        `Seeded soko_cart_v1 (${stored.cart.length} lines), soko_wishlist_v1 (${stored.wishlist.length} ids), ` +
        `soko_orders_v1 (includes ${orderId}); session=${stored.session ?? 'null'} (no server cookie).`,
    });

    await page.goto(`${BASE}/cart`);
    await expect(cartLine(page, product.title)).toBeVisible();
    await page.reload();
    await expect(cartLine(page, product.title), 'cart should persist after reload').toBeVisible();

    await page.goto(`${BASE}/wishlist`);
    await expect(page.locator('article').filter({ hasText: product.title }).first()).toBeVisible();
    await page.reload();
    await expect(page.locator('article').filter({ hasText: product.title }).first(), 'wishlist should persist').toBeVisible();

    await page.goto(`${BASE}/orders`);
    await expect(page.getByText(`Order # ${orderId}`)).toBeVisible();
    await page.reload();
    await expect(page.getByText(`Order # ${orderId}`), 'orders should persist').toBeVisible();

    expect(await page.evaluate(() => localStorage.getItem('soko_session_v1'))).toBe(stored.session);
    expect(await page.evaluate(() => document.cookie)).not.toContain('soko_session');
  } finally {
    await captureBoth(page, 'persistence-reload');
  }
});
