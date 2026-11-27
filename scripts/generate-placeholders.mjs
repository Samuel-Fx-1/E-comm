#!/usr/bin/env node
/**
 * Verifies that the catalog galleries are complete without generating art.
 *
 * Soko no longer ships SVG placeholders: every gallery must come from the
 * validated catalog JSON and contain four real Pexels photos. This script is
 * kept as a non-network preflight for the old `images:placeholders` workflow.
 *
 * Usage:
 *   npm run images:check
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CATALOG_DIR = join(ROOT, 'data', 'catalog');

const products = readdirSync(CATALOG_DIR)
  .filter((name) => name.endsWith('.json'))
  .sort()
  .flatMap((name) => JSON.parse(readFileSync(join(CATALOG_DIR, name), 'utf8')).products);

const gaps = products.filter((product) => product.images.length !== 4);
if (gaps.length > 0) {
  console.error(`${gaps.length} product(s) do not have exactly four catalog photos:`);
  for (const product of gaps) console.error(`  - ${product.slug}: ${product.images.length}/4`);
  process.exitCode = 1;
} else {
  console.log(`Checked ${products.length} products; all have four catalog photos. No SVG placeholder generated.`);
}
