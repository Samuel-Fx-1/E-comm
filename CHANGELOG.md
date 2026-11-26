# Changelog

All notable changes to this project are documented here. Each phase is verified with lint, build and available tests before the phase is reported.

## Phase 1 — Product data model and real images (2026-11-26)

### Added

- Extended all 85 products with `name`, `subcategory`, `shortDescription`, `variants`, RWF-native `priceRwf`/`oldPriceRwf` and four gallery paths while keeping legacy aliases for the demo currency switcher.
- Deterministic SVG artwork generator now writes four category-organised views per product; `The Founder's Notebook` is included.
- `scripts/fetch-product-images.mjs`: resumable, rate-limit-aware one-shot image seeder for Unsplash (hotlinked, `download_location` fired) and Pexels (sharp WebP 320/640/1200, metadata stripped), plus manual overrides.
- `data/product-images.json` credits cache and `data/image-overrides.json`.
- Single runtime image resolver with responsive `srcset`/`sizes`, explicit dimensions, blur placeholders, generated-art fallback, priority loading, thumbnails, hover zoom and keyboard lightbox.
- `/credits` page with photographer/source/licence links and a list of products still using demo art.
- `.env.local.example`, Content-Security-Policy allowing `images.unsplash.com`, and phase documentation.

### Removed

- Superseded Pixabay fetch script and `.env.example` template.

### Notes

- The supplied `UNSPLASH_ACCESS_KEY` was rejected by the API on the first seed attempt; no photos were cached. Re-run `npm run images:fetch` after replacing the key.
