/**
 * Idempotent curated-catalogue seeder.
 *
 * Run with `npm run db:seed`. Every run clears the products table and inserts
 * the products declared in data/catalog/*.json, so a full database is safely
 * replaced with the current curated shelf. The catalog JSON files are the
 * single source of truth; no API key or network call is made here.
 */
import dotenv from 'dotenv';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, resolveDbPath } from '../server/db.mjs';
import { catalogProducts } from '../src/data/catalog.ts';
import { resolveImages } from '../src/data/imageMap.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
dotenv.config({ path: join(ROOT, '.env.local'), quiet: true });

const TARGET = 20;
// Slugs from the superseded catalog that are not reused by the new catalog.
// `wireless-charging-desk-mat` and `collagen-hydrogel-under-eye-patches` are
// intentionally shared with new products, so they are not legacy-only.
const LEGACY_SLUGS = [
  'wireless-noise-canceling-headphones',
  'bluetooth-neckband-earphones',
  'foldable-wireless-keyboard',
  'mini-rechargeable-precision-screwdriver-set',
  'classic-heavyweight-cotton-t-shirt',
  'lightweight-everyday-windbreaker-jacket',
  'casual-low-top-sneakers',
  'niacinamide-hydrating-body-lotion',
  'natural-coconut-hair-growth-repair-oil',
  'nonstick-cookware-set',
  'portable-handheld-garment-steamer',
  'high-pressure-filtered-shower-head',
  'all-in-one-productivity-digital-planner',
  'professional-photo-editing-presets-bundle',
];
const INSERT_SQL = `
  INSERT INTO products (
    id, slug, name, title, brand, category, subcategory,
    price, list_price, price_rwf, old_price_rwf, discount,
    rating, review_count, stock, short_description,
    images, bullets, specs, variants, seller, delivery_days,
    is_best_seller, is_deal, is_trending, is_gen_z_pick, is_viral, added_at, curated
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`;

const jsonParam = (value) => (typeof value === 'string' ? value : JSON.stringify(value));

function toParams(product) {
  const images = resolveImages(product).map((image) => image.src);
  return [
    product.id,
    product.slug,
    product.name,
    product.title,
    product.brand,
    product.category,
    product.subcategory,
    product.price,
    product.listPrice,
    product.priceRwf,
    product.oldPriceRwf,
    product.discount,
    product.rating,
    product.reviewCount,
    product.stock,
    product.shortDescription,
    jsonParam(images),
    jsonParam(product.bullets),
    jsonParam(product.specs),
    jsonParam(product.variants),
    product.seller,
    product.deliveryDays,
    product.isBestSeller ? 1 : 0,
    product.isDeal ? 1 : 0,
    product.isTrending ? 1 : 0,
    product.isGenZPick ? 1 : 0,
    product.isViral ? 1 : 0,
    product.addedAt,
    1,
  ];
}

function countRows(db) {
  return db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
}

function setConfig(db, key, value) {
  db.prepare('INSERT OR REPLACE INTO app_config (key, value) VALUES (?, ?)').run(key, String(value));
}

function main() {
  if (catalogProducts.length !== TARGET) {
    throw new Error(`Expected ${TARGET} catalog products, found ${catalogProducts.length}`);
  }

  const started = Date.now();
  const db = openDatabase({ dbPath: resolveDbPath() });

  try {
    const before = countRows(db);
    console.log(`[seed] ${before.toLocaleString()} row(s) present; replacing with ${TARGET} curated products`);

    db.exec('PRAGMA synchronous = NORMAL; PRAGMA cache_size = -262144;');
    const ftsAvailable = Boolean(
      db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'products_fts'").get()
    );
    // Triggers stay off during the bulk replacement; the FTS table is rebuilt
    // once below rather than maintained for every deleted/inserted row.
    if (ftsAvailable) setConfig(db, 'fts_sync', 0);

    db.exec('BEGIN');
    db.prepare('DELETE FROM products').run();
    const insert = db.prepare(INSERT_SQL);
    catalogProducts.forEach((product) => insert.run(...toParams(product)));
    db.exec('COMMIT');

    if (ftsAvailable) {
      db.exec("INSERT INTO products_fts (products_fts) VALUES ('rebuild')");
      setConfig(db, 'fts_sync', 1);
      setConfig(db, 'fts_built', 1);
    }

    const finalCount = countRows(db);
    if (finalCount !== TARGET) {
      throw new Error(`Expected ${TARGET} rows after seeding, found ${finalCount}`);
    }

    const duplicateSlugs = db
      .prepare('SELECT slug, COUNT(*) AS count FROM products GROUP BY slug HAVING COUNT(*) > 1')
      .all();
    if (duplicateSlugs.length > 0) {
      throw new Error(`Duplicate product slugs: ${duplicateSlugs.map((row) => row.slug).join(', ')}`);
    }

    const legacyCount = db
      .prepare(`SELECT COUNT(*) AS count FROM products WHERE slug IN (${LEGACY_SLUGS.map(() => '?').join(', ')})`)
      .get(...LEGACY_SLUGS).count;
    if (legacyCount > 0) throw new Error(`Found ${legacyCount} legacy product(s) after seeding`);

    const categoryCount = db.prepare('SELECT COUNT(DISTINCT category) AS count FROM products').get().count;
    if (categoryCount !== 5) {
      throw new Error(`Expected 5 categories after seeding, found ${categoryCount}`);
    }

    console.log(
      `[seed] done: ${finalCount} curated products across ${categoryCount} categories in ${((Date.now() - started) / 1000).toFixed(1)}s`
    );
  } finally {
    db.close();
  }
}

try {
  main();
} catch (error) {
  console.error('[seed] failed:', error?.message ?? error);
  process.exitCode = 1;
}
