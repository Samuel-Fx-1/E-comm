

> All products, sellers, brands, reviews, prices, exchange rates, addresses and payment methods are fictional. No payment is taken, no email is sent, and no data leaves the browser.

## Highlights

- **Brand + storefront** — navy, orange and yellow identity configured in `src/config/site.ts`; sticky two-row header, search with category scoping and instant suggestions, deliver-to modal (14 countries), language (EN/FR) and currency switching, account menu, live cart count, slide-out All menu, dismissible ships-to banner, promo carousel, category grid, deal countdown, product rails, seasonal banner, large footer and back-to-top.
- **Catalogue** — exactly 16 curated products across 5 departments (tech & audio accessories, apparel & footwear, skincare & personal care, home & kitchen, digital products). The client has bundled SVG artwork, filter sidebar (price, rating, brand, stock, deals), sorting, grid/list views and pagination.
- **Licensed images** — one-shot seed script caches Pixabay credits in `data/product-images.json`; responsive `srcset`/`sizes`, blur placeholders, priority first row, keyboard lightbox and a `/credits` page. Pixabay photos are stored locally as WebP; Unsplash photos are hotlinked and attributed, never rehosted.
- **Product detail** — gallery with hover zoom, buy box with delivery estimate, specifications, ratings histogram, review form, Q&A, frequently bought together, related items and recently viewed.
- **Shopping** — cart drawer and full cart page with quantity controls, save-for-later, free-delivery progress, wishlist, recently viewed and compare up to three products side by side.
- **Checkout & account** — 4-step checkout (address → delivery → simulated payment → review), confirmation receipt, orders with status timeline and buy-it-again, account page with saved addresses and payment labels. Sign-in/registration use react-hook-form + zod and a **demo** salted SHA-256 hash in localStorage.
- **Responsive & accessible** — tested layouts at 375 / 768 / 1280 px, mobile bottom tab bar, skip link, focus-trapped modal/drawer, Escape to close, keyboard-visible focus rings, semantic landmarks, reduced-motion support, lazy routes and images, `ImageWithFallback`, SEO via `react-helmet-async`, `robots.txt`, `sitemap.xml` and `vercel.json`.
- **Curated shelf** — the entire catalogue is the curated shelf: real photos, five merchandising groups, eight featured flags, and dedicated "Trending now", "Best sellers" and `/trending` surfaces.

## Curated catalogue

`src/data/products/curated.ts` is the single product source. All 16 entries use the standard `makeProduct()` schema (RWF prices, gallery, variants, specs, ratings, stock and flags) and are grouped by these category slugs:

| Group | Category slug | Products |
| --- | --- | --- |
| Tech & Audio Accessories | `tech-audio-accessories` | Wireless Noise-Canceling Headphones, Bluetooth Neckband Earphones, Foldable Wireless Keyboard, Wireless Charging Desk Mat, Mini Rechargeable Precision Screwdriver Set |
| Apparel & Footwear | `apparel-footwear` | Classic Heavyweight Cotton T-Shirt, Lightweight Everyday Windbreaker Jacket, Casual Low-Top Sneakers |
| Skincare & Personal Care | `skincare-personal-care` | Niacinamide Hydrating Body Lotion, Collagen Hydrogel Under-Eye Patches, Natural Coconut Hair Growth & Repair Oil |
| Home & Kitchen | `home-kitchen` | Nonstick Cookware Set, Portable Handheld Garment Steamer, High-Pressure Filtered Shower Head |
| Digital Products | `digital` | All-in-One Productivity Digital Planner, Professional Photo Editing Presets Bundle |

Eight items are featured: four `isBestSeller` (headphones, cotton tee, body lotion, cookware set) and four `isTrending` (folding keyboard, sneakers, under-eye patches, digital planner). The API exposes them through `GET /api/collections/best-sellers` and `GET /api/collections/trending`; the homepage renders both rails with bundled-data fallbacks when the API is offline. Each product has four credited Pixabay WebP views plus four generated SVG fallbacks; currency formatting uses the same RWF-native fields as the rest of the app. The two digital products use high stock and `deliveryDays: 0` because they are instant downloads.

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

Node 20.19+ / 22.12+ is recommended for Vite 8 (Node 22.5+ for the built-in `node:sqlite` API used by the server).

## Backend / curated catalogue API

The API is a separate Express process that also serves the built SPA. Production clients call `/api` on the **same origin** as the HTML, so no CORS setup is needed; `vite.config.ts` proxies `/api` to the server during `npm run dev`.

```bash
npm run db:seed     # delete all products and insert the 16 curated products
npm run build       # produce dist/ for the Express host
npm run server      # API + client at http://localhost:3001 (PORT overrides)
npm run dev:full    # Vite 3000 + API 3001 together, cross-platform
```


- **Storage swap** — SQL lives only in `server/db.mjs` behind a repository (`findBySlug`, `findById`, `query`, `meta`, `collections`, `related`, `suggest`). Replacing that layer with MongoDB does not require route changes. Migrations are versioned in `server/migrations/`; FTS5 search falls back to indexed `LIKE` where FTS5 is unavailable.
- **Security skeleton** — `/api` is rate-limited per IP (300 requests/minute), `GET /api/csrf` issues an httpOnly/SameSite=Lax cookie and token for `X-CSRF-Token` on future writes. No authentication or payment processing is implemented.

## Project map

| Path | Purpose |
| --- | --- |
| `src/config/site.ts` | Brand name, logo text, palette, countries, FX demo rates, shipping and tax constants |
| `src/types/index.ts` | All domain types, including the five category slugs and `isTrending` |
| `src/data/products/` | Curated catalogue (`curated.ts`) and lookup helpers |
| `src/data/productFactory.ts` | Shared product fields: RWF prices, variants, subcategory, gallery fallbacks |
| `src/data/imageMap.ts` | Single image resolver (override → cached photo → generated art) |
| `data/product-images.json` | Committed one-shot photo cache: source, URL, alt text and credits |
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
| `scripts/seed-database.mjs` | Idempotent 16-product curated seeder |
| `scripts/dev-full.mjs` | Cross-platform Vite + API dev runner |

## Routes

`/`, `/search`, `/category/:slug`, `/product/:slug`, `/cart`, `/checkout`, `/order-confirmation/:id`, `/orders`, `/orders/:id`, `/account`, `/signin`, `/register`, `/wishlist`, `/compare`, `/deals`, `/best-sellers`, `/new-arrivals`, `/trending`, `/customer-service`, `/sell`, `/credits`, `*` (404).

## Branding and markets

Change `site.name`, `logoText`, `logoAccent`, `colors`, `defaultCountry` and `countries` in `src/config/site.ts`. CSS custom properties in `src/index.css` mirror the palette for Tailwind utilities. Every product now carries RWF-native `priceRwf`/`oldPriceRwf` alongside legacy USD aliases for the demo currency switcher.

## Product images

Four SVG fallbacks per product live at `public/images/products/<category>/<slug>-{1..4}.svg` and are generated deterministically:

```bash
npm run images:placeholders   # regenerate local SVG artwork after catalogue changes
```

Real photos are resolved **once**, never at page load:

1. Copy `.env.local.example` → `.env.local` and set `PIXABAY_API_KEY`, `PEXELS_API_KEY` and/or `UNSPLASH_ACCESS_KEY`.
2. Run `npm run images:fetch:pixabay` (or `npm run images:fetch` for Unsplash, `-- --provider pexels` for Pexels). Re-run until every product is cached; finished products are skipped.
3. Optional: put your own photos under `public/products/<slug>/` and list them in `data/image-overrides.json`.

The script is resumable, rate-limit aware, retries throttled requests, records photographer/source/licence/alt text (and Unsplash `download_location`) in `data/product-images.json`, and reports products with no match. Unsplash images are **hotlinked** from `images.unsplash.com` (never downloaded or rehosted). Pixabay and Pexels photos are downloaded once, cropped to 320/640/1200 px WebP with metadata stripped via sharp, and stored under `public/products/<slug>/`; Pixabay forbids permanent hotlinking, so this is required. Downloaded originals are never committed. Pixabay results with recognizable people or brands are filtered out, and every photo is credited with UTM-tagged links on product pages and `/credits`. See `public/images/CREDITS.md` for licence details. **`.env.local` is gitignored; API keys must never be committed.** The supplied Unsplash key was rejected by the API, so Pixabay is the active provider and all 16 curated products have cached real photos.

Run `npm run sitemap` after changing routes or products to refresh `public/sitemap.xml`.

##  data and stored state

| Key (prefix) | Stored in localStorage |
| --- | --- |
| `soko_*` | Cart, saved-for-later, wishlist, compare, recently viewed, reviews, questions, orders |
| `soko_users` / session | Demo accounts, salted SHA-256 password hashes and current session |
| `soko_address_book_v1`, `soko_payment_book_v1` | Saved addresses and payment labels |
| Country, city, currency, language, banner | Market preferences |

Clearing site data resets everything. Sample orders are seeded so the orders page is never empty; they now reference only products in the curated catalogue. Existing browser carts, wishlists and orders keep their stored snapshots even if they mention a product that was removed from the catalogue.

## Known limitations

- The API is read-only catalogue data: there is still no real authentication, payment processor, email, shipping carrier or seller onboarding.
- FX rates, delivery dates, stock levels and reviews are illustrative.
- EN/FR covers the site shell and key controls; long-form marketing copy remains in English.
- Seller/admin tools are intentionally informational; the CSRF endpoint is only a skeleton for future writes.
- No checkout or account records were deleted by the catalogue reset; localStorage snapshots for older demo products may still render in previously stored orders until site data is cleared.

## Deployment

Phase 6 deploys a **single Express service** serving both `dist/` and `/api` from one origin, with SQLite behind a repository layer. Build with `npm run build`, seed with `npm run db:seed`, then run `npm run server`; the host needs a persistent disk for `SOKO_DB_PATH`. `vercel.json` still contains a static-SPA rewrite for the legacy static-only deployment, which keeps the original client-side fallback behaviour when no API is present.

---

Built as a demonstration of a complete marketplace UX; no Isoko assets, names, logos, slogans or code were used.
