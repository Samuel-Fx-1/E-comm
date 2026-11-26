/**
 * Idempotent curated-catalogue seeder.
 *
 * Run with `npm run db:seed`. Every run clears the products table and inserts
 * the 16 products from src/data/products/curated.ts, so a full database is
 * safely replaced with the current curated shelf. Photographs are resolved
 * through the same image resolver the client uses; no API key or network call
 * is made here.
 */
import dotenv from 'dotenv';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, resolveDbPath } from '../server/db.mjs';
import { products as curated } from '../src/data/products/index.ts';
import { resolveImages } from '../src/data/imageMap.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
dotenv.config({ path: join(ROOT, '.env.local'), quiet: true });

const TARGET = 16;
const INSERT_SQL = `
  INSERT INTO products (
    id, slug, name, title, brand, category, subcategory,
    price, list_price, price_rwf, old_price_rwf, discount,
    rating, review_count, stock, short_description,
    images, bullets, specs, variants, seller, delivery_days,
    is_best_seller, is_deal, is_trending, added_at, curated
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  if (curated.length !== TARGET) {
    throw new Error(`Expected ${TARGET} curated products, found ${curated.length}`);
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
    curated.forEach((product) => insert.run(...toParams(product)));
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
    console.log(
      `[seed] done: ${finalCount} curated products in ${((Date.now() - started) / 1000).toFixed(1)}s`
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
