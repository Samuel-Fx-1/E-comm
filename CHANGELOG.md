# Changelog

All notable changes to this project are documented here. Each phase is verified with lint, build and available tests before the phase is reported.

## Phase 8 — 100-product RWF catalog with Pexels photos (2026-11-27)

### Added

- Expanded the catalog to exactly 100 products, 20 per category: Tech & Gaming, Streetwear & Footwear, Viral Skincare & Haircare, Lifestyle & Aesthetic Essentials and Gen Alpha & Kids Corner. The 20 Phase 7 products, five category slugs and existing merchandising flags were preserved; 80 new products use hand-written copy, specific bullets/specs, relevant variants, fictional brands and realistic whole-RWF prices.
- `data/catalog/*.json` is now the single source of truth, schema-validated by `scripts/validate-catalog.mjs` and wired to both `npm test` and `npm run validate`. The validator checks duplicate slugs/names, image reuse/count/URLs/credits, copy length, bullets/specs, repeated sentences, RWF bounds, flag balance, medical/safety claims, brand blocklist and rejected photo IDs.
- Four distinct matching Pexels photos for every product: 400 unique photo IDs and 400 verified CDN URLs. Records include photographer, photographer URL, photo URL, alt text, licence, dimensions and square/portrait filtering. `data/pexels-public-cache.json` stores the captured public Pexels metadata; `data/product-images.json` mirrors the final galleries.
- `scripts/import-pexels-metadata.mjs`, `scripts/fetch-pexels-public.mjs`, `scripts/fetch-pexels-images.mjs`, `data/image-overrides.json`, `data/image-rejects.json` and `/dev/image-review` support resumable, cached, Pexels-only image work. No SVG placeholder, Unsplash, Pixabay or raw/original download enters a gallery.
- `scripts/catalog-additions/` and `scripts/expand-catalog.mjs` hold the reviewed hand-written additions used to build the catalog files.

### Changed

- All catalog prices are whole RWF amounts; `src/config/site.ts` holds the single `1 USD = 1300 RWF` demo rate and the `45,500 RWF` free-delivery threshold. USD fields were removed from the catalog path.
- `makeProduct()` now honours the catalog slug instead of deriving a branded-display-title slug, so product IDs, URLs and image lookups stay aligned. `src/data/products/curated.ts` is a compatibility re-export only.
- The seeder derives its expected count from the catalog instead of hard-coding 20; it is idempotent over all 100 rows and rebuilds FTS once.
- `scripts/generate-sitemap.mjs`, `scripts/fetch-product-images.mjs` and `scripts/generate-placeholders.mjs` now read `data/catalog/*.json`; no source regex scraping remains. The placeholder generator is now a no-art preflight (`npm run images:check`), and the legacy fetch wrapper delegates only to the Pexels pipeline.

### Fixed

- Four lifestyle products were initially skipped while four streetwear query groups were processed twice during public Pexels capture. The missing lifestyle groups were captured specifically and re-imported by query; final capture has 84 groups / 336 candidates, of which 320 unique photos were used.
- Photo `27503500` and photo `15893283` were manually rejected and are blocked by the validator. `data/image-overrides.json` remains empty; no manual replacement was needed.
- Product cards no longer crash on newly added products because hydrated product slugs now match catalog slugs exactly.

### Verification

- `npm run validate` — `Checked 400 unique image URL(s). Validated 100 product(s) across 5 catalog file(s). Catalog validation passed.`
- `npm test` — same validator, passed with the identical output.
- `npm run lint` (`tsc --noEmit`) — passed.
- `npm run build` — passed; Vite emitted the production bundle.
- `npm run db:seed` — `[seed] done: 100 curated products across 5 categories`; repeated run remained idempotent.
- `npx playwright test` — 4 passed (home, category/RWF, product gallery, add-to-cart).
- `npm run sitemap` — wrote 116 URLs from 100 catalog products.
- `npm run images:check` — checked 100 products; all have four catalog photos; no SVG placeholder generated.
- `npm run images:public:dry` — no catalog files written; 0 products added, 33 existing compact cache records enriched.
- Image sources — 400/400 from `images.pexels.com`; 320 new photos captured from public Pexels search metadata plus the original 20-product set; 0 rejected IDs and 0 duplicate URLs used.
- Manual replacements — 2 rejected Pexels IDs (`27503500`, `15893283`), 0 local overrides, 0 synthetic placeholders.

### Notes

- The earlier 85-product catalog remains at `ddd8da1^:src/data/products/*.ts` and `origin/feature/amazon-style-store`; it was not restored. Its removal commits were verified earlier on this branch.
- `PEXELS_API_KEY` is absent from `.env.local`, so the official key-based command was not run successfully. The key-based pipeline remains committed for future runs; this expansion used the committed public Pexels metadata fallback from inside a logged-in browser session.
- No force-push was performed and no secret was committed.

## Phase 7 — Gen Z / Gen Alpha catalogue replacement (2026-11-26)

### Changed

- Replaced the 16-product Phase 6 shelf with exactly 20 curated products across five new categories: Tech & Gaming (5), Streetwear & Footwear (4), Viral Skincare & Haircare (5), Lifestyle & Aesthetic Essentials (3) and Gen Alpha & Kids Corner (3). `src/data/products/curated.ts` remains the single product source.
- Replaced the category slugs, category grid, product factory defaults, promos, review FAQs, sample orders, placeholder palettes, API validation/metadata, sitemap, README and storefront copy. All 20 IDs equal their URL-safe kebab-case slugs.
- Replaced the local Pixabay WebP cache with 20 direct Pexels hotlinks cached in `data/product-images.json`. Added `https://images.pexels.com` to the client CSP and preconnected to that host. Regenerated 80 SVG fallbacks grouped by the new categories and removed the 64 superseded SVGs.
- Ten products are flagged: three `isBestSeller`, three `isTrending`, five `isGenZPick` and two `isViral` (some carry two labels). The other ten are unflagged. Product cards and product-detail headers show all four labels.

### Added

- Migration `004_merchandising_flags.sql` and `Product`/`ProductSeed` fields for `isGenZPick` and `isViral`, with seeder and repository mapping.
- API query filters `genZPick=1` and `viral=1`, plus collection endpoints `/api/collections/gen-z-picks` and `/api/collections/viral`. `featured` now prioritises all four labels before unflagged rows.
- Client routes `/gen-z-picks` and `/viral`, collection pages, homepage Featured/Gen Z/Viral rails, and local fallbacks for each new rail.
- `public/images/CREDITS.md` photographer table for all 20 Pexels photos and `/credits` copy describing the hotlink model.

### Fixed

- Seeder assertions now target 20 products, five categories, no duplicate slugs and no superseded-only slugs. `wireless-charging-desk-mat` and `collagen-hydrogel-under-eye-patches` are deliberately reused by new products with the same titles.
- `GET /api/collections/featured` now uses the same flag-first ordering as the featured product sort, so no unflagged product appears in the first ten.
- Image credits, README, catalog fallback comment and storefront description no longer describe the superseded 16-product catalog.

### Verification

- `npm run lint` — passed.
- `npm run build` — passed.
- `npm run db:seed` — run twice consecutively; both runs reported `20 curated products across 5 categories` with no duplicates, no superseded-only slugs and no leftover rows from the previous catalog.
- Catalog assertions — 20 rows, 5 categories, 0 ID/slug mismatches, 0 non-kebab slugs, 0 duplicate slugs, descriptions 85–103 characters, stock 9–210 with 2 items under 15, ratings 4.3–4.8, review counts 860–10,420.
- Image check — all 20 Pexels hotlinks returned HTTP 200 `image/jpeg` with `curl -sI -L` at the 640×640 template; photo `27256441` had one transient `000` response and re-verified 200 with both HEAD and GET. No Unsplash, `placehold.co` or raw/original download is used in the final catalog.
- API smoke test — `/api/health` total 20; `/api/meta` category counts 5/4/5/3/3; each category endpoint returned its exact count; `?genZPick=1` returned 5 and `?viral=1` returned 2; collections returned best-sellers 3, trending 3, gen-z-picks 5, viral 2 and featured 20 with 0 unflagged items in the first 10; product detail returned the exact `Product` shape with flags and a Pexels image; the old `digital` category returned HTTP 400.
- Browser smoke test — homepage showed 5 category tiles, Featured/Gen Z/Viral rails and merchandising badges; all 5 category routes rendered 5/4/5/3/3 products; `/gen-z-picks` rendered 5, `/viral` rendered 2; product detail showed `BEST SELLER` and `GEN Z PICK`; Pexels image requests returned 200 and no console errors were recorded.
- `npm run sitemap` — wrote 36 URLs. `npm run images:placeholders` — generated 80 SVGs for 20 products across 5 categories.
- `npm test` — unavailable (`Missing script: "test"`); there is no test suite in this repository.

### Notes

- Earlier Unsplash attempts for this catalog returned 404 under the exact hotlink template, and the supplied Unsplash token was rejected by the API. Pexels-only hotlinking was chosen because all selected Pexels photos matched their products and passed header verification.
- No `.env`, API key, token, credential or raw/original image download was committed.
- This phase was committed file by file; see the branch history for per-file reasons.

## Phase 6 — Curated catalogue replacement (2026-11-26)

### Changed

- Replaced the 1,000,000-product catalogue with exactly 16 curated best-selling/trending products. `src/data/products/curated.ts` is now the single product source; the eight legacy category modules, 85 legacy curated products and all generated filler were removed from the bundle, SQLite seed and sitemap.
- Replaced the old category slugs with the five requested groups: `tech-audio-accessories`, `apparel-footwear`, `skincare-personal-care`, `home-kitchen` and `digital`. Updated `CategorySlug`, category grid/icons, product factory defaults, API validation, SQLite metadata, placeholder palettes, promos, reviews, sitemap and docs.
- Eight items are featured: `isBestSeller` on the headphones, cotton tee, body lotion and cookware set; `isTrending` on the folding keyboard, sneakers, under-eye patches and digital planner. The homepage, `/trending` and `/best-sellers` surfaces read those flags from the API with bundled fallbacks.
- `scripts/seed-database.mjs` now clears the products table, inserts all 16 curated rows and rebuilds FTS once on every run; it is idempotent and no longer generates filler. The two digital products use high stock and `deliveryDays: 0` for instant download.
- Demo sample orders were repointed to curated slugs. No user, order, auth or localStorage data was deleted; previously stored snapshots for removed products can still render in old orders until site data is cleared.
- Trimmed `data/product-images.json` to the 16 curated products, removed unused WebP folders, regenerated 64 SVG fallbacks, and refreshed README, image credits and sitemap.

### Verification

- `npm run lint` — passed.
- `npm run build` — passed (existing chunk-size warning only).
- `npm run sitemap` — wrote 30 URLs.
- `npm run images:placeholders` — generated 64 SVG fallbacks for 16 products across 5 categories.
- `npm run db:seed` — replaced 1,000,000 rows with 16 curated rows in 88.2s; a second run replaced 16 rows in 0.1s, confirming idempotency.
- API smoke test — `/api/health` total 16; `/api/meta` lists 5 categories with counts 5/3/3/3/2; `/api/collections/best-sellers` returns 4; `/api/collections/trending` returns 4; `/api/products?category=digital` returns 2; old `electronics` category returns HTTP 400; search and product detail return the exact `Product` shape.
- Image check — all 64 Pixabay WebP URLs and one SVG fallback per category returned HTTP 200.
- Browser check — homepage has 5 category tiles, "Trending now" and "Best sellers" rails; `/trending` renders 4 cards and 4 trending badges; `/category/tech-audio-accessories` renders 5 cards; product page shows 4 gallery thumbnails, Pixabay credit and RWF 117,000; no console errors.
- `npm test` — unavailable (`Missing script: "test"`); no test files exist in the repository.

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
