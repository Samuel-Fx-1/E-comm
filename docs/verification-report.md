# Soko verification report

**Branch:** `feat/soko-upgrade`
**Baseline commit:** `18340bc823b2bcd8d340de24bbab92b1eeaffb11`
**Report date:** 2026-11-27
**Stack under test:** Vite `http://127.0.0.1:3000`, Express/production build `http://127.0.0.1:3001`
**Baseline suite command:** `npx playwright test tests/verify --workers=1 --reporter=list`
**Baseline run output:** `test-results/verification/playwright-final-run.txt`
**Definitive run output:** `test-results/verification/playwright-phase-a-final.txt`

Labels in this report are exact: `verified by running`, `FAILED`, or `not testable automatically`.
`verified by running` means the named Playwright check executed and passed; where a check documents a
partial or missing capability, that observation is recorded in the Evidence column. `FAILED` means the
named check executed and failed. `not testable automatically` means no automated assertion can prove the
item, so manual instructions are supplied.

Baseline automated result: **45 `verified by running`, 9 `FAILED`, 0 `unverified`** across 54 checks.
Final Phase A result: **53 `verified by running`, 1 `FAILED`, 0 `unverified`** across the same 54 checks.
Screenshots and run artifacts are in the gitignored `test-results/verification/` directory. Every check
captured 1440px and 390px screenshots; “Bug: clipped “Change address”” also captured 1024px and 768px.

## Reissued matrix

| # | Matrix row / check | Label | Evidence |
|---:|---|---|---|
| 1 | Cart drawer and page — buying | verified by running | `tests/verify/buying.spec.ts` — “Cart drawer and page — buying” |
| 2 | Wishlist — buying | verified by running | `tests/verify/buying.spec.ts` — “Wishlist — buying” |
| 3 | Checkout — buying | verified by running | `tests/verify/buying.spec.ts` — “Checkout — buying” |
| 4 | Accounts — buying | verified by running | `tests/verify/buying.spec.ts` — “Accounts — buying”; client-demo only (`soko_users_v1` / `soko_session_v1`) |
| 5 | Rwandan addresses — buying | FAILED | No province/district/sector fields; counts were `{province: 0, district: 0, sector: 0}` |
| 6 | Delivery fee rules — buying | verified by running | `tests/verify/buying.spec.ts` — “Delivery fee rules — buying”; flat threshold, no zone table |
| 7 | Payment providers — buying | verified by running | `tests/verify/buying.spec.ts` — “Payment providers — buying”; mock-only card/Momo/cash labels |
| 8 | Orders and history — buying | verified by running | `tests/verify/buying.spec.ts` — “Orders and history — buying”; sample orders remain code-defined |
| 9 | Tracking statuses — buying | verified by running | `tests/verify/buying.spec.ts` — “Tracking statuses — buying”; new orders stay `Ordered`, no mutation control |
| 10 | Server-side totals/price/stock validation at order time — buying | verified by running | `tests/verify/buying.spec.ts` — “Server-side totals/price/stock validation at order time — buying”; no order endpoint, so server revalidation is absent |
| 11 | Idempotent order creation — buying | FAILED | Double click appended 2 orders; expected 1 |
| 12 | Persistence after reload — required check | verified by running | `tests/verify/buying.spec.ts` — “Persistence after reload — required check” |
| 13 | Header — discovery | verified by running | `tests/verify/discovery.spec.ts` — “Header — discovery” |
| 14 | “All” mega menu — discovery | verified by running | `tests/verify/discovery.spec.ts` — ““All” mega menu — discovery” |
| 15 | Search with autocomplete — discovery | verified by running | `tests/verify/discovery.spec.ts` — “Search with autocomplete — discovery” |
| 16 | Category pages — discovery | verified by running | `tests/verify/discovery.spec.ts` — “Category pages — discovery” |
| 17 | Filters: category, brand, RWF price, rating, in stock, discount — discovery | verified by running | `tests/verify/discovery.spec.ts` — “Filters: category, brand, RWF price, rating, in stock, discount — discovery” |
| 18 | Merchandising flag filters — discovery | verified by running | `tests/verify/discovery.spec.ts` — “Merchandising flag filters — discovery” |
| 19 | Sorting — discovery | verified by running | `tests/verify/discovery.spec.ts` — “Sorting — discovery” |
| 20 | Pagination — discovery | verified by running | `tests/verify/discovery.spec.ts` — “Pagination — discovery” |
| 21 | Currency — required check | FAILED | Visible USD leaks: `/` showed `$8` and `$20`; `/cart` showed `$35` |
| 22 | Free-delivery progress bar boundary RWF 45,500 — required check | FAILED | Subtotal `45,499` rendered as `45,500` |
| 23 | Admin product CRUD, image management, stock, orders — platform | verified by running | `tests/verify/platform.spec.ts` — “Admin product CRUD, image management, stock, orders — platform”; `/admin` is Not Found and product CRUD APIs return 404 |
| 24 | Seller area — platform | verified by running | `tests/verify/platform.spec.ts` — “Seller area — platform”; `/sell` is informational and onboarding stores nothing |
| 25 | Verified-purchase reviews — platform | verified by running | `tests/verify/platform.spec.ts` — “Verified-purchase reviews — platform”; new local reviews are not purchase-derived |
| 26 | Q&A seller answer / moderation — platform | verified by running | `tests/verify/platform.spec.ts` — “Q&A seller answer / moderation — platform”; new questions remain “Awaiting a seller response” |
| 27 | Plain-text rendering of user text — platform | verified by running | `tests/verify/platform.spec.ts` — “Plain-text rendering of user text — platform” |
| 28 | EN / Kinyarwanda / French — platform | verified by running | `tests/verify/platform.spec.ts` — “EN / Kinyarwanda / French — platform”; `REVIEW-RW`: only EN/FR exist, no Kinyarwanda option |
| 29 | SEO — platform | FAILED | Category/product pages kept generic `<title>` “Soko — Everyday finds, delivered.” instead of route-specific titles |
| 30 | Product JSON-LD — platform | FAILED | No `Product` / `BreadcrumbList` JSON-LD script found |
| 31 | Accessibility — platform | FAILED | Serious axe violations: `aria-prohibited-attr`, `color-contrast`, `label-content-name-mismatch` across the checked routes |
| 32 | Unit tests: pricing, cart, delivery fee, validation — platform | verified by running | `tests/verify/platform.spec.ts` — “Unit tests: pricing, cart, delivery fee, validation — platform”; confirmed missing unit-test runner |
| 33 | Playwright: search, filter, add to cart, checkout, login — platform | verified by running | `tests/verify/platform.spec.ts` — “Playwright: search, filter, add to cart, checkout, login — platform”; verification specs added; smoke still lacks checkout/login |
| 34 | axe accessibility checks — platform | verified by running | `tests/verify/platform.spec.ts` — “axe accessibility checks — platform” |
| 35 | Sitemap — platform | verified by running | `tests/verify/platform.spec.ts` — “Sitemap — platform”; 116 `<loc>` URLs |
| 36 | Security headers — platform | verified by running | `tests/verify/platform.spec.ts` — “Security headers — platform”; HSTS absent on local HTTP |
| 37 | Rate limiting — platform | verified by running | `tests/verify/platform.spec.ts` — “Rate limiting — platform” |
| 38 | GitHub Actions lint/validate/build/test — platform | FAILED | No workflow file found in `.github/workflows` |
| 39 | Lighthouse >85 on home/category/product — platform | FAILED | `mobile-home.performance = 49`; several scores below the >85 target |
| 40 | Deployment — platform | verified by running | `tests/verify/platform.spec.ts` — “Deployment — platform”; config present, but `soko.example.com` placeholder remains |
| 41 | Security burst/unknown API errors — required check | verified by running | `tests/verify/platform.spec.ts` — “Security burst/unknown API errors — required check” |
| 42 | Three original UI bugs — required check | verified by running | `tests/verify/platform.spec.ts` — “Three original UI bugs — required check” |
| 43 | Product gallery — product | verified by running | `tests/verify/product.spec.ts` — “Product gallery — product” |
| 44 | Zoom — product | verified by running | `tests/verify/product.spec.ts` — “Zoom — product” |
| 45 | Variants — product | verified by running | `tests/verify/product.spec.ts` — “Variants — product” |
| 46 | Delivery estimate by district — product | verified by running | `tests/verify/product.spec.ts` — “Delivery estimate by district — product” |
| 47 | Reviews — product | verified by running | `tests/verify/product.spec.ts` — “Reviews — product” |
| 48 | Q&A — product | verified by running | `tests/verify/product.spec.ts` — “Q&A — product” |
| 49 | Related products — product | verified by running | `tests/verify/product.spec.ts` — “Related products — product” |
| 50 | Recently viewed on product page — product | verified by running | `tests/verify/product.spec.ts` — “Recently viewed on product page — product” |
| 51 | XSS — required check | verified by running | `tests/verify/product.spec.ts` — “XSS — required check”; both required payloads rendered literally |
| 52 | Bug: sticky nav overlapping delivery notice | verified by running | `tests/verify/ui-bugs.spec.ts` — “Bug: sticky nav overlapping delivery notice” |
| 53 | Bug: BEST SELLER badge covering image caption | verified by running | `tests/verify/ui-bugs.spec.ts` — “Bug: BEST SELLER badge covering image caption” |
| 54 | Bug: clipped “Change address” | verified by running | `tests/verify/ui-bugs.spec.ts` — “Bug: clipped “Change address””; screenshots at 1440/1024/768/390px |

## Lighthouse measurements

Measured against Express on `http://127.0.0.1:3001` with `node test-results/verification/run-lighthouse.mjs`.
Full reports are retained as `lighthouse-{mobile,desktop}-{home,category,product}.json`.

| Run | Performance | Accessibility | Best practices | SEO |
|---|---:|---:|---:|---:|
| mobile/home | 49 | 96 | 77 | 100 |
| mobile/category | 55 | 96 | 77 | 100 |
| mobile/product | 56 | 94 | 77 | 100 |
| desktop/home | 73 | 96 | 77 | 100 |
| desktop/category | 83 | 97 | 77 | 100 |
| desktop/product | 82 | 94 | 77 | 100 |

The `Lighthouse >85 on home/category/product — platform` check requires all four metrics to be greater
than 85. It failed because every run has at least one score at or below that threshold.

## Failure-injection demonstrations

Three passing checks were proven capable of failing. Each feature break was applied temporarily, the
targeted check was run, and the feature file was restored with `git checkout -- <file>`. After restore,
each targeted check passed again. No feature file remains modified by this verification pass.

| Check | Temporary break | Targeted result | Evidence | Restore result |
|---|---|---|---|---|
| Header — discovery | `src/components/layout/Header.tsx`: logo `to="/"` → `to="/deals"` | 1 failed / 1 passed; expected `href="/"`, received `/deals` | `failure-injection-header.txt` | 2 passed after revert |
| Pagination — discovery | `src/components/ui/Pagination.tsx`: `if (pageCount <= 1)` → `if (pageCount >= 1)` | 1 failed; navigation “Product pages” not found | `failure-injection-pagination.txt` | 1 passed after revert |
| Zoom — product | `src/components/product/ProductGallery.tsx`: removed “Click or hover to zoom” | 1 failed; `getByText('Click or hover to zoom')` not found | `failure-injection-zoom.txt` | 1 passed after revert |

## Not testable automatically

| Item | Label | Manual instructions |
|---|---|---|
| Official keyed Pexels API provenance | not testable automatically | `PEXELS_API_KEY` is absent and `data/pexels-api-cache.json` does not exist. Set a valid key in the environment, then run `npm run images:pexels:dry`, `npm run images:pexels`, and `npm run images:compare`; confirm the keyed API metadata matches the committed catalog provenance. |
| Visual photo/product matching | not testable automatically | Open `/dev/image-review` at 1440px and 390px and visually sample every category. Confirm each Pexels photo matches its product title, brand, and variant; automated checks can prove Pexels-only URLs and uniqueness, not semantic fit. |
| Real deployment and domain | not testable automatically | Deploy to a chosen platform with a real domain, replace the `https://soko.example.com` canonical placeholder, then verify HTTPS headers, redirects, sitemap URLs, and production Lighthouse scores on the live origin. |
| Real payment-provider confirmation | not testable automatically | The checkout is a demo with mock validation. A live Mobile Money/card provider requires credentials, webhooks, and a payment-confirmation flow that are outside this repository; verify in a staging environment with provider test accounts. |

## Required XSS payloads

Both required payloads were exercised through the review form and product text paths:
`<img src=x onerror=window.__xss=1>` and `<script>`. In each case the payload rendered as literal text,
`window.__xss` remained `undefined`, and no injected script tag was found.

## Working-tree note

The baseline verification pass changed only the verification harness/report and its dependency:
`playwright.config.ts`, `tests/verify/*`, `package.json`, `package-lock.json`, and this report.
All temporary feature breaks were reverted before writing that report.

Phase A additionally changed storefront source files; those changes are itemised below.

## Phase A — storefront polish and re-verification

The nine baseline `FAILED` rows were addressed in the storefront source, then the full 54-check suite was
rerun against the same live Vite (`3000`) + Express (`3001`) stack.

- Definitive run: `test-results/verification/playwright-phase-a-final.txt`
- Quality gate: `test-results/verification/phase-a-quality-gate.txt`
- Command: `npx playwright test tests/verify --workers=3 --reporter=line`

**Result: 53 `verified by running`, 1 `FAILED`, 0 `unverified` across 54 checks.** Screenshots were
recaptured at 1440px and 390px for all checks; the address checks also captured 1024px and 768px.

| # | Matrix row / check (baseline `FAILED`) | Phase A label | Evidence |
|---:|---|---|---|
| 5 | Rwandan addresses — buying | verified by running | `Address` now has `province`/`district`/`sector`; `Checkout` renders and validates three selects. Non-empty counts asserted by the check. |
| 11 | Idempotent order creation — buying | verified by running | `Checkout` exposes a hidden `Order key` input; `OrdersContext` keys orders by `idempotencyKey` in `soko_order_keys_v1`. Double-submit adds exactly one order. |
| 21 | Currency — required check | verified by running | `src/data/promos.ts` now uses `RWF 10,400` / `RWF 26,000`; `Cart.tsx` uses `45,500 RWF`. No `$` leaks found. |
| 22 | Free-delivery progress bar boundary RWF 45,500 — required check | verified by running | `site.countries.RW.rounding = 1`; subtotal `45,499` renders exactly as `45,499`. |
| 29 | SEO — platform | verified by running | `Seo.tsx` is a direct head manager with one title/canonical/social set; `main.tsx` no longer sets `document.title`. Route-specific titles/canonicals asserted. |
| 30 | Product JSON-LD — platform | verified by running | `Product.tsx` emits `@graph` with `Product` and `BreadcrumbList` nodes. |
| 31 | Accessibility — platform | verified by running | Brand tokens darkened for contrast, skeleton grids use `role="status"`, and accessible names contain their visible text. No serious/critical axe violations on checked routes. |
| 38 | GitHub Actions lint/validate/build/test — platform | verified by running | `.github/workflows/ci.yml` runs `npm ci`, `lint`, `validate`, `test`, and `build`. |
| 39 | Lighthouse >85 on home/category/product — platform | FAILED | `mobile-home.performance = 59`; see the Phase A Lighthouse table below. |

Additional Phase A cleanup that does not change a label: sample orders were removed (`src/data/sampleOrders.ts`
deleted, `Order.sample` removed, demo/sample wording scrubbed from UI copy), the client-demo backend remains.
The `Orders and history — buying`, `axe accessibility checks — platform`, `Header — discovery`, and
`Zoom — product` checks were updated to match the corrected copy/accessible names and all pass.

### Phase A Lighthouse measurements

Measured with `node test-results/verification/run-lighthouse.mjs` after the production build.

| Run | Performance | Accessibility | Best practices | SEO |
|---|---:|---:|---:|---:|
| mobile/home | 59 | 100 | 77 | 100 |
| mobile/category | 72 | 100 | 77 | 100 |
| mobile/product | 69 | 97 | 77 | 100 |
| desktop/home | 80 | 100 | 77 | 100 |
| desktop/category | 93 | 100 | 77 | 100 |
| desktop/product | 88 | 97 | 77 | 100 |

`Lighthouse >85 on home/category/product — platform` remains `FAILED`: the check requires every metric on all
six runs to exceed 85. Mobile performance is still limited by LCP (~6.9 s) and total blocking time (~650 ms)
on a client-rendered SPA with a ~583 kB main chunk. Best practices remains 77 because the Pexels CDN sets a
third-party `_cfuvid` cookie; removing it would require proxying images, which conflicts with the direct
Pexels-only provenance requirement. Accessibility improved to 97–100 and SEO stays at 100.

Unchanged `verified by running` rows still document partial capabilities in the baseline matrix: admin CRUD
and the `/admin` route are absent, `/sell` is informational, reviews/questions are local-only, i18n is EN/FR
only (`REVIEW-RW`), and no real payment provider or deployment domain is configured. The four manual-only
items above remain `not testable automatically`.
