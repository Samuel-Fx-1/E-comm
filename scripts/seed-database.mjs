/**
 * Deterministic 1,000,000-product catalogue seeder.
 *
 * Run with `npm run db:seed` (tsx is required for the curated TypeScript data
 * imports). Re-running is safe: all curated products are upserted so newly
 * added items reach an existing database, generated filler is trimmed to keep
 * the catalogue at exactly 1,000,000 rows, and a partial run resumes from the
 * next generated product. Curated products keep their cached Pixabay paths via
 * the same image resolver the client uses; generated products reuse bundled
 * category SVG art.
 */
import dotenv from 'dotenv';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { openDatabase, resolveDbPath } from '../server/db.mjs';
import { products as curated } from '../src/data/products/index.ts';
import { resolveImages } from '../src/data/imageMap.ts';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
dotenv.config({ path: join(ROOT, '.env.local'), quiet: true });

const TARGET = 1_000_000;
const BATCH_SIZE = 20_000;
const SEED = 0x5f3759df;
const RWF_RATE = 1300;
const RWF_ROUNDING = 100;
const BASE_DATE = new Date('2026-10-30T00:00:00Z').getTime();

const CATEGORY_META = {
  electronics: {
    subcategory: 'Audio, video & accessories',
    models: ['Pulse Buds', 'GaN Charger', 'QHD Monitor', 'Mechanical Keyboard', 'Smart Watch', 'Bluetooth Speaker', 'USB-C Hub', 'Power Bank', 'Webcam', 'Soundbar'],
    price: [15, 499],
    specs: (code) => ({ Model: code, Connectivity: 'Bluetooth / USB-C', Warranty: '12 months', Rating: 'IPX5' }),
  },
  'home-kitchen': {
    subcategory: 'Home & kitchen essentials',
    models: ['Ceramic Cookware Set', 'Pour-Over Kettle', 'Air Purifier', 'Espresso Maker', 'Storage Jars', 'Chef Knife', 'Throw Blanket', 'Digital Scale', 'Cleaning Kit', 'Cast Iron Pan'],
    price: [12, 260],
    specs: (code) => ({ Model: code, Material: 'Durable composite', Care: 'Hand wash recommended', Warranty: '12 months' }),
  },
  fashion: {
    subcategory: 'Clothing & accessories',
    models: ['Merino Crew', 'Everyday Tote', 'Trail Sneakers', 'Linen Shirt', 'Wool Scarf', 'Slim Chinos', 'Canvas Cap', 'Leather Wallet', 'Rain Jacket', 'Knit Dress'],
    price: [10, 180],
    specs: (code) => ({ Model: code, Fabric: 'Cotton blend', Fit: 'Regular', Care: 'Machine wash cold' }),
  },
  beauty: {
    subcategory: 'Beauty & personal care',
    models: ['Hydrating Serum', 'Vitamin C Cream', 'Gentle Cleanser', 'Hair Mask', 'Sunscreen SPF 50', 'Lip Balm Set', 'Face Mist', 'Body Lotion', 'Exfoliating Scrub', 'Travel Kit'],
    price: [6, 95],
    specs: (code) => ({ Model: code, Skin: 'All skin types', Volume: '50 ml', Origin: 'Dermatologically tested' }),
  },
  sports: {
    subcategory: 'Sports & outdoors',
    models: ['Trail Backpack', 'Yoga Mat', 'Running Shoes', 'Water Bottle', 'Camping Lamp', 'Resistance Bands', 'Cycling Helmet', 'Training Gloves', 'Trekking Poles', 'Gym Towel'],
    price: [14, 320],
    specs: (code) => ({ Model: code, Material: 'Lightweight technical fabric', Use: 'Training / outdoors', Warranty: '12 months' }),
  },
  books: {
    subcategory: 'Books & learning',
    models: ['Field Guide', 'Design Handbook', 'Cookbook', 'Novel Collection', 'Study Atlas', 'Workbook', 'Nature Encyclopedia', 'Beginner Manual', 'Photo Album', 'Language Primer'],
    price: [5, 45],
    specs: (code) => ({ Model: code, Format: 'Paperback', Pages: '192–320', Language: 'English' }),
  },
  toys: {
    subcategory: 'Toys & games',
    models: ['Building Blocks', 'Plush Companion', 'Puzzle Set', 'Board Game', 'Remote Racer', 'Art Kit', 'Science Set', 'Doll House', 'Outdoor Ball', 'Memory Cards'],
    price: [8, 150],
    specs: (code) => ({ Model: code, Age: '3+ years', Material: 'Child-safe plastic', Battery: 'Not required' }),
  },
  digital: {
    subcategory: 'Digital products',
    models: ['Digital Planner', 'Preset Bundle', 'Icon Pack', 'Template Kit', 'Workbook PDF', 'Lightroom Presets', 'Budget Tracker', 'Study Guide', 'Printable Pack', 'Design Assets'],
    price: [5, 45],
    specs: (code) => ({ Model: code, Format: 'Instant download', License: 'Personal use', Delivery: 'PDF / ZIP' }),
  },
  groceries: {
    subcategory: 'Groceries & pantry',
    models: ['Coffee Beans', 'Olive Oil', 'Granola', 'Spice Pack', 'Green Tea', 'Honey Jar', 'Pasta Bundle', 'Cocoa Powder', 'Trail Mix', 'Breakfast Cereal'],
    price: [2, 60],
    specs: (code) => ({ Model: code, Pack: 'Standard', 'Shelf life': '12 months', Storage: 'Cool, dry place' }),
  },
};

const CITIES = ['Kigali', 'Nairobi', 'Kampala', 'Dar es Salaam', 'Addis Ababa', 'Lagos'];

const INSERT_SQL = `
  INSERT INTO products (
    id, slug, name, title, brand, category, subcategory,
    price, list_price, price_rwf, old_price_rwf, discount,
    rating, review_count, stock, short_description,
    images, bullets, specs, variants, seller, delivery_days,
    is_best_seller, is_deal, is_trending, added_at, curated
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(slug) DO UPDATE SET
    id = excluded.id,
    name = excluded.name,
    title = excluded.title,
    brand = excluded.brand,
    category = excluded.category,
    subcategory = excluded.subcategory,
    price = excluded.price,
    list_price = excluded.list_price,
    price_rwf = excluded.price_rwf,
    old_price_rwf = excluded.old_price_rwf,
    discount = excluded.discount,
    rating = excluded.rating,
    review_count = excluded.review_count,
    stock = excluded.stock,
    short_description = excluded.short_description,
    images = excluded.images,
    bullets = excluded.bullets,
    specs = excluded.specs,
    variants = excluded.variants,
    seller = excluded.seller,
    delivery_days = excluded.delivery_days,
    is_best_seller = excluded.is_best_seller,
    is_deal = excluded.is_deal,
    is_trending = excluded.is_trending,
    added_at = excluded.added_at,
    curated = excluded.curated
`;

function mulberry32(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function slugify(text) {
  // Generated names are ASCII; skipping NFD normalisation saves ~1M allocations.
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const pick = (rng, list) => list[Math.floor(rng() * list.length) % list.length];
const round2 = (value) => Math.round(value * 100) / 100;
const toRwf = (usd) => Math.round((usd * RWF_RATE) / RWF_ROUNDING) * RWF_ROUNDING;
const jsonParam = (value) => (typeof value === 'string' ? value : JSON.stringify(value));

function buildLookups() {
  const byCategory = new Map();
  const brandsByCategory = new Map();
  for (const product of curated) {
    if (!byCategory.has(product.category)) byCategory.set(product.category, []);
    byCategory.get(product.category).push({
      ...product,
      imagesJson: JSON.stringify(product.images),
      variantsJson: JSON.stringify(product.variants),
    });
    if (!brandsByCategory.has(product.category)) brandsByCategory.set(product.category, new Set());
    brandsByCategory.get(product.category).add(product.brand);
  }
  for (const [category, brands] of brandsByCategory) {
    brandsByCategory.set(category, [...brands]);
  }
  return { byCategory, brandsByCategory };
}

/** Every field is derived from (SEED + index), so resumes and re-runs match. */
function generateProduct(index, lookups) {
  const rng = mulberry32((SEED + index) >>> 0);
  const categories = Object.keys(CATEGORY_META);
  const category = categories[Math.floor(rng() * categories.length) % categories.length];
  const meta = CATEGORY_META[category];
  const curatedInCategory = lookups.byCategory.get(category);
  const base = curatedInCategory[Math.floor(rng() * curatedInCategory.length) % curatedInCategory.length];
  const brand = pick(rng, lookups.brandsByCategory.get(category));
  const model = pick(rng, meta.models);
  const suffix = String(index).padStart(6, '0');
  const code = `${brand.slice(0, 3).toUpperCase()}-${model.replace(/[^A-Za-z0-9]+/g, '').slice(0, 6).toUpperCase()}-${suffix}`;
  const name = `${brand} ${model} ${suffix}`;
  const slug = `${slugify(name)}`;

  const [low, high] = meta.price;
  const price = round2(low + rng() * (high - low));
  const discountPct = Math.floor(rng() * 41);
  const listPrice = round2(price * (1 + discountPct / 100));
  const discount = listPrice > price ? Math.round(((listPrice - price) / listPrice) * 100) : 0;
  const rating = Math.round((3.2 + rng() * 1.8) * 10) / 10;
  const reviewCount = Math.floor(rng() * 5000);
  const stock = rng() < 0.04 ? 0 : Math.floor(rng() * 300) + 1;
  const deliveryDays = 1 + Math.floor(rng() * 7);
  const daysAgo = Math.floor(rng() * 520);
  const addedAt = new Date(BASE_DATE - daysAgo * 86_400_000).toISOString().slice(0, 10);
  const seller = pick(rng, [
    `${brand} Official`,
    `${brand} Store`,
    'Soko Marketplace',
    `${pick(rng, CITIES)} Trading Co.`,
  ]);

  const bullets = [
    `${brand} ${model} built for everyday reliability and a clean finish.`,
    `Model ${code} with checked quality control and local warranty support.`,
    discount > 0 ? `Limited-time offer: save ${discount}% against the list price.` : 'Backed by a 12-month replacement guarantee.',
  ];

  return {
    id: `sku-${suffix}`,
    slug,
    name,
    title: name,
    brand,
    category,
    subcategory: meta.subcategory,
    priceRwf: toRwf(price),
    oldPriceRwf: toRwf(listPrice),
    price,
    listPrice,
    discount,
    rating,
    reviewCount,
    stock,
    shortDescription: bullets[0],
    images: base.imagesJson, // existing category SVG artwork, four views
    bullets,
    specs: meta.specs(code),
    variants: base.variantsJson,
    seller,
    deliveryDays,
    isBestSeller: rng() < 0.05,
    isDeal: discount >= 10 || rng() < 0.12,
    isTrending: rng() < 0.03,
    addedAt,
  };
}

function toParams(product, curatedFlag) {
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
    jsonParam(product.images),
    jsonParam(product.bullets),
    jsonParam(product.specs),
    jsonParam(product.variants),
    product.seller,
    product.deliveryDays,
    product.isBestSeller ? 1 : 0,
    product.isDeal ? 1 : 0,
    product.isTrending ? 1 : 0,
    product.addedAt,
    curatedFlag,
  ];
}

function countRows(db) {
  return db.prepare('SELECT COUNT(*) AS count FROM products').get().count;
}

function setConfig(db, key, value) {
  db.prepare('INSERT OR REPLACE INTO app_config (key, value) VALUES (?, ?)').run(key, String(value));
}

function main() {
  if (curated.length < 85) {
    throw new Error(`Expected at least 85 curated products, found ${curated.length}`);
  }

  const started = Date.now();
  const db = openDatabase({ dbPath: resolveDbPath() });

  try {
    const lookups = buildLookups();
    const existing = countRows(db);
    console.log(`[seed] ${existing.toLocaleString()} row(s) present before refresh`);

    db.exec('PRAGMA synchronous = NORMAL; PRAGMA cache_size = -262144;');
    const ftsAvailable = Boolean(
      db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'products_fts'").get()
    );
    if (ftsAvailable) setConfig(db, 'fts_sync', 0);

    const insert = db.prepare(INSERT_SQL);
    db.exec('BEGIN');
    curated.forEach((product, index) => {
      const images = resolveImages(product).map((image) => image.src);
      insert.run(...toParams({ ...product, images }, 1));
      if ((index + 1) % 20 === 0) process.stdout.write(`\r[seed] curated: ${index + 1}/${curated.length}`);
    });
    db.exec('COMMIT');
    process.stdout.write(`\r[seed] curated: ${curated.length}/${curated.length} up to date\n`);

    // Adding curated items to a full catalogue would exceed TARGET. Retire the
    // newest generated filler rows so the API still reports exactly 1,000,000.
    const afterCurated = countRows(db);
    if (afterCurated > TARGET) {
      const excess = afterCurated - TARGET;
      const removable = db
        .prepare('SELECT id FROM products WHERE curated = 0 ORDER BY seq DESC LIMIT ?')
        .all(excess);
      const remove = db.prepare('DELETE FROM products WHERE id = ?');
      db.exec('BEGIN');
      removable.forEach((row) => remove.run(row.id));
      db.exec('COMMIT');
      console.log(`[seed] retired ${removable.length} generated placeholder row(s) to keep ${TARGET} total`);
    }

    const generatedTarget = TARGET - curated.length;
    const completed = Math.max(0, countRows(db) - curated.length);
    const startIndex = completed + 1;
    if (startIndex <= generatedTarget) {
      console.log(
        `[seed] resuming generated products at ${startIndex.toLocaleString()} of ${generatedTarget.toLocaleString()}`
      );
      db.exec('BEGIN');
    }

    let inBatch = 0;
    let lastReport = Date.now();
    for (let index = startIndex; index <= generatedTarget; index += 1) {
      insert.run(...toParams(generateProduct(index, lookups), 0));
      inBatch += 1;
      if (inBatch >= BATCH_SIZE || index === generatedTarget) {
        db.exec('COMMIT');
        const now = Date.now();
        const rate = Math.round((inBatch * 1000) / Math.max(1, now - lastReport));
        console.log(
          `[seed] ${index.toLocaleString()} / ${generatedTarget.toLocaleString()} generated (${rate.toLocaleString()} rows/s)`
        );
        lastReport = now;
        inBatch = 0;
        if (index < generatedTarget) db.exec('BEGIN');
      }
    }
    if (inBatch > 0) db.exec('COMMIT');

    if (ftsAvailable) {
      console.log('[seed] rebuilding full-text index once for the complete catalogue…');
      db.exec("INSERT INTO products_fts (products_fts) VALUES ('rebuild')");
      setConfig(db, 'fts_sync', 1);
      setConfig(db, 'fts_built', 1);
    }

    const finalCount = countRows(db);
    if (finalCount !== TARGET) {
      throw new Error(`Expected ${TARGET} rows after seeding, found ${finalCount}`);
    }
    console.log(
      `[seed] done: ${finalCount.toLocaleString()} rows in ${((Date.now() - started) / 1000).toFixed(1)}s`
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
