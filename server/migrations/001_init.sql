-- Phase 4: SQLite catalogue schema. Every Product field from src/types/index.ts
-- is represented; JSON columns hold arrays/objects. The integer `seq` is the
-- SQLite rowid alias used by the external-content FTS5 table in 002.

CREATE TABLE IF NOT EXISTS app_config (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

INSERT OR IGNORE INTO app_config (key, value) VALUES ('fts_sync', '1');

CREATE TABLE IF NOT EXISTS products (
  seq              INTEGER PRIMARY KEY AUTOINCREMENT,
  id               TEXT    NOT NULL UNIQUE,
  slug             TEXT    NOT NULL UNIQUE,
  name             TEXT    NOT NULL,
  title            TEXT    NOT NULL,
  brand            TEXT    NOT NULL,
  category         TEXT    NOT NULL,
  subcategory      TEXT    NOT NULL,
  price            REAL    NOT NULL,
  list_price       REAL    NOT NULL,
  price_rwf        INTEGER NOT NULL,
  old_price_rwf    INTEGER NOT NULL,
  discount         INTEGER NOT NULL DEFAULT 0,
  rating           REAL    NOT NULL DEFAULT 0,
  review_count     INTEGER NOT NULL DEFAULT 0,
  stock            INTEGER NOT NULL DEFAULT 0,
  short_description TEXT   NOT NULL DEFAULT '',
  images           TEXT    NOT NULL DEFAULT '[]',
  bullets          TEXT    NOT NULL DEFAULT '[]',
  specs            TEXT    NOT NULL DEFAULT '{}',
  variants         TEXT    NOT NULL DEFAULT '[]',
  seller           TEXT    NOT NULL DEFAULT '',
  delivery_days    INTEGER NOT NULL DEFAULT 0,
  is_best_seller   INTEGER NOT NULL DEFAULT 0,
  is_deal          INTEGER NOT NULL DEFAULT 0,
  added_at         TEXT    NOT NULL,
  curated          INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_products_category       ON products (category);
CREATE INDEX IF NOT EXISTS idx_products_brand          ON products (brand);
CREATE INDEX IF NOT EXISTS idx_products_price          ON products (price);
CREATE INDEX IF NOT EXISTS idx_products_rating         ON products (rating);
CREATE INDEX IF NOT EXISTS idx_products_is_deal        ON products (is_deal);
CREATE INDEX IF NOT EXISTS idx_products_added_at       ON products (added_at);
CREATE INDEX IF NOT EXISTS idx_products_curated        ON products (curated);
CREATE INDEX IF NOT EXISTS idx_products_discount       ON products (discount);
CREATE INDEX IF NOT EXISTS idx_products_category_price ON products (category, price);
CREATE INDEX IF NOT EXISTS idx_products_category_date  ON products (category, added_at DESC);
CREATE INDEX IF NOT EXISTS idx_products_featured       ON products (curated DESC, is_best_seller DESC, rating DESC, review_count DESC);
