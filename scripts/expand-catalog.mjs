#!/usr/bin/env node
/** Adds the hand-written product set to each catalog file, preserving existing products. */
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { products as kids } from './catalog-additions/kids.mjs';
import { products as lifestyle } from './catalog-additions/lifestyle.mjs';
import { products as streetwear } from './catalog-additions/streetwear.mjs';
import { products as tech } from './catalog-additions/tech.mjs';
import { products as skincare } from './catalog-additions/skincare.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CATALOG_DIR = join(ROOT, 'data', 'catalog');

const additions = [
  ['gen-alpha-kids-corner', kids, 17],
  ['lifestyle-aesthetic-essentials', lifestyle, 17],
  ['streetwear-footwear', streetwear, 16],
  ['tech-gaming', tech, 15],
  ['viral-skincare-haircare', skincare, 15],
];

for (const [slug, products, expected] of additions) {
  if (products.length !== expected) throw new Error(`${slug}: expected ${expected} additions, got ${products.length}`);
  const path = join(CATALOG_DIR, `${slug}.json`);
  const data = JSON.parse(readFileSync(path, 'utf8'));
  const known = new Set(data.products.map((product) => product.slug));
  let added = 0;
  for (const product of products) {
    if (known.has(product.slug)) throw new Error(`${slug}: duplicate slug ${product.slug}`);
    if (product.shortDescription.length < 90 || product.shortDescription.length > 160) {
      throw new Error(`${product.slug}: description has ${product.shortDescription.length} characters`);
    }
    if (Object.keys(product.specs).length < 4) throw new Error(`${product.slug}: fewer than 4 spec rows`);
    if (product.imageQueries.length !== 4) throw new Error(`${product.slug}: expected 4 image queries`);
    data.products.push(product);
    known.add(product.slug);
    added += 1;
  }
  writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`);
  console.log(`${slug}: ${data.products.length} products (${added} added)`);
}
