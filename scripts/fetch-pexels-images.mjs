#!/usr/bin/env node
/**
 * Official, resumable Pexels image pipeline for data/catalog/*.json.
 *
 * This is the primary image path. PEXELS_API_KEY is read from .env.local on the
 * server side only; it is never written to disk or sent anywhere except
 * api.pexels.com. Finished galleries are skipped, while rejected photos are
 * replaced in place. Search results are cached in data/pexels-api-cache.json
 * and written after every new query so batches can be resumed safely.
 *
 * Usage:
 *   npm run images:pexels -- --limit 20
 *   npm run images:pexels -- --category tech-gaming --dry-run
 *   npm run images:repick -- --limit 10
 */
import { spawnSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CATALOG_DIR = join(ROOT, 'data', 'catalog');
const CACHE_PATH = join(ROOT, 'data', 'pexels-api-cache.json');
const REJECTS_PATH = join(ROOT, 'data', 'image-rejects.json');
const OVERRIDES_PATH = join(ROOT, 'data', 'image-overrides.json');
const VALIDATOR = join(ROOT, 'scripts', 'validate-catalog.mjs');
const API = 'https://api.pexels.com/v1/search';

dotenv.config({ path: join(ROOT, '.env.local'), quiet: true });

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const value = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : fallback;
};

const DRY_RUN = has('--dry-run');
const FORCE = has('--force');
const REPICK = has('--repick');
const SKIP_VALIDATE = has('--no-validate');
const CATEGORY = value('--category', null);
const LIMIT = Number(value('--limit', '0'));
const DELAY = Number(value('--delay', '1200'));

const BLOCKED = [
  'logo', 'logos', 'branded', 'branding', 'jbl', 'krk', 'sony', 'bose', 'nike',
  'adidas', 'apple', 'airpods', 'iphone', 'samsung', 'dyson', 'nintendo', 'lego',
  'barbie', 'disney', 'coca-cola', 'starbucks', 'tesla', 'spotify', 'whatsapp',
  'google', 'amazon', 'microsoft', 'xiaomi', 'anker', 'gucci', 'louis vuitton',
];
const STOP_WORDS = new Set(['with', 'from', 'that', 'this', 'shot', 'photo', 'close', 'product', 'background', 'minimal', 'minimalist', 'and', 'the', 'for', 'on', 'in', 'of']);

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
const rejects = new Set((readJson(REJECTS_PATH, { photoIds: [] }).photoIds ?? []).map(String));
const overrides = readJson(OVERRIDES_PATH, {});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function persistCache() {
  writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
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
    alt: String(photo.alt || `${query} — Pexels photo`).slice(0, 160),
    photographer: String(photo.photographer || 'Pexels contributor'),
    photographerUrl: String(photo.photographer_url || 'https://www.pexels.com/'),
    photoUrl: String(photo.url || `https://www.pexels.com/photo/${photo.id}/`),
    license: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    width: Number(photo.width),
    height: Number(photo.height),
    color: photo.avg_color,
  };
}

function photoText(photo) {
  return `${photo.alt ?? ''} ${photo.url ?? ''}`.toLowerCase();
}

function blocked(photo) {
  const text = photoText(photo);
  return BLOCKED.find((term) => text.includes(term));
}

function relevant(photo, query) {
  const tokens = query.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 2 && !STOP_WORDS.has(token));
  if (tokens.length === 0) return true;
  const text = photoText(photo);
  return tokens.some((token) => text.includes(token));
}

function portrait(photo) {
  return Number(photo.width) > 0 && Number(photo.height) > 0 && Number(photo.width) <= Number(photo.height) * 1.2;
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
  persistCache();
  await sleep(DELAY);
  return photos;
}

function slotsFor(product) {
  if (FORCE) return [0, 1, 2, 3];
  const slots = [];
  for (let index = 0; index < 4; index += 1) {
    const image = product.images[index];
    if (!image || rejects.has(String(image.photoId))) slots.push(index);
  }
  return REPICK ? slots.filter((index) => product.images[index] && rejects.has(String(product.images[index].photoId))) : slots;
}

function plan(catalogs) {
  let products = 0;
  let slots = 0;
  const lines = [];
  for (const entry of catalogs) {
    for (const product of entry.data.products) {
      const chosen = slotsFor(product);
      if (chosen.length === 0) continue;
      products += 1;
      slots += chosen.length;
      lines.push(`${product.slug}: slots ${chosen.map((index) => index + 1).join(', ')}`);
    }
  }
  console.log(`Dry run: ${products} product(s), ${slots} slot(s) would be ${REPICK ? 'repicked' : 'selected'}; no API calls made.`);
  for (const line of lines.slice(0, 20)) console.log(`  - ${line}`);
  if (lines.length > 20) console.log(`  ... and ${lines.length - 20} more product(s)`);
}

async function main() {
  const catalogs = catalogFiles.map(({ slug, path }) => ({ slug, path, data: readJson(path, null), dirty: false }));
  for (const entry of catalogs) {
    if (!entry.data) throw new Error(`Could not read ${entry.path}`);
  }

  if (DRY_RUN) {
    plan(catalogs);
    return;
  }

  const key = process.env.PEXELS_API_KEY;
  if (!key) {
    throw new Error('PEXELS_API_KEY is missing. Add it to .env.local before running the official image pipeline.');
  }

  const usedIds = new Set([
    ...rejects,
    ...catalogs.flatMap((entry) => entry.data.products.flatMap((product) => product.images.map((image) => String(image.photoId)))),
  ]);
  const photosByQuery = new Map();
  async function photosFor(query) {
    const normalized = query.toLowerCase();
    if (photosByQuery.has(normalized)) return photosByQuery.get(normalized);
    let photos = [];
    try {
      photos = await search(query);
    } catch (error) {
      photosByQuery.set(normalized, []);
      throw error;
    }
    photosByQuery.set(normalized, photos);
    return photos;
  }

  let processed = 0;
  let added = 0;
  let replaced = 0;
  const incomplete = [];
  const errors = [];

  outer: for (const entry of catalogs) {
    for (const product of entry.data.products) {
      if (overrides[product.slug]?.images?.length >= 4) continue;
      const slots = slotsFor(product);
      if (slots.length === 0) continue;

      for (const slot of slots) {
        if (LIMIT > 0 && processed >= LIMIT) break outer;
        processed += 1;

        let picked = null;
        let pickedQuery = null;
        for (const query of product.imageQueries) {
          let photos = [];
          try {
            photos = await photosFor(query);
          } catch (error) {
            errors.push(`${product.slug}: ${error.message}`);
            continue;
          }
          const candidate = photos.find((photo) => {
            const id = String(photo.id);
            return id && !usedIds.has(id) && !rejects.has(id) && !blocked(photo) && relevant(photo, query) && portrait(photo) && cdnUrl(photo);
          });
          if (candidate) {
            picked = candidate;
            pickedQuery = query;
            break;
          }
        }

        if (!picked) {
          incomplete.push(`${product.slug}: slot ${slot + 1} still needs a matching photo`);
          continue;
        }

        const image = toCatalogImage(picked, pickedQuery);
        if (slot < product.images.length) {
          product.images[slot] = image;
          replaced += 1;
        } else {
          product.images.push(image);
          added += 1;
        }
        usedIds.add(image.photoId);
        entry.dirty = true;
      }
    }
  }

  if (catalogs.some((entry) => entry.dirty)) {
    for (const entry of catalogs) {
      if (entry.dirty) writeFileSync(entry.path, `${JSON.stringify(entry.data, null, 2)}\n`);
    }
    await import('./sync-image-cache.mjs');
  }

  console.log(`Processed ${processed} slot(s); added ${added} photo(s); replaced ${replaced} rejected photo(s).`);
  if (errors.length > 0) {
    console.warn(`Official API errors (${errors.length}):`);
    for (const item of errors.slice(0, 20)) console.warn(`  - ${item}`);
    if (errors.length > 20) console.warn(`  ... and ${errors.length - 20} more`);
  }
  if (incomplete.length > 0) {
    console.warn(`Products needing manual photo replacement (${incomplete.length}):`);
    for (const item of incomplete.slice(0, 20)) console.warn(`  - ${item}`);
    if (incomplete.length > 20) console.warn(`  ... and ${incomplete.length - 20} more`);
  }

  if (!SKIP_VALIDATE) {
    console.log('\nRunning catalog validation after the image update...');
    const result = spawnSync(process.execPath, [VALIDATOR], { cwd: ROOT, stdio: 'inherit' });
    if (result.status !== 0) process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(`Official Pexels pipeline failed: ${error.message}`);
  process.exitCode = 1;
});
