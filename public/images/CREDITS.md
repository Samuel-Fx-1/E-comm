# Image credits

## Bundled artwork

All product images currently shipped by this branch are **generated locally** by
`scripts/generate-placeholders.mjs`. They are original, deterministic SVG
compositions and carry no third-party photo license requirements.

- `public/images/products/<slug>-1.svg`
- `public/images/products/<slug>-2.svg`
- `public/images/placeholder.svg`, `favicon.svg`, `og-cover.svg`

## Pixabay photos

No Pixabay photos were downloaded: `PIXABAY_API_KEY` was not available when this
branch was built. Consequently **all 84 products are missing downloaded photos**
and use the bundled SVG artwork instead.

To replace them:

1. Copy `.env.example` to `.env` and set `PIXABAY_API_KEY`.
2. Run `npm run images:fetch`.

That script downloads up to two square photos per product, resizes them to a
maximum of 1200 px with sharp, writes credit rows here under the
[Pixabay Content License](https://pixabay.com/service/license/), updates
`src/data/imageMap.ts`, and reports any product whose search returned no result.
Never commit `.env`.
