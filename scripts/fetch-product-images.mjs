#!/usr/bin/env node
/**
 * Catalog-driven image cache refresh.
 *
 * The former multi-provider scraper is retired: Soko uses Pexels only, and
 * product queries come from data/catalog/*.json rather than source regexes.
 * Dry runs stay offline; normal runs delegate to the official Pexels pipeline,
 * which reads PEXELS_API_KEY from .env.local on the server side only.
 *
 * Usage:
 *   npm run images:fetch:dry             # list catalog image queries
 *   npm run images:fetch -- --limit 5    # refresh up to five products
 *   npm run images:fetch -- --force      # reselect even complete galleries
 */
import { spawnSync } from 'node:child_process';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CATALOG_DIR = join(ROOT, 'data', 'catalog');
const PIPELINE = join(ROOT, 'scripts', 'fetch-pexels-images.mjs');

const args = process.argv.slice(2);
const has = (flag) => args.includes(flag);
const value = (flag, fallback) => {
  const index = args.indexOf(flag);
  return index >= 0 && args[index + 1] && !args[index + 1].startsWith('--') ? args[index + 1] : fallback;
};

function readCatalog() {
  return readdirSync(CATALOG_DIR)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .flatMap((name) => JSON.parse(readFileSync(join(CATALOG_DIR, name), 'utf8')).products);
}

const products = readCatalog();
if (has('--dry-run')) {
  for (const product of products) {
    console.log(`${product.slug}: ${product.imageQueries.join(' | ')}`);
  }
  console.log(`Dry run: ${products.length} catalog products; no API calls made.`);
} else {
  const provider = value('--provider', 'pexels').toLowerCase();
  if (provider !== 'pexels') {
    console.error(`Provider "${provider}" is no longer supported. Soko uses Pexels only.`);
    process.exitCode = 1;
  } else {
    const pipelineArgs = args
      .map((arg) => (arg === '--retry-failed' ? '--force' : arg))
      .filter((arg) => arg !== '--provider' && arg !== provider);
    const result = spawnSync(process.execPath, [PIPELINE, ...pipelineArgs], {
      cwd: ROOT,
      stdio: 'inherit',
    });
    process.exitCode = result.status ?? 1;
  }
}
