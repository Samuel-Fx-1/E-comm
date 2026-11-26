-- Optional: full-text search over the catalogues. Marked `.optional.sql` so a
-- Node build without FTS5 records a skipped migration and uses indexed LIKE in
-- server/db.mjs instead. `fts_sync` is toggled off by the bulk seeder so FTS is
-- rebuilt once instead of maintained per row during the 1,000,000 inserts.

CREATE VIRTUAL TABLE IF NOT EXISTS products_fts USING fts5(
  name,
  brand,
  bullets,
  short_description,
  content='products',
  content_rowid='seq',
  tokenize='unicode61 remove_diacritics 2'
);

CREATE TRIGGER IF NOT EXISTS products_fts_after_insert AFTER INSERT ON products
WHEN (SELECT value FROM app_config WHERE key = 'fts_sync') = '1'
BEGIN
  INSERT INTO products_fts (rowid, name, brand, bullets, short_description)
  VALUES (new.seq, new.name, new.brand, new.bullets, new.short_description);
END;

CREATE TRIGGER IF NOT EXISTS products_fts_after_update AFTER UPDATE ON products
WHEN (SELECT value FROM app_config WHERE key = 'fts_sync') = '1'
BEGIN
  INSERT INTO products_fts (products_fts, rowid, name, brand, bullets, short_description)
  VALUES ('delete', old.seq, old.name, old.brand, old.bullets, old.short_description);
  INSERT INTO products_fts (rowid, name, brand, bullets, short_description)
  VALUES (new.seq, new.name, new.brand, new.bullets, new.short_description);
END;

CREATE TRIGGER IF NOT EXISTS products_fts_after_delete AFTER DELETE ON products
WHEN (SELECT value FROM app_config WHERE key = 'fts_sync') = '1'
BEGIN
  INSERT INTO products_fts (products_fts, rowid, name, brand, bullets, short_description)
  VALUES ('delete', old.seq, old.name, old.brand, old.bullets, old.short_description);
END;
