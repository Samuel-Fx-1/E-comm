/**
 * SQLite catalogue storage and repository boundary.
 *
 * Routes never touch SQL: they call `repository`, whose methods are the only
 * contract the Express layer knows about. A MongoDB implementation can replace
 * `createRepository()` without changing server/index.mjs or the API contract.
 */
import { DatabaseSync } from 'node:sqlite';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, isAbsolute, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const MIGRATIONS_DIR = join(ROOT, 'server', 'migrations');
const DEFAULT_DB_PATH = join(ROOT, 'data', 'soko.sqlite');

const CATEGORY_NAMES = {
  'tech-gaming': 'Tech & Gaming',
  'streetwear-footwear': 'Streetwear & Footwear',
  'viral-skincare-haircare': 'Viral Skincare & Haircare',
  'lifestyle-aesthetic-essentials': 'Lifestyle & Aesthetic Essentials',
  'gen-alpha-kids-corner': 'Gen Alpha & Kids Corner',
};

const SORT_SQL = {
  featured: 'p.curated DESC, p.is_gen_z_pick DESC, p.is_viral DESC, p.is_trending DESC, p.is_best_seller DESC, p.rating DESC, p.review_count DESC, p.seq ASC',
  'price-asc': 'p.price ASC, p.seq ASC',
  'price-desc': 'p.price DESC, p.seq ASC',
  rating: 'p.rating DESC, p.review_count DESC, p.seq ASC',
  newest: 'p.added_at DESC, p.seq DESC',
};

const COLLECTION_SQL = {
  deals: {
    where: '(p.is_deal = 1 OR p.discount > 0)',
    order: 'p.curated DESC, p.discount DESC, p.rating DESC, p.seq ASC',
  },
  'best-sellers': {
    where: 'p.is_best_seller = 1',
    order: 'p.curated DESC, p.review_count DESC, p.rating DESC, p.seq ASC',
  },
  'new-arrivals': {
    where: '1 = 1',
    order: 'p.added_at DESC, p.seq DESC',
  },
  featured: {
    where: '1 = 1',
    order: 'p.curated DESC, p.is_gen_z_pick DESC, p.is_viral DESC, p.is_trending DESC, p.is_best_seller DESC, p.rating DESC, p.review_count DESC, p.seq ASC',
  },
  trending: {
    where: 'p.is_trending = 1',
    order: 'p.curated DESC, p.rating DESC, p.review_count DESC, p.seq ASC',
  },
  'gen-z-picks': {
    where: 'p.is_gen_z_pick = 1',
    order: 'p.curated DESC, p.rating DESC, p.review_count DESC, p.seq ASC',
  },
  viral: {
    where: 'p.is_viral = 1',
    order: 'p.curated DESC, p.rating DESC, p.review_count DESC, p.seq ASC',
  },
};

let dbInstance;
let repositoryInstance;

/** Resolve the configured DB path without ever printing its value. */
export function resolveDbPath(configured = process.env.SOKO_DB_PATH) {
  if (!configured) return DEFAULT_DB_PATH;
  if (configured === ':memory:') return configured;
  return isAbsolute(configured) ? resolve(configured) : resolve(ROOT, configured);
}

export function openDatabase({ dbPath = resolveDbPath() } = {}) {
  if (dbPath !== ':memory:') mkdirSync(dirname(dbPath), { recursive: true });
  const db = new DatabaseSync(dbPath);

  db.exec(`
    PRAGMA busy_timeout = 5000;
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    PRAGMA foreign_keys = ON;
    PRAGMA temp_store = MEMORY;
    PRAGMA cache_size = -65536;
  `);

  runMigrations(db);
  ensureFullTextIndex(db);
  return db;
}

function runMigrations(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    INTEGER PRIMARY KEY,
      name       TEXT NOT NULL,
      status     TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const files = readdirSync(MIGRATIONS_DIR)
    .filter((name) => /^\d+_.*\.sql$/.test(name))
    .sort();

  for (const name of files) {
    const version = Number.parseInt(name, 10);
    const optional = name.includes('.optional.');
    const existing = db
      .prepare('SELECT status FROM schema_migrations WHERE version = ?')
      .get(version);
    if (existing?.status === 'applied') continue;
    if (existing?.status === 'skipped' && !optional) continue;

    const sql = readFileSync(join(MIGRATIONS_DIR, name), 'utf8');
    try {
      db.exec('BEGIN');
      db.exec(sql);
      db.exec('COMMIT');
      db.prepare(`
        INSERT INTO schema_migrations (version, name, status, applied_at)
        VALUES (?, ?, 'applied', ?)
        ON CONFLICT(version) DO UPDATE SET
          name = excluded.name, status = 'applied', applied_at = excluded.applied_at
      `).run(version, name, new Date().toISOString());
    } catch (error) {
      try { db.exec('ROLLBACK'); } catch { /* no active transaction */ }
      if (!optional) throw error;
      // FTS5 is the expected optional case; LIKE fallback is enabled below.
      db.prepare(`
        INSERT INTO schema_migrations (version, name, status, applied_at)
        VALUES (?, ?, 'skipped', ?)
        ON CONFLICT(version) DO UPDATE SET
          name = excluded.name, status = 'skipped', applied_at = excluded.applied_at
      `).run(version, name, new Date().toISOString());
      console.warn(`[db] optional migration ${name} skipped; using indexed LIKE search`);
    }
  }
}

function hasFts(db) {
  return Boolean(
    db.prepare("SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = 'products_fts'").get()
  );
}

/** Build the FTS index once for pre-existing rows; the seeder also rebuilds it. */
function ensureFullTextIndex(db) {
  if (!hasFts(db)) return;
  const built = db.prepare("SELECT value FROM app_config WHERE key = 'fts_built'").get();
  if (built?.value === '1') return;
  try {
    db.exec("INSERT INTO products_fts (products_fts) VALUES ('rebuild')");
    db.prepare("INSERT OR REPLACE INTO app_config (key, value) VALUES ('fts_built', '1')").run();
  } catch (error) {
    console.warn(`[db] FTS rebuild deferred: ${error.message}`);
  }
}

function parseJson(value, fallback) {
  if (typeof value !== 'string' || value.length === 0) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/** Database row -> exact Product shape used by src/types/index.ts. */
function rowToProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    title: row.title,
    brand: row.brand,
    category: row.category,
    subcategory: row.subcategory,
    priceRwf: row.price_rwf,
    oldPriceRwf: row.old_price_rwf,
    price: row.price,
    listPrice: row.list_price,
    discount: row.discount,
    rating: row.rating,
    reviewCount: row.review_count,
    stock: row.stock,
    shortDescription: row.short_description,
    images: parseJson(row.images, []),
    bullets: parseJson(row.bullets, []),
    specs: parseJson(row.specs, {}),
    variants: parseJson(row.variants, []),
    seller: row.seller,
    deliveryDays: row.delivery_days,
    isBestSeller: Boolean(row.is_best_seller),
    isDeal: Boolean(row.is_deal),
    isTrending: Boolean(row.is_trending),
    isGenZPick: Boolean(row.is_gen_z_pick),
    isViral: Boolean(row.is_viral),
    addedAt: row.added_at,
  };
}

/** Turn arbitrary user input into a safe FTS5 prefix expression. */
function ftsExpression(q) {
  const terms = String(q ?? '')
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu)
    ?.slice(0, 8) ?? [];
  if (terms.length === 0) return null;
  return terms.map((term) => `"${term}"*`).join(' ');
}

function likeTerms(q) {
  return String(q ?? '')
    .toLowerCase()
    .match(/[\p{L}\p{N}]+/gu)
    ?.slice(0, 3) ?? [];
}

function buildWhere(filters, ftsAvailable) {
  const clauses = [];
  const params = [];
  let join = '';

  const q = String(filters.q ?? '').trim();
  if (q) {
    const match = ftsAvailable ? ftsExpression(q) : null;
    if (match) {
      join = 'JOIN products_fts f ON f.rowid = p.seq';
      clauses.push('f.products_fts MATCH ?');
      params.push(match);
    } else {
      const terms = likeTerms(q);
      if (terms.length === 0) clauses.push('1 = 0');
      else {
        const ors = [];
        for (const term of terms) {
          const pattern = `%${term}%`;
          ors.push('LOWER(p.name) LIKE ?', 'LOWER(p.brand) LIKE ?', 'LOWER(p.bullets) LIKE ?', 'LOWER(p.short_description) LIKE ?');
          params.push(pattern, pattern, pattern, pattern);
        }
        clauses.push(`(${ors.join(' OR ')})`);
      }
    }
  }

  if (filters.category && filters.category !== 'all') {
    clauses.push('p.category = ?');
    params.push(filters.category);
  }

  const brands = Array.isArray(filters.brands)
    ? filters.brands
    : String(filters.brands ?? '')
      .split(',')
      .map((brand) => brand.trim())
      .filter(Boolean);
  if (brands.length > 0) {
    clauses.push(`p.brand IN (${brands.map(() => '?').join(', ')})`);
    params.push(...brands);
  }

  const min = Number(filters.min);
  if (Number.isFinite(min) && min > 0) {
    clauses.push('p.price >= ?');
    params.push(min);
  }
  const max = Number(filters.max);
  if (Number.isFinite(max) && max < Number.MAX_SAFE_INTEGER) {
    clauses.push('p.price <= ?');
    params.push(max);
  }

  const rating = Number(filters.rating);
  if (Number.isFinite(rating) && rating > 0) {
    clauses.push('p.rating >= ?');
    params.push(rating);
  }
  if (filters.inStock === true || filters.inStock === '1') clauses.push('p.stock > 0');
  if (filters.deals === true || filters.deals === '1') {
    clauses.push('(p.is_deal = 1 OR p.discount > 0)');
  }
  if (filters.genZPick === true || filters.genZPick === '1') clauses.push('p.is_gen_z_pick = 1');
  if (filters.viral === true || filters.viral === '1') clauses.push('p.is_viral = 1');

  return {
    join,
    where: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
    params,
  };
}

function createRepository(db) {
  const ftsAvailable = hasFts(db);

  const findBySlug = (slug) =>
    rowToProduct(db.prepare('SELECT * FROM products WHERE slug = ? LIMIT 1').get(String(slug)));

  const findById = (id) =>
    rowToProduct(db.prepare('SELECT * FROM products WHERE id = ? LIMIT 1').get(String(id)));

  const total = () => db.prepare('SELECT COUNT(*) AS count FROM products').get().count;

  const query = (filters = {}) => {
    const page = Math.max(1, Number.parseInt(filters.page, 10) || 1);
    const pageSize = Math.min(48, Math.max(1, Number.parseInt(filters.pageSize, 10) || 12));
    const { join, where, params } = buildWhere(filters, ftsAvailable);
    const order = SORT_SQL[filters.sort] ?? SORT_SQL.featured;

    const matched = db
      .prepare(`SELECT COUNT(*) AS count FROM products p ${join} ${where}`)
      .get(...params).count;
    const rows = db
      .prepare(`SELECT p.* FROM products p ${join} ${where} ORDER BY ${order} LIMIT ? OFFSET ?`)
      .all(...params, pageSize, (page - 1) * pageSize);

    return {
      items: rows.map(rowToProduct),
      total: matched,
      page,
      pageSize,
      pageCount: Math.ceil(matched / pageSize),
    };
  };

  const meta = () => {
    const categories = db
      .prepare('SELECT category AS slug, COUNT(*) AS count FROM products GROUP BY category ORDER BY category')
      .all()
      .map((row) => ({
        slug: row.slug,
        name: CATEGORY_NAMES[row.slug] ?? row.slug,
        count: row.count,
      }));
    const brands = db
      .prepare('SELECT brand AS name, COUNT(*) AS count FROM products GROUP BY brand ORDER BY name')
      .all();
    const bounds = db.prepare('SELECT MIN(price) AS min, MAX(price) AS max FROM products').get();
    return {
      total: total(),
      categories,
      brands,
      priceBounds: { min: bounds.min ?? 0, max: bounds.max ?? 0 },
    };
  };

  const collections = (name, limit = 12) => {
    const preset = COLLECTION_SQL[name];
    if (!preset) return [];
    const safeLimit = Math.min(48, Math.max(1, Number.parseInt(limit, 10) || 12));
    const rows = db
      .prepare(`SELECT p.* FROM products p WHERE ${preset.where} ORDER BY ${preset.order} LIMIT ?`)
      .all(safeLimit);
    return rows.map(rowToProduct);
  };

  const related = (slug, limit = 6) => {
    const source = findBySlug(slug);
    if (!source) return [];
    const safeLimit = Math.min(24, Math.max(1, Number.parseInt(limit, 10) || 6));
    const rows = db
      .prepare(`
        SELECT p.* FROM products p
        WHERE p.category = ? AND p.slug <> ?
        ORDER BY (p.brand = ?) DESC, (p.subcategory = ?) DESC,
                 p.rating DESC, p.review_count DESC, p.seq ASC
        LIMIT ?
      `)
      .all(source.category, source.slug, source.brand, source.subcategory, safeLimit);
    return rows.map(rowToProduct);
  };

  const frequentlyBought = (slug, limit = 4) => {
    const source = findBySlug(slug);
    if (!source) return [];
    const safeLimit = Math.min(12, Math.max(1, Number.parseInt(limit, 10) || 4));
    const row = db
      .prepare('SELECT seq FROM products WHERE slug = ? LIMIT 1')
      .get(String(slug));
    const after = db
      .prepare(`
        SELECT p.* FROM products p
        WHERE p.category = ? AND p.slug <> ? AND p.seq > ?
        ORDER BY p.seq ASC LIMIT ?
      `)
      .all(source.category, source.slug, row.seq, safeLimit);
    if (after.length >= safeLimit) return after.map(rowToProduct);
    const before = db
      .prepare(`
        SELECT p.* FROM products p
        WHERE p.category = ? AND p.slug <> ? AND p.seq < ?
        ORDER BY p.seq DESC LIMIT ?
      `)
      .all(source.category, source.slug, row.seq, safeLimit - after.length);
    return [...after, ...before].map(rowToProduct);
  };

  const suggest = (q, limit = 6) => {
    const queryText = String(q ?? '').trim();
    if (!queryText) return [];
    const safeLimit = Math.min(12, Math.max(1, Number.parseInt(limit, 10) || 6));
    const { join, where, params } = buildWhere({ q: queryText }, ftsAvailable);
    const rows = db
      .prepare(`
        SELECT p.* FROM products p ${join} ${where}
        ORDER BY p.curated DESC, p.review_count DESC, p.rating DESC, p.seq ASC
        LIMIT ?
      `)
      .all(...params, safeLimit);
    return rows.map(rowToProduct);
  };

  return {
    findBySlug,
    findById,
    query,
    total,
    meta,
    collections,
    related,
    frequentlyBought,
    suggest,
    get ftsAvailable() { return ftsAvailable; },
  };
}

export function getRepository() {
  if (!repositoryInstance) {
    dbInstance = openDatabase();
    repositoryInstance = createRepository(dbInstance);
  }
  return repositoryInstance;
}

/** Lazy delegates keep the public API stable while opening DB on first use. */
export const repository = Object.fromEntries(
  ['findBySlug', 'findById', 'query', 'total', 'meta', 'collections', 'related', 'frequentlyBought', 'suggest'].map(
    (name) => [name, (...args) => getRepository()[name](...args)]
  )
);

export function closeDatabase() {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = undefined;
    repositoryInstance = undefined;
  }
}

export { createRepository, rowToProduct };

/** True only for a default/local file; used by the seeder for safety checks. */
export function databaseFileExists(path = resolveDbPath()) {
  return path !== ':memory:' && existsSync(path);
}
