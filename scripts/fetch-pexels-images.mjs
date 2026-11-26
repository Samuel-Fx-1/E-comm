#!/usr/bin/env node
/**
 * Resumable Pexels image selector for the catalog JSON files.
 *
 * The API key is read only from PEXELS_API_KEY in .env.local; it is never
 * written to disk or sent anywhere except api.pexels.com. Finished products
 * (four photos) are skipped unless --force is passed. Search results are
 * cached in data/pexels-api-cache.json so a rerun does not repeat requests.
 *
 * Usage:
 *   npm run images:pexels -- --limit 5
 *   npm run images:pexels -- --category tech-gaming --dry-run
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CATALOG_DIR = join(ROOT, 'data', 'catalog');
const CACHE_PATH = join(ROOT, 'data', 'pexels-api-cache.json');
const REJECTS_PATH = join(ROOT, 'data', 'image-rejects.json');
const OVERRIDES_PATH = join(ROOT, 'data', 'image-overrides.json');
const API = 'https://api.pexels.com/v1/search';

dotenv.config({ path: join(ROOT, '.env.local'), quiet: true });

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const value = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : fallback;
};

const DRY_RUN = has('--dry-run');
const FORCE = has('--force');
const CATEGORY = value('--category', null);
const LIMIT = Number(value('--limit', '0'));
const DELAY = Number(value('--delay', '1200'));

function readJson(path, fallback) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

const catalogFiles = ['tech-gaming', 'streetwear-footwear', 'viral-skincare-haircare',
  'lifestyle-aesthetic-essentials', 'gen-alpha-kids-corner']
  .filter((slug) => !CATEGORY || slug === CATEGORY)
  .map((slug) => ({ slug, path: join(CATALOG_DIR, `${slug}.json`) }));

const cache = readJson(CACHE_PATH, {});
const rejects = new Set(readJson(REJECTS_PATH, { photoIds: [] }).photoIds ?? []);
const overrides = readJson(OVERRIDES_PATH, {});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function cdnUrl(photo) {
  const base = photo.src?.large2x ?? photo.src?.large ?? photo.src?.original;
  if (!base) return null;
  const url = new URL(base);
  url.searchParams.set('auto', 'compress');
  url.searchParams.set('cs', 'tinysrgb');
  url.searchParams.set('w', '1200');
  url.searchParams.set('h', '1200');
  url.searchParams.set('fit', 'crop');
  return url.toString();
}

function toCatalogImage(photo, query) {
  return {
    source: 'pexels',
    photoId: String(photo.id),
    url: cdnUrl(photo),
    alt: (photo.alt || `${query} — Pexels photo`).slice(0, 160),
    photographer: photo.photographer,
    photographerUrl: photo.photographer_url,
    photoUrl: photo.url || `https://www.pexels.com/photo/${photo.id}/`,
    license: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    width: photo.width,
    height: photo.height,
    color: photo.avg_color,
  };
}

async function search(query) {
  const cacheKey = query.toLowerCase();
  if (cache[cacheKey]) return cache[cacheKey];

  const response = await fetch(`${API}?query=${encodeURIComponent(query)}&per_page=15&orientation=portrait`, {
    headers: { Authorization: process.env.PEXELS_API_KEY },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    throw new Error(`Pexels search failed for "${query}" with HTTP ${response.status}`);
  }
  const payload = await response.json();
  const photos = Array.isArray(payload.photos) ? payload.photos : [];
  cache[cacheKey] = photos;
  await sleep(DELAY);
  return photos;
}

async function main() {
  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    throw new Error('PEXELS_API_KEY is missing. Add it to .env.local before running the image pipeline.');
  }

  const catalogs = catalogFiles.map(({ slug, path }) => ({ slug, path, data: readJson(path, null) }));
  for (const entry of catalogs) {
    if (!entry.data) throw new Error(`Could not read ${entry.path}`);
  }

  const usedIds = new Set([
    ...rejects,
    ...catalogs.flatMap((entry) => entry.data.products.flatMap((product) => product.images.map((image) => image.photoId))),
  ]);

  let processed = 0;
  let added = 0;
  const incomplete = [];

  for (const entry of catalogs) {
    for (const product of entry.data.products) {
      if (LIMIT > 0 && processed >= LIMIT) break;
      if (overrides[product.slug]?.images?.length >= 4) continue;
      if (!FORCE && product.images.length >= 4) continue;

      processed += 1;
      const needed = 4 - product.images.length;
      for (const query of product.imageQueries) {
        if (product.images.length >= 4) break;
        let photos = [];
        try {
          photos = await search(query);
        } catch (error) {
          incomplete.push(`${product.slug}: ${error.message}`);
          continue;
        }
        const candidate = photos.find((photo) => {
          const id = String(photo.id);
          return !usedIds.has(id) && photo.width <= photo.height * 1.2 && cdnUrl(photo);
        });
        if (!candidate) continue;
        const image = toCatalogImage(candidate, query);
        product.images.push(image);
        usedIds.add(image.photoId);
        added += 1;
      }
      if (product.images.length < 4) {
        incomplete.push(`${product.slug}: only ${product.images.length}/4 photos found`);
      }
    }
  }

  if (!DRY_RUN) {
    for (const entry of catalogs) {
      writeFileSync(entry.path, `${JSON.stringify(entry.data, null, 2)}\n`);
    }
    writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`);
    await import('./sync-image-cache.mjs');
  } else {
    console.log('Dry run: no catalog files were written.');
  }

  console.log(`Processed ${processed} product(s); added ${added} photo(s).`);
  if (incomplete.length > 0) {
    console.warn(`Products needing manual photo replacement (${incomplete.length}):`);
    for (const item of incomplete) console.warn(`  - ${item}`);
  }
}

main().catch((error) => {
  console.error(`Image pipeline failed: ${error.message}`);
  process.exitCode = 1;
});
