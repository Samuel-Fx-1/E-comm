-- Phase 5: curated trending flag. Default 0 keeps the 1,000,000 existing rows
-- valid; only the curated shelf sets it to 1.
ALTER TABLE products ADD COLUMN is_trending INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_products_trending
  ON products (is_trending, curated, rating DESC, seq ASC);
