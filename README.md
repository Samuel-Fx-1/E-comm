# Soko — full-stack marketplace demo

Soko is a marketplace demonstration: a familiar Isoko-style shopping flow with an original brand, built on React 19, Vite 8, TypeScript and Tailwind CSS 4. Phase 4 added a small Express + SQLite catalogue API; Phase 7 replaces the curated shelf with 20 Gen Z / Gen Alpha products across five new categories. Cart, account, orders, reviews and preferences still live in `localStorage`.

> **Demo only.** All products, sellers, brands, reviews, prices, exchange rates, addresses and payment methods are fictional. No payment is taken, no email is sent, and no data leaves the browser.

## Highlights

- **Brand + storefront** — navy, orange and yellow identity configured in `src/config/site.ts`; sticky two-row header, search with category scoping and instant suggestions, deliver-to modal (14 countries), language (EN/FR) and currency switching, account menu, live cart count, slide-out All menu, dismissible ships-to banner, promo carousel, category grid, deal countdown, product rails, seasonal banner, large footer and back-to-top.
- **Catalogue** — exactly 20 curated products across 5 categories (Tech & Gaming, Streetwear & Footwear, Viral Skincare & Haircare, Lifestyle & Aesthetic Essentials, Gen Alpha & Kids Corner). The client has bundled SVG artwork, filter sidebar (price, rating, brand, stock, deals), sorting, grid/list views and pagination.
- **Licensed images** — 20 Pexels photos are hotlinked directly from `images.pexels.com` at 640×640, with 320/640/1200 responsive paths, credits, `srcset`/`sizes`, blur placeholders, priority first row, keyboard lightbox and a `/credits` page. Generated SVG artwork is the fallback.
- **Merchandising** — `Best Seller`, `Trending`, `Gen Z Pick` and `Viral` labels appear on product cards and product pages. The API exposes best sellers, trending, `gen-z-picks`, `viral` and a flagged-first `featured` feed; the homepage renders matching rails with bundled-data fallbacks.
- **Product detail** — gallery with hover zoom, buy box with delivery estimate, specifications, ratings histogram, review form, Q&A, frequently bought together, related items and recently viewed.
- **Shopping** — cart drawer and full cart page with quantity controls, save-for-later, free-delivery progress, wishlist, recently viewed and compare up to three products side by side.
- **Checkout & account** — 4-step checkout (address → delivery → simulated payment → review), confirmation receipt, orders with status timeline and buy-it-again, account page with saved addresses and payment labels. Sign-in/registration use react-hook-form + zod and a **demo** salted SHA-256 hash in localStorage.
- **Responsive & accessible** — tested layouts at 375 / 768 / 1280 px, mobile bottom tab bar, skip link, focus-trapped modal/drawer, Escape to close, keyboard-visible focus rings, semantic landmarks, reduced-motion support, lazy routes and images, `ImageWithFallback`, SEO via `react-helmet-async`, `robots.txt`, `sitemap.xml` and `vercel.json`.

## Curated catalogue

`src/data/products/curated.ts` is the single product source. All 20 entries use the standard `makeProduct()` schema (whole RWF prices, gallery, variants, specs, ratings, stock and flags) and are grouped by these category slugs:

| Category | Category slug | Products |
| --- | --- | --- |
| Tech & Gaming | `tech-gaming` | Wireless Noise-Canceling Over-Ear Headphones; Low-Latency Gaming Wireless Earbuds; Compact Mechanical Hall-Effect Keyboard; RGB Smart LED Room Strip Lights; Wireless Charging Desk Mat |
| Streetwear & Footwear | `streetwear-footwear` | Heavyweight Oversized Graphic T-Shirt; Baggy Barrel-Fit Cargo Jeans; High-Waisted Fold-Over Athleisure Leggings; Retro Low-Top Chunky Sneakers |
| Viral Skincare & Haircare | `viral-skincare-haircare` | Hydrocolloid Star Pimple Patches (36 Count); Niacinamide Brightening & Hydrating Body Lotion; Collagen Hydrogel Under-Eye Patches; Silicone Scalp Massager & Hair Growth Brush; Satin Sleep Bonnet & Scrunchie Set |
| Lifestyle & Aesthetic Essentials | `lifestyle-aesthetic-essentials` | Insulated Stainless Steel Flip-Straw Water Bottle (32oz); Quilted Puffer Makeup & Tech Organizer Bag; Portable USB-C Mini Smoothie Blender |
| Gen Alpha & Kids Corner | `gen-alpha-kids-corner` | Interactive STEM Robotics Building Kit; Ergonomic Aesthetic School Backpack with Pins; Kids Digital Instant Print Camera |

Ten products carry merchandising flags; the other ten are intentionally unflagged (three in Tech & Gaming, two in Streetwear & Footwear, one in Viral Skincare & Haircare, two in Lifestyle & Aesthetic Essentials and two in Gen Alpha & Kids Corner):

| Flag | Products |
| --- | --- |
| `isBestSeller` | Wireless Noise-Canceling Over-Ear Headphones, Heavyweight Oversized Graphic T-Shirt, Niacinamide Brightening & Hydrating Body Lotion |
| `isTrending` | Retro Low-Top Chunky Sneakers, Collagen Hydrogel Under-Eye Patches, Insulated Stainless Steel Flip-Straw Water Bottle (32oz) |
| `isGenZPick` | Wireless Noise-Canceling Over-Ear Headphones, Compact Mechanical Hall-Effect Keyboard, Retro Low-Top Chunky Sneakers, Satin Sleep Bonnet & Scrunchie Set, Interactive STEM Robotics Building Kit |
| `isViral` | Hydrocolloid Star Pimple Patches (36 Count), Collagen Hydrogel Under-Eye Patches |

Some products carry two labels; a product with no flag renders no badge. `GET /api/products?genZPick=1` and `GET /api/products?viral=1` support direct flag filtering, and `/api/collections/featured` prioritises all four labels before the unflagged products.

## Getting started

```bash
npm install --legacy-peer-deps   # repo pins esbuild ^0.25; Vite 8 prefers ^0.27
npm run dev                      # http://localhost:3000
npm run lint                     # tsc --noEmit
npm run build                    # production bundle in dist/
npm run preview                  # serve the production bundle
npm run images:placeholders      # regenerate bundled SVG artwork
npm run images:fetch:dry         # list image search queries without API calls
npm run images:fetch             # resolve Unsplash photos once into data/product-images.json
npm run images:fetch:pixabay     # resolve Pixabay photos once (stored locally as WebP)
```

Node 20.19+ / 22.12+ is recommended for Vite 8 (Node 22.5+ for the built-in `node:sqlite` API used by the server). There is no `npm test` script and no test suite in this repository; verification uses lint, type checking, build, seed assertions and API/browser smoke checks.

## Backend / curated catalogue API

The API is a separate Express process that also serves the built SPA. Production clients call `/api` on the **same origin** as the HTML, so no CORS setup is needed; `vite.config.ts` proxies `/api` to the server during `npm run dev`.

```bash
npm run db:seed     # delete all products and insert the 20 curated products
npm run db:seed     # run again to prove the replacement is idempotent
npm run build       # produce dist/ for the Express host
npm run server      # API + client at http://localhost:3001 (PORT overrides)
npm run dev:full    # Vite 3000 + API 3001 together, cross-platform
```

- **Database path** — set `SOKO_DB_PATH` in `.env.local` (copy `.env.local.example`). It defaults to `data/soko.sqlite`, resolved from the repository root. The file and its WAL sidecars are gitignored. `db:seed` is idempotent: every run clears `products` inside a transaction, inserts all 20 curated rows, rebuilds the FTS index once, and asserts 20 products, 5 categories, no duplicate slugs and no superseded-only slugs (`wireless-charging-desk-mat` and `collagen-hydrogel-under-eye-patches` are deliberately reused by new products).
- **Deployment** — run `npm run server` on a host with a **persistent disk** for the SQLite file; ephemeral/static-only hosting keeps the original client-side demo behaviour but not the shared catalogue. Serve the build from one origin and keep the DB volume across restarts.
- **Images** — every product resolves to a verified Pexels hotlink in `data/product-images.json`; bundled category SVG artwork lives under `public/images/products/<category>/` as a fallback. The client CSP and server security headers both allow `https://images.pexels.com`. Slugs are the URL-safe titles, so IDs and URLs match.
- **Storage swap** — SQL lives only in `server/db.mjs` behind a repository (`findBySlug`, `findById`, `query`, `meta`, `collections`, `related`, `suggest`). Replacing that layer with MongoDB does not require route changes. Migrations are versioned in `server/migrations/`; FTS5 search falls back to indexed `LIKE` where FTS5 is unavailable.
- **Security skeleton** — `/api` is rate-limited per IP (300 requests/minute), `GET /api/csrf` issues an httpOnly/SameSite=Lax cookie and token for `X-CSRF-Token` on future writes. No authentication or payment processing is implemented.

## Project map

| Path | Purpose |
| --- | --- |
| `src/config/site.ts` | Brand name, logo text, palette, countries, FX demo rates, shipping and tax constants |
| `src/types/index.ts` | All domain types, including the five category slugs and four merchandising flags |
| `src/data/products/` | Curated catalogue (`curated.ts`) and lookup helpers |
| `src/data/productFactory.ts` | Shared product fields: RWF prices, variants, subcategory, gallery fallbacks |
| `src/data/imageMap.ts` | Single image resolver (override → cached photo → generated art) |
| `data/product-images.json` | Committed Pexels hotlink cache: source, URL, alt text and credits |
| `data/image-overrides.json` | Your own local photos, highest priority |
| `src/data/{reviews,sampleOrders,promos,categories}.ts` | Supporting demo data |
| `src/lib/` | Formatting, currency, search/filter, storage, hashing, i18n and hooks |
| `src/context/` | Toast, Site, Auth, Orders and Store providers |
| `src/components/layout/` | Header, navigation, drawers, modals, footer and mobile tabs |
| `src/components/ui/` | Reusable UI primitives |
| `src/components/product/` | Product cards, gallery, reviews and bundles |
| `src/pages/` | Route-level screens |
| `server/index.mjs` | Express API, static SPA host, validation, rate limiting and CSRF skeleton |
| `server/db.mjs` | Swappable repository layer, migrations runner and FTS/LIKE search |
| `server/migrations/` | Versioned SQLite schema migrations |
| `scripts/seed-database.mjs` | Idempotent 20-product curated seeder with catalog assertions |
| `scripts/dev-full.mjs` | Cross-platform Vite + API dev runner |

## Routes

`/`, `/search`, `/category/:slug`, `/product/:slug`, `/cart`, `/checkout`, `/order-confirmation/:id`, `/orders`, `/orders/:id`, `/account`, `/signin`, `/register`, `/wishlist`, `/compare`, `/deals`, `/best-sellers`, `/new-arrivals`, `/trending`, `/gen-z-picks`, `/viral`, `/customer-service`, `/sell`, `/credits`, `*` (404).

## Branding and markets

Change `site.name`, `logoText`, `logoAccent`, `colors`, `defaultCountry`, `rwfPerUsd`, `freeDeliveryThresholdRwf` and `countries` in `src/config/site.ts`. CSS custom properties in `src/index.css` mirror the palette for Tailwind utilities. Every product stores whole RWF amounts in `price`/`listPrice` and the equivalent `priceRwf`/`oldPriceRwf` aliases; the demo currency switcher converts from RWF using the single configured rate.

## Product images

Four SVG fallbacks per product live at `public/images/products/<category>/<slug>-{1..4}.svg` and are generated deterministically:

```bash
npm run images:placeholders   # regenerate local SVG artwork after catalogue changes
```

The final catalog uses direct Pexels hotlinks cached in `data/product-images.json`:

```bash
curl -sI -L "https://images.pexels.com/photos/210927/pexels-photo-210927.jpeg?auto=compress&cs=tinysrgb&w=640&h=640&fit=crop"
```

Every cached URL was checked for HTTP 200 and `image/jpeg`. The same 320/640/1200 square template is used for consistency; no original or downloaded image is committed. Unsplash, Pixabay and Pexels fetch scripts remain available for future catalog changes, but this catalog has no `placehold.co` entries and no local WebP cache. `data/image-overrides.json` is empty. See `public/images/CREDITS.md` for the photographer list and licence details. **`.env.local` is gitignored; API keys must never be committed.**

Run `npm run sitemap` after changing routes or products to refresh `public/sitemap.xml`.

##  data and stored state

| Key (prefix) | Stored in localStorage |
| --- | --- |
| `soko_*` | Cart, saved-for-later, wishlist, compare, recently viewed, reviews, questions, orders |
| `soko_users` / session | Demo accounts, salted SHA-256 password hashes and current session |
| `soko_address_book_v1`, `soko_payment_book_v1` | Saved addresses and payment labels |
| Country, city, currency, language, banner | Market preferences |

Clearing site data resets everything. Sample orders are seeded so the orders page is never empty; they reference only products in the curated catalogue. Existing browser carts, wishlists and orders keep their stored snapshots even if they mention a product that was removed from the catalogue.

## Known limitations

- The API is read-only catalogue data: there is still no real authentication, payment processor, email, shipping carrier or seller onboarding.
- FX rates, delivery dates, stock levels and reviews are illustrative.
- EN/FR covers the site shell and key controls; long-form marketing copy remains in English.
- Seller/admin tools are intentionally informational; the CSRF endpoint is only a skeleton for future writes.
- No checkout or account records were deleted by the catalogue reset; localStorage snapshots for older demo products may still render in previously stored orders until site data is cleared.

## Deployment

Phase 7 deploys a **single Express service** serving both `dist/` and `/api` from one origin, with SQLite behind a repository layer. Build with `npm run build`, seed with `npm run db:seed`, then run `npm run server`; the host needs a persistent disk for `SOKO_DB_PATH`. `vercel.json` still contains a static-SPA rewrite for the legacy static-only deployment, which keeps the original client-side fallback behaviour when no API is present.

---

Built as a demonstration of a complete marketplace UX; no Isoko assets, names, logos, slogans or code were used.
