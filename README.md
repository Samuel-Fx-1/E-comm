# Isoko — full-stack marketplace 

Isoko is a marketplace demonstration: a familiar Isoko-style shopping flow with an original brand, built on React 19, Vite 8, TypeScript and Tailwind CSS 4. Phase 4 added a small Express + SQLite catalogue API; Phase 8 expands the Phase 7 shelf to 100 RWF-priced products across five categories. Cart, account, orders, reviews and preferences still live in `localStorage`.

> **Demo only.** All products, sellers, brands, reviews, prices, exchange rates, addresses and payment methods are fictional. No payment is taken, no email is sent, and no data leaves the browser.

## Highlights

- **Brand + storefront** — navy, orange and yellow identity configured in `src/config/site.ts`; sticky two-row header, search with category scoping and instant suggestions, deliver-to modal (14 countries), language (EN/FR) and currency switching, account menu, live cart count, slide-out All menu, dismissible ships-to banner, promo carousel, category grid, deal countdown, product rails, seasonal banner, large footer and back-to-top.
- **Catalogue** — exactly 100 curated products, 20 in each of 5 categories (Tech & Gaming, Streetwear & Footwear, Viral Skincare & Haircare, Lifestyle & Aesthetic Essentials, Gen Alpha & Kids Corner). The client has a filter sidebar (price, rating, brand, stock, deals), sorting, grid/list views and pagination.
- **Licensed images** — 400 real Pexels photos (four per product) are hotlinked directly from `images.pexels.com` at 640×640, with 320/640/1200 responsive paths, photographer credits, `srcset`/`sizes`, priority first row, keyboard lightbox and a `/credits` page. No SVG placeholders are used in product galleries.
- **Merchandising** — `Best Seller`, `Trending`, `Gen Z Pick` and `Viral` labels appear on product cards and product pages. The API exposes best sellers, trending, `gen-z-picks`, `viral` and a flagged-first `featured` feed; the homepage renders matching rails with bundled-data fallbacks.
- **Product detail** — gallery with hover zoom, buy box with delivery estimate, specifications, ratings histogram, review form, Q&A, frequently bought together, related items and recently viewed.
- **Shopping** — cart drawer and full cart page with quantity controls, save-for-later, free-delivery progress, wishlist, recently viewed and compare up to three products side by side.
- **Checkout & account** — 4-step checkout (address → delivery → simulated payment → review), confirmation receipt, orders with status timeline and buy-it-again, account page with saved addresses and payment labels. Sign-in/registration use react-hook-form + zod and a **demo** salted SHA-256 hash in localStorage.
- **Responsive & accessible** — tested layouts at 375 / 768 / 1280 px, mobile bottom tab bar, skip link, focus-trapped modal/drawer, Escape to close, keyboard-visible focus rings, semantic landmarks, reduced-motion support, lazy routes and images, `ImageWithFallback`, SEO via `react-helmet-async`, `robots.txt`, `sitemap.xml` and `vercel.json`.

## Curated catalogue

`data/catalog/*.json` is the single product source. Each file holds 20 validated entries using the standard `makeProduct()` schema (whole RWF prices, four Pexels photos, relevant variants, at least four specs and merchandising flags). `src/data/products/curated.ts` is only a compatibility re-export.

| Category | Category slug | Products | Merchandising-flagged |
| --- | --- | ---: | ---: |
| Tech & Gaming | `tech-gaming` | 20 | 5 |
| Streetwear & Footwear | `streetwear-footwear` | 20 | 6 |
| Viral Skincare & Haircare | `viral-skincare-haircare` | 20 | 7 |
| Lifestyle & Aesthetic Essentials | `lifestyle-aesthetic-essentials` | 20 | 8 |
| Gen Alpha & Kids Corner | `gen-alpha-kids-corner` | 20 | 5 |

Totals: `isBestSeller` 10, `isDeal` 17, `isTrending` 15, `isGenZPick` 9 and `isViral` 13. Some products carry two labels; a product with no badge renders none. `GET /api/products?genZPick=1` and `GET /api/products?viral=1` support direct flag filtering, and `/api/collections/featured` prioritises all four display labels before the unflagged products.

Prices are whole RWF amounts. The single USD→RWF demo rate and the RWF 45,500 free-delivery threshold live in `src/config/site.ts`; no USD price is stored in the catalog.

## Getting started

```bash
npm install --legacy-peer-deps   # repo pins esbuild ^0.25; Vite 8 prefers ^0.27
npm run dev                      # http://localhost:3000
npm run lint                     # tsc --noEmit
npm run build                    # production bundle in dist/
npm run preview                  # serve the production bundle
npm test                         # schema + content + URL validation of all 100 products
npm run validate                 # same validator, used by npm test
npm run images:check             # assert four catalog photos per product; no SVG art
npm run images:fetch:dry         # list catalog Pexels queries without API calls
npm run images:pexels            # primary official Pexels API pipeline (PEXELS_API_KEY in .env.local)
npm run images:repick            # replace only rejected slots, then validate
npm run images:compare           # compare catalog credits with official API cache
npm run images:public            # cache-driven public Pexels fallback selector
npm run test:e2e                 # Playwright smoke + image-review workflow tests
```

Node 20.19+ / 22.12+ is recommended for Vite 8 (Node 22.5+ for the built-in `node:sqlite` API used by the server). `npm test` runs the catalog validator; `npm run test:e2e` runs the Playwright smoke suite.

## Backend / curated catalogue API

The API is a separate Express process that also serves the built SPA. Production clients call `/api` on the **same origin** as the HTML, so no CORS setup is needed; `vite.config.ts` proxies `/api` to the server during `npm run dev`.

```bash
npm run db:seed     # delete all products and insert the 100 curated products
npm run db:seed     # run again to prove the replacement is idempotent
npm run build       # produce dist/ for the Express host
npm run server      # API + client at http://localhost:3001 (PORT overrides)
npm run dev:full    # Vite 3000 + API 3001 together, cross-platform
```

- **Database path** — set `SOKO_DB_PATH` in `.env.local` (copy `.env.local.example`). It defaults to `data/soko.sqlite`, resolved from the repository root. The file and its WAL sidecars are gitignored. `db:seed` is idempotent: every run clears `products` inside a transaction, inserts all 100 curated rows, rebuilds the FTS index once, and asserts the catalog count, 5 categories, no duplicate slugs and no superseded-only slugs (`wireless-charging-desk-mat` and `collagen-hydrogel-under-eye-patches` are deliberately reused by new products).
- **Deployment** — run `npm run server` on a host with a **persistent disk** for the SQLite file; ephemeral/static-only hosting keeps the original client-side demo behaviour but not the shared catalogue. Serve the build from one origin and keep the DB volume across restarts.
- **Images** — every product resolves to four verified Pexels hotlinks mirrored in `data/product-images.json`. The client CSP and server security headers both allow `https://images.pexels.com`. Product IDs and URLs come from the catalog slugs, not from branded display titles.
- **Storage swap** — SQL lives only in `server/db.mjs` behind a repository (`findBySlug`, `findById`, `query`, `meta`, `collections`, `related`, `suggest`). Replacing that layer with MongoDB does not require route changes. Migrations are versioned in `server/migrations/`; FTS5 search falls back to indexed `LIKE` where FTS5 is unavailable.
- **Security skeleton** — `/api` is rate-limited per IP (300 requests/minute), `GET /api/csrf` issues an httpOnly/SameSite=Lax cookie and token for `X-CSRF-Token` on future writes. No authentication or payment processing is implemented.



```bash
npm run images:check          # verify four catalog photos per product
npm run images:pexels:dry     # preview the primary official API selector
npm run images:repick:dry     # preview rejected-slot replacement without API calls
npm run images:public:dry     # preview the key-free cache-driven fallback
```


Run `npm run sitemap` after changing routes or products to refresh `public/sitemap.xml`.


Clearing site data resets everything. Sample orders are seeded so the orders page is never empty; they reference only products in the curated catalogue. Existing browser carts, wishlists and orders keep their stored snapshots even if they mention a product that was removed from the catalogue.


## Deployment

Phase 7 deploys a **single Express service** serving both `dist/` and `/api` from one origin, with SQLite behind a repository layer. Build with `npm run build`, seed with `npm run db:seed`, then run `npm run server`; the host needs a persistent disk for `SOKO_DB_PATH`. `vercel.json` still contains a static-SPA rewrite for the legacy static-only deployment, which keeps the original client-side fallback behaviour when no API is present.

---

Built as a demonstration of a complete marketplace UX; no Isoko assets, names, logos, slogans or code were used.
