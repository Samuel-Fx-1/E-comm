# Soko —style marketplace 

Soko is a front-end marketplace demonstration: a familiar big-box shopping flow with an original brand, built on React 19, Vite 8, TypeScript and Tailwind CSS 4. There is **no backend**: the catalogue is typed mock data, and cart, account, orders, reviews and preferences live in `localStorage`.

> **Demo only.** All products, sellers, brands, reviews, prices, exchange rates, addresses and payment methods are fictional. No payment is taken, no email is sent, and no data leaves the browser.

## Highlights

- **Brand + storefront** — navy, orange and yellow identity configured in `src/config/site.ts`; sticky two-row header, search with category scoping and instant suggestions, deliver-to modal (14 countries), language (EN/FR) and currency switching, account menu, live cart count, slide-out All menu, dismissible ships-to banner, promo carousel, category grid, deal countdown, product rails, seasonal banner, large footer and back-to-top.
- **Catalogue** — 85 products across 8 departments (electronics, home & kitchen, fashion, beauty, sports, books, toys, groceries), with 340 bundled SVG fallbacks, filter sidebar (price, rating, brand, stock, deals), sorting, grid/list views, pagination, loading skeletons and no-results states.
- **Licensed images** — one-shot seed script caches Unsplash/Pexels credits in `data/product-images.json`; responsive `srcset`/`sizes`, blur placeholders, priority first row, keyboard lightbox and a `/credits` page. Unsplash photos are hotlinked and attributed, never rehosted.
- **Product detail** — gallery with hover zoom, buy box with delivery estimate, specifications, ratings histogram, review form, Q&A, frequently bought together, related items and recently viewed.
- **Shopping** — cart drawer and full cart page with quantity controls, save-for-later, free-delivery progress, wishlist, recently viewed and compare up to three products side by side.
- **Checkout & account** — 4-step checkout (address → delivery → simulated payment → review), confirmation receipt, orders with status timeline and buy-it-again, account page with saved addresses and payment labels. Sign-in/registration use react-hook-form + zod and a **demo** salted SHA-256 hash in localStorage.
- **Responsive & accessible** — tested layouts at 375 / 768 / 1280 px, mobile bottom tab bar, skip link, focus-trapped modal/drawer, Escape to close, keyboard-visible focus rings, semantic landmarks, reduced-motion support, lazy routes and images, `ImageWithFallback`, SEO via `react-helmet-async`, `robots.txt`, `sitemap.xml` and `vercel.json`.

## Getting started

```bash
npm install --legacy-peer-deps   # repo pins esbuild ^0.25; Vite 8 prefers ^0.27
npm run dev                      # http://localhost:3000
npm run lint                     # tsc --noEmit
npm run build                    # production bundle in dist/
npm run preview                  # serve the production bundle
npm run images:placeholders      # regenerate bundled SVG artwork
npm run images:fetch:dry         # list image search queries without API calls
npm run images:fetch             # resolve photos once into data/product-images.json
```

Node 20.19+ / 22.12+ is recommended for Vite 8.

## Project map

| Path | Purpose |
| --- | --- |
| `src/config/site.ts` | Brand name, logo text, palette, countries, FX demo rates, shipping and tax constants |
| `src/types/index.ts` | All domain types |
| `src/data/products/` | Eight typed product catalogues and lookup helpers |
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

## Routes

`/`, `/search`, `/category/:slug`, `/product/:slug`, `/cart`, `/checkout`, `/order-confirmation/:id`, `/orders`, `/orders/:id`, `/account`, `/signin`, `/register`, `/wishlist`, `/compare`, `/deals`, `/best-sellers`, `/new-arrivals`, `/customer-service`, `/sell`, `/credits`, `*` (404).

## Branding and markets

Change `site.name`, `logoText`, `logoAccent`, `colors`, `defaultCountry` and `countries` in `src/config/site.ts`. CSS custom properties in `src/index.css` mirror the palette for Tailwind utilities. Every product now carries RWF-native `priceRwf`/`oldPriceRwf` alongside legacy USD aliases for the demo currency switcher.

## Product images

Four SVG fallbacks per product live at `public/images/products/<category>/<slug>-{1..4}.svg` and are generated deterministically:

```bash
npm run images:placeholders   # regenerate local SVG artwork after catalogue changes
```

Real photos are resolved **once**, never at page load:

1. Copy `.env.local.example` → `.env.local` and set `UNSPLASH_ACCESS_KEY` (preferred) or `PEXELS_API_KEY`.
2. Run `npm run images:fetch -- --limit 25`. Re-run until every product is cached; finished products are skipped.
3. Optional: put your own photos under `public/products/<slug>/` and list them in `data/image-overrides.json`.

The script is resumable, rate-limit aware, retries throttled requests, records photographer/source/licence/alt text/`download_location` in `data/product-images.json`, and reports products with no match. Unsplash images are **hotlinked** from `images.unsplash.com` (never downloaded or rehosted), with UTM-attributed links on product pages and `/credits`. Pexels images and overrides are resized to 320/640/1200 px WebP with metadata stripped via sharp; originals are gitignored. See `public/images/CREDITS.md` for licence details. **`.env.local` is gitignored; secret keys must never be committed.** The first seed attempt with the supplied key was rejected by Unsplash, so all 85 products currently fall back to generated artwork.

Run `npm run sitemap` after changing routes or products to refresh `public/sitemap.xml`.

## Demo data and stored state

| Key (prefix) | Stored in localStorage |
| --- | --- |
| `soko_*` | Cart, saved-for-later, wishlist, compare, recently viewed, reviews, questions, orders |
| `soko_users` / session | Demo accounts, salted SHA-256 password hashes and current session |
| `soko_address_book_v1`, `soko_payment_book_v1` | Saved addresses and payment labels |
| Country, city, currency, language, banner | Market preferences |

Clearing site data resets everything. Sample orders are seeded so the orders page is never empty.

## Known limitations

- No server, database, real authentication, payment processor, email, shipping carrier or seller onboarding.
- FX rates, delivery dates, stock levels and reviews are illustrative.
- EN/FR covers the site shell and key controls; long-form marketing copy remains in English.
- Seller/admin tools are intentionally informational because no backend exists.

## Deployment

The current demo is a static SPA: `vercel.json` includes a rewrite so deep links resolve to `index.html`. Build with `npm run build` and publish `dist/`. The approved Phase 4 design is a **single Express service** serving both `dist/` and the API from one origin, with SQLite behind a repository layer; that host will need a persistent disk and a configurable DB path. Static-only deployment would keep the current client-side demo behaviour.

---

Built as a demonstration of a complete marketplace UX; no Amazon assets, names, logos, slogans or code were used.
