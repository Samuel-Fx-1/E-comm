/**
 * Soko API + static SPA host. The built client and /api share one origin, so
 * no CORS configuration is needed. Exporting `app` makes route tests possible.
 */
import express from 'express';
import dotenv from 'dotenv';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { closeDatabase, repository } from './db.mjs';
import { schemas, validateParams, validateQuery } from './validation.mjs';
import {
  cookieMiddleware,
  csrfGuard,
  csrfTokenHandler,
  createRateLimiter,
  installSecurityHeaders,
} from './security.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
dotenv.config({ path: join(ROOT, '.env.local'), quiet: true });

const app = express();
const distDir = join(ROOT, 'dist');

app.disable('x-powered-by');
app.use(installSecurityHeaders);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(cookieMiddleware);
app.use('/api', createRateLimiter());
app.use('/api', csrfGuard);

app.get('/api/health', validateQuery(schemas.healthQuery), (req, res) => {
  res.json({ ok: true, total: repository.total() });
});

app.get('/api/meta', validateQuery(schemas.metaQuery), (req, res) => {
  res.json(repository.meta());
});

app.get('/api/products', validateQuery(schemas.productQuery), (req, res) => {
  const query = req.validQuery;
  res.json(repository.query({
    ...query,
    inStock: query.inStock === '1',
    deals: query.deals === '1',
  }));
});

// Must precede /products/:slug so the literal `id` segment is not treated as a slug.
app.get('/api/products/id/:id', validateParams(schemas.idParams), validateQuery(schemas.healthQuery), (req, res) => {
  const product = repository.findById(req.validParams.id);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  return res.json(product);
});

app.get('/api/products/:slug/related', validateParams(schemas.slugParams), validateQuery(schemas.relatedQuery), (req, res) => {
  res.json(repository.related(req.validParams.slug, req.validQuery.limit));
});

app.get('/api/products/:slug/frequently-bought', validateParams(schemas.slugParams), validateQuery(schemas.frequentQuery), (req, res) => {
  res.json(repository.frequentlyBought(req.validParams.slug));
});

app.get('/api/products/:slug', validateParams(schemas.slugParams), validateQuery(schemas.healthQuery), (req, res) => {
  const product = repository.findBySlug(req.validParams.slug);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  return res.json(product);
});

app.get('/api/collections/:collection', validateParams(schemas.collectionParams), validateQuery(schemas.collectionQuery), (req, res) => {
  res.json(repository.collections(req.validParams.collection, req.validQuery.limit));
});

app.get('/api/search/suggest', validateQuery(schemas.suggestQuery), (req, res) => {
  res.json(repository.suggest(req.validQuery.q, req.validQuery.limit));
});

app.get('/api/csrf', validateQuery(schemas.healthQuery), csrfTokenHandler);

app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.use(express.static(distDir, { index: false, fallthrough: true }));

app.get('*', (req, res) => {
  res.sendFile(join(distDir, 'index.html'), (error) => {
    if (!error) return;
    if (res.headersSent) return;
    res.status(404).type('text/plain').send('Client build missing — run `npm run build` first.');
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  console.error('[api] request failed:', error?.message ?? 'unknown error');
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

const invokedDirectly = process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (invokedDirectly) {
  const port = Number.parseInt(process.env.PORT, 10) || 3001;
  const server = app.listen(port, () => {
    console.log(`[soko] API + client listening on http://localhost:${port}`);
  });
  const shutdown = () => {
    server.close(() => {
      closeDatabase();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
