#!/usr/bin/env node
/**
 * Imports Pexels photo metadata captured from public Pexels search pages.
 *
 * The capture file is an array of groups; each item carries the real photo id,
 * title, photographer, Pexels username, dimensions and the query that found it.
 * Photos are assigned to products by matching each product's own imageQueries,
 * so the result is independent of catalog file order. No placeholder artwork is
 * ever created.
 *
 * Usage:
 *   node scripts/import-pexels-metadata.mjs <capture.json>
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CATALOG_DIR = join(ROOT, 'data', 'catalog');
const CACHE_PATH = join(ROOT, 'data', 'pexels-public-cache.json');
const REJECTS_PATH = join(ROOT, 'data', 'image-rejects.json');

const FILES = [
  'gen-alpha-kids-corner',
  'streetwear-footwear',
  'tech-gaming',
  'viral-skincare-haircare',
  'lifestyle-aesthetic-essentials',
];

const capturePath = process.argv[2];
if (!capturePath) {
  console.error('Usage: node scripts/import-pexels-metadata.mjs <capture.json>');
  process.exit(1);
}

const capture = JSON.parse(readFileSync(capturePath, 'utf8'));
const groups = capture.groups ?? capture;
if (!Array.isArray(groups)) throw new Error('Capture must contain a groups array');

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function toImage(photo) {
  const id = String(photo.id ?? '').replace(/\D/g, '');
  if (!id) return null;
  const extension = photo.ext === 'png' ? 'png' : 'jpeg';
  const url = new URL(`https://images.pexels.com/photos/${id}/pexels-photo-${id}.${extension}`);
  url.searchParams.set('auto', 'compress');
  url.searchParams.set('cs', 'tinysrgb');
  url.searchParams.set('w', '1200');
  url.searchParams.set('h', '1200');
  url.searchParams.set('fit', 'crop');
  return {
    source: 'pexels',
    photoId: id,
    url: url.toString(),
    alt: String(photo.t || `${photo.q} Pexels photo`).trim().slice(0, 160) || `${photo.q} Pexels photo`,
    photographer: String(photo.n || 'Pexels contributor').trim() || 'Pexels contributor',
    photographerUrl: `https://www.pexels.com/@${photo.u || ''}/`,
    photoUrl: `https://www.pexels.com/photo/${photo.s}-${id}/`,
    license: 'Pexels License',
    licenseUrl: 'https://www.pexels.com/license/',
    width: Number(photo.w || 1200),
    height: Number(photo.h || 1200),
  };
}

const catalogs = FILES.map((slug) => ({ slug, path: join(CATALOG_DIR, `${slug}.json`), data: readJson(join(CATALOG_DIR, `${slug}.json`)) }));
const products = catalogs.flatMap((entry) => entry.data.products);
const rejects = new Set((readJson(REJECTS_PATH).photoIds ?? []).map(String));

const cache = (() => {
  try { return readJson(CACHE_PATH); } catch { return {}; }
})();
for (const group of groups) {
  for (const photo of group) {
    const key = `public:${String(photo.q).toLowerCase()}`;
    const list = Array.isArray(cache[key]) ? cache[key] : (cache[key] = []);
    if (!list.some((item) => String(item.id) === String(photo.id))) list.push(photo);
  }
}

const used = new Set(products.flatMap((product) => product.images.map((image) => image.photoId)).map(String));
let added = 0;

for (const product of products) {
  for (let pass = 0; pass < 2 && product.images.length < 4; pass += 1) {
    for (const query of product.imageQueries) {
      if (product.images.length >= 4) break;
      const candidates = cache[`public:${query.toLowerCase()}`] ?? [];
      const photo = candidates.find((item) => !used.has(String(item.id)) && !rejects.has(String(item.id)));
      if (!photo) continue;
      const image = toImage(photo);
      if (!image) continue;
      product.images.push(image);
      used.add(image.photoId);
      added += 1;
    }
  }
}

for (const entry of catalogs) {
  writeFileSync(entry.path, `${JSON.stringify(entry.data, null, 2)}\n`);
}
writeFileSync(CACHE_PATH, `${JSON.stringify(cache, null, 2)}\n`);

const incomplete = products.filter((product) => product.images.length < 4).map((product) => `${product.slug}: ${product.images.length}/4`);
console.log(`Imported ${added} Pexels photo(s) matched by product query.`);
if (incomplete.length) {
  console.warn(`Products still needing photos (${incomplete.length}):`);
  for (const item of incomplete) console.warn(`  - ${item}`);
}
