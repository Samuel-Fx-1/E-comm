-- Phase 7: Gen Z / Gen Alpha merchandising labels. Default 0 keeps existing
-- rows valid; the 20-product curated shelf sets the labels explicitly.
ALTER TABLE products ADD COLUMN is_gen_z_pick INTEGER NOT NULL DEFAULT 0;
ALTER TABLE products ADD COLUMN is_viral INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_products_gen_z_pick
  ON products (is_gen_z_pick, curated, rating DESC, seq ASC);
CREATE INDEX IF NOT EXISTS idx_products_viral
  ON products (is_viral, curated, rating DESC, seq ASC);
CREATE INDEX IF NOT EXISTS idx_products_featured_flags
  ON products (curated DESC, is_gen_z_pick DESC, is_viral DESC, is_trending DESC, is_best_seller DESC);
