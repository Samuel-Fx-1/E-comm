#!/usr/bin/env node
/**
 * Compare catalog photo credits with official Pexels API metadata captured in
 * data/pexels-api-cache.json. Run this after `npm run images:pexels` when a
 * PEXELS_API_KEY has been added to .env.local.
 *
 * It checks photo id, photographer, photographer URL, Pexels photo page URL,
 * alt text and the CDN image URL. No API key is read or printed here.
 */
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CATALOG_DIR = join(ROOT, 'data', 'catalog');
const API_CACHE_PATH = join(ROOT, 'data', 'pexels-api-cache.json');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function normalizedUrl(url) {
  try {
    const parsed = new URL(url);
    return `${parsed.origin}${parsed.pathname}`;
  } catch {
    return String(url);
  }
}

function apiCdnUrl(photo) {
  return normalizedUrl(photo.src?.large2x ?? photo.src?.large ?? photo.src?.original ?? '');
}

function main() {
  if (!existsSync(API_CACHE_PATH)) {
    console.error('No official API cache found. Add PEXELS_API_KEY to .env.local, run `npm run images:pexels`, then rerun this comparison.');
    process.exitCode = 1;
    return;
  }

  const cache = readJson(API_CACHE_PATH);
  const byId = new Map();
  for (const photos of Object.values(cache)) {
    if (!Array.isArray(photos)) continue;
    for (const photo of photos) {
      if (photo?.id != null && !byId.has(String(photo.id))) byId.set(String(photo.id), photo);
    }
  }

  const mismatches = [];
  let compared = 0;
  let matchedRecords = 0;

  for (const file of readdirSync(CATALOG_DIR).filter((name) => name.endsWith('.json')).sort()) {
    const data = readJson(join(CATALOG_DIR, file));
    for (const product of data.products ?? []) {
      for (const [index, image] of (product.images ?? []).entries()) {
        compared += 1;
        const api = byId.get(String(image.photoId));
        const where = `${product.slug}:slot${index + 1}:${image.photoId}`;
        if (!api) {
          mismatches.push(`${where}: no official API record in cache`);
          continue;
        }
        matchedRecords += 1;
        const fields = [
          ['photographer', image.photographer, api.photographer],
          ['photographerUrl', normalizedUrl(image.photographerUrl), normalizedUrl(api.photographer_url ?? '')],
          ['photoUrl', normalizedUrl(image.photoUrl), normalizedUrl(api.url ?? '')],
          ['alt', image.alt, api.alt],
          ['cdnUrl', normalizedUrl(image.url), apiCdnUrl(api)],
        ];
        for (const [field, stored, official] of fields) {
          if (String(stored ?? '') !== String(official ?? '')) {
            mismatches.push(`${where}: ${field} stored="${stored ?? ''}" official="${official ?? ''}"`);
          }
        }
      }
    }
  }

  console.log(`Compared ${compared} catalog photo(s) against ${byId.size} official API record(s); ${matchedRecords} photo(s) had a matching record.`);
  if (mismatches.length === 0) {
    console.log('No metadata mismatches found.');
    return;
  }
  console.error(`Found ${mismatches.length} metadata mismatch(es):`);
  for (const item of mismatches.slice(0, 40)) console.error(`  - ${item}`);
  if (mismatches.length > 40) console.error(`  ... and ${mismatches.length - 40} more`);
  process.exitCode = 1;
}

main();
