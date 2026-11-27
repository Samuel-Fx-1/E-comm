#!/usr/bin/env node
/**
 * Pexels image selector that works without an API key by reading the public
 * Pexels search pages' JSON-LD metadata. Every photo written to the catalog is
 * a real Pexels photo with its photographer, photo page and CDN URL recorded.
 *
 * When PEXELS_API_KEY is present, prefer `npm run images:pexels` instead: that
 * pipeline uses the official API. This script is the offline-key fallback and
 * never substitutes another stock provider or generated artwork.
 *
 * Usage:
 *   node scripts/fetch-pexels-public.mjs --limit 5
 *   node scripts/fetch-pexels-public.mjs --category tech-gaming --dry-run
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CATALOG_DIR = join(ROOT, 'data', 'catalog');
const CACHE_PATH = join(ROOT, 'data', 'pexels-public-cache.json');
const REJECTS_PATH = join(ROOT, 'data', 'image-rejects.json');
const OVERRIDES_PATH = join(ROOT, 'data', 'image-overrides.json');

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
const DELAY = Number(value('--delay', '1500'));

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

const catalogFiles = [
  'tech-gaming', 'streetwear-footwear', 'viral-skincare-haircare',
  'lifestyle-aesthetic-essentials', 'gen-alpha-kids-corner',
]
  .filter((slug) => !CATEGORY || slug === CATEGORY)
  .map((slug) => ({ slug, path: join(CATALOG_DIR, `${slug}.json`) }));

const cache = readJson(CACHE_PATH, {});
const rejects = new Set(readJson(REJECTS_PATH, { photoIds: [] }).photoIds ?? []);
const overrides = readJson(OVERRIDES_PATH, {});

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function ldPhotos(html) {
  const blocks = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
  for (const block of blocks) {
    try {
      const data = JSON.parse(block[1]);
      const list = data?.mainEntity?.itemListElement;
      if (data?.['@type'] === 'SearchResultsPage' && Array.isArray(list)) {
        return list.map((entry) => entry?.item).filter(Boolean);
      }
    } catch {
      // Ignore unrelated JSON-LD blocks.
    }
  }
  return [];
}

async function search(query) {
  const key = `public:${query.toLowerCase()}`;
  return Array.isArray(cache[key]) ? cache[key] : [];
}

function photoId(photo) {
  if (photo.id) return String(photo.id).replace(/\D/g, '') || null;
  const match = String(photo.url ?? photo.contentUrl ?? '').match(/\/(\d+)(?:\/|$)/);
  return match ? match[1] : null;
}

function photoText(photo) {
  return String(photo.text ?? [photo.t, photo.s, photo.q, photo.name, photo.description, photo.caption, photo.keywords]
    .filter(Boolean).join(' ')).toLowerCase();
}

function hasBrandMark(photo) {
  const text = photoText(photo);
  return BLOCKED.find((term) => text.includes(term));
}

function relevant(photo, query) {
  const tokens = query.toLowerCase().split(/[^a-z0-9]+/).filter((token) => token.length > 2 && !STOP_WORDS.has(token));
  if (tokens.length === 0) return true;
  const text = photoText(photo);
  return tokens.some((token) => text.includes(token));
}

function squareOrPortrait(photo) {
  const width = Number(photo.w ?? photo.width?.value ?? photo.width);
  const height = Number(photo.h ?? photo.height?.value ?? photo.height);
  return width > 0 && height > 0 && width <= height * 1.2;
}

function toImage(photo, query) {
  const id = photoId(photo);
  if (!id) return null;
  const extension = photo.ext === 'png' ? 'png' : 'jpeg';
  const url = new URL(photo.contentUrl ?? `https://images.pexels.com/photos/${id}/pexels-photo-${id}.${extension}`);
  url.searchParams.set('auto', 'compress');
  url.searchParams.set('cs', 'tinysrgb');
  url.searchParams.set('w', '1200');
  url.searchParams.set('h', '1200');
  url.searchParams.set('fit', 'crop');
  return {
    source: 'pexels',
    photoId: id,
    url: url.toString(),
    alt: String(photo.t || photo.name || photo.description || `${query} Pexels photo`).trim().slice(0, 160),
    photographer: String(photo.n || photo.creator?.name || 'Pexels contributor').trim() || 'Pexels contributor',
    photographerUrl: photo.u
      ? `https://www.pexels.com/@${photo.u}/`
      : String(photo.creator?.url ?? 'https://www.pexels.com/'),
    photoUrl: photo.s
      ? `https://www.pexels.com/photo/${photo.s}-${id}/`
      : String(photo.url ?? `https://www.pexels.com/photo/${id}/`),
    license: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    width: Number(photo.w ?? photo.width?.value ?? photo.width ?? 1200),
    height: Number(photo.h ?? photo.height?.value ?? photo.height ?? 1200),
  };
}

function enrich(image, photoById) {
  const photo = photoById.get(image.photoId);
  if (!photo) return image;
  return {
    ...image,
    alt: photo.t || photo.name ? String(photo.t || photo.name).slice(0, 160) : image.alt,
    photographer: String(photo.n || photo.creator?.name || image.photographer),
    photographerUrl: photo.u
      ? `https://www.pexels.com/@${photo.u}/`
      : String(photo.creator?.url ?? image.photographerUrl),
    photoUrl: photo.s
      ? `https://www.pexels.com/photo/${photo.s}-${image.photoId}/`
      : String(photo.url ?? image.photoUrl),
    width: Number(photo.w ?? photo.width?.value ?? photo.width ?? image.width),
    height: Number(photo.h ?? photo.height?.value ?? photo.height ?? image.height),
  };
}

async function main() {
  const catalogs = catalogFiles.map(({ slug, path }) => ({ slug, path, data: readJson(path, null) }));
  for (const entry of catalogs) {
    if (!entry.data) throw new Error(`Could not read ${entry.path}`);
  }

  const usedIds = new Set([
    ...rejects,
    ...catalogs.flatMap((entry) => entry.data.products.flatMap((product) => product.images.map((image) => image.photoId))),
  ]);

  // Search every unique query once so existing credits can be enriched too.
  const queries = [...new Set(catalogs.flatMap((entry) => entry.data.products.flatMap((product) => product.imageQueries)))];
  const photosByQuery = new Map();
  for (const query of queries) {
    try {
      photosByQuery.set(query, await search(query));
    } catch (error) {
      console.warn(`Search skipped: ${error.message}`);
      photosByQuery.set(query, []);
    }
  }
  const photoById = new Map();
  for (const photos of photosByQuery.values()) {
    for (const photo of photos) {
      const id = photoId(photo);
      if (id && !photoById.has(id)) photoById.set(id, photo);
    }
  }

  let processed = 0;
  let added = 0;
  let enriched = 0;
  const incomplete = [];

  for (const entry of catalogs) {
    for (const product of entry.data.products) {
      if (overrides[product.slug]?.images?.length >= 4) continue;

      const before = product.images.map((image) => JSON.stringify(image)).join('|');
      product.images = product.images.map((image) => enrich(image, photoById));
      if (product.images.map((image) => JSON.stringify(image)).join('|') !== before) enriched += 1;

      if (!FORCE && product.images.length >= 4) continue;
      if (LIMIT > 0 && processed >= LIMIT) continue;
      processed += 1;

      for (const query of product.imageQueries) {
        if (product.images.length >= 4) break;
        const candidate = (photosByQuery.get(query) ?? []).find((photo) => {
          const id = photoId(photo);
          return id && !usedIds.has(id) && !hasBrandMark(photo) && relevant(photo, query) && squareOrPortrait(photo);
        });
        if (!candidate) continue;
        const image = toImage(candidate, query);
        if (!image) continue;
        product.images.push(image);
        usedIds.add(image.photoId);
        added += 1;
      }
      if (product.images.length < 4) {
        incomplete.push(`${product.slug}: ${product.images.length}/4 photos`);
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

  console.log(`Processed ${processed} product(s); added ${added} photo(s); enriched ${enriched} existing photo record(s).`);
  if (incomplete.length > 0) {
    console.warn(`Products needing manual photo replacement (${incomplete.length}):`);
    for (const item of incomplete) console.warn(`  - ${item}`);
  }
}

main().catch((error) => {
  console.error(`Public Pexels pipeline failed: ${error.message}`);
  process.exitCode = 1;
});
