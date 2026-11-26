# Changelog

All notable changes to this project are documented here. Each phase is verified with lint, build and available tests before the phase is reported.

## Phase 5 — Curated best sellers and trending catalogue (2026-11-26)

### Added

- `src/data/products/trending.ts`: 16 curated products across five merchandising groups — Tech & Audio Accessories, Apparel & Footwear, Skincare & Personal Care, Home & Kitchen and Digital Products. Each uses the standard `makeProduct()` schema with a short description, bullets, specs, variants, RWF-native prices, stock counts, ratings and four Pixabay gallery views plus SVG fallbacks.
- New `digital` category (`CategorySlug`, category grid, icon, factory defaults, placeholder palette, API validation and SQLite metadata) for the two downloadable products.
- New `isTrending` flag on `Product`/`ProductSeed`, a `trending` collection in the repository and API, and a "Trending now" homepage rail with a `/trending` collection page. Top picks also carry `isBestSeller` and/or `isDeal`, so they appear in the existing best-seller and deals rails. "Trending" badges render on product cards.
- Migration `003_trending.sql` and seeder changes: curated rows are always refreshed, and the newest generated filler rows are retired so the catalogue stays at exactly 1,000,000 products (101 curated + 999,899 generated). Re-running `npm run db:seed` refreshes curated data instead of skipping a complete database.
- Sitemap entries for `/trending`, `/credits` and `/category/digital`; README documentation for the curated shelf.

### Verification

- `npm run lint` — passed.
- `npm run build` — passed (existing chunk-size warning only).
- `npm run images:placeholders` — generated 404 SVG fallbacks for 101 products across 9 categories.
- `npm run images:fetch:pixabay -- --limit 16 --delay 400` — resolved 16/16 new products; all 101 curated products now have four credited WebP views.
- `npm run db:seed` — refreshed 101 curated rows, retired 16 generated rows, rebuilt FTS and kept exactly 1,000,000 rows.
- API smoke test — `/api/health` 1,000,000; `/api/meta` lists 9 categories including `digital`; `/api/collections/trending` returns 16 products; `/api/products?category=digital` returns 2.
- Browser check — `/trending` renders 16 cards, homepage includes the "Trending now" rail, and the product page shows four gallery thumbnails with Pixabay credits; no console errors.

## Phase 4 — Express API and 1M-product catalogue (2026-11-26)

### Added

- `server/index.mjs`: same-origin Express host for the built SPA and a versioned product API with zod validation on every route, per-IP rate limiting (300/min), manual security headers, cookie helpers, a CSRF token endpoint/header skeleton and an exported app for tests.
- `server/db.mjs` plus versioned migrations: SQLite via Node's built-in `node:sqlite` (`DatabaseSync`), configurable `SOKO_DB_PATH`, WAL mode, indexes on category/brand/price/rating/deals/date, external-content FTS5 search with indexed `LIKE` fallback, and a repository boundary (`findBySlug`, `findById`, `query`, `meta`, `collections`, `related`, `suggest`) ready for a MongoDB swap.
- `scripts/seed-database.mjs`: deterministic, resumable seeded-PRNG generator producing exactly 1,000,000 products in batched transactions. All 85 curated products keep their fields and cached Pixabay gallery paths; 999,915 generated products carry numeric-id-suffixed unique slugs and reuse bundled category SVG artwork.
- `scripts/dev-full.mjs`, `db:seed`, `server` and `dev:full` npm scripts; `/api` dev proxy in `vite.config.ts`; gitignored SQLite files; `SOKO_DB_PATH`, `PORT` and `SESSION_SECRET` names in `.env.local.example`.
- README and changelog documentation for seeding, same-origin deployment, persistent-disk requirements, photo provenance and the storage-swap boundary.

### Notes

- The catalogue grew from 85 to 1,000,000 products; only the curated 85 have real Pixabay photos. No framework, authentication or payment behaviour was changed.

## Phase 1 — Product data model and real images (2026-11-26)

### Added

- Extended all 85 products with `name`, `subcategory`, `shortDescription`, `variants`, RWF-native `priceRwf`/`oldPriceRwf` and four gallery paths while keeping legacy aliases for the demo currency switcher.
- Deterministic SVG artwork generator now writes four category-organised views per product; `The Founder's Notebook` is included.
- `scripts/fetch-product-images.mjs`: resumable, rate-limit-aware one-shot image seeder for Unsplash (hotlinked, `download_location` fired), Pexels and Pixabay (sharp WebP 320/640/1200, metadata stripped, locally stored), plus manual overrides. Pixabay filters recognizable people/brands and credits contributors as its API terms require.
- `data/product-images.json` credits cache and `data/image-overrides.json`.
- Single runtime image resolver with responsive `srcset`/`sizes`, explicit dimensions, blur placeholders, generated-art fallback, priority loading, thumbnails, hover zoom and keyboard lightbox.
- `/credits` page with photographer/source/licence links and a list of products still using demo art.
- `.env.local.example`, Content-Security-Policy allowing `images.unsplash.com`, and phase documentation.

### Removed

- Superseded Pixabay fetch script and `.env.example` template.

### Notes

- The supplied `UNSPLASH_ACCESS_KEY` was rejected by the API on the first seed attempt. A Pixabay key was subsequently provided in gitignored `.env.local`; `npm run images:fetch:pixabay` cached four credited WebP views for all 85 products. Unsplash support remains for a future valid key.
