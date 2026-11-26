/** Generates public/sitemap.xml from the static routes and product catalogue. */
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = readFileSync(join(root, 'src', 'config', 'site.ts'), 'utf8');
const base = (source.match(/url:\s*'([^']+)'/)?.[1] ?? 'https://soko.example.com').replace(/\/$/, '');
const productsDir = join(root, 'src', 'data', 'products');

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const slugs = [];
for (const file of readdirSync(productsDir).filter((name) => name.endsWith('.ts'))) {
  const data = readFileSync(join(productsDir, file), 'utf8');
  for (const match of data.matchAll(/title:\s*'((?:[^'\\]|\\.)*)'/g)) {
    slugs.push(slugify(match[1].replace(/\\'/g, "'")));
  }
}

const staticPaths = [
  '/', '/search', '/deals', '/best-sellers', '/new-arrivals', '/trending', '/customer-service', '/sell',
  '/category/tech-audio-accessories', '/category/apparel-footwear', '/category/skincare-personal-care',
  '/category/home-kitchen', '/category/digital', '/credits',
];
const paths = [...staticPaths, ...slugs.map((slug) => `/product/${slug}`)];
const today = new Date().toISOString().slice(0, 10);

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths.map((path) => `  <url>\n    <loc>${base}${path}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${path.startsWith('/product/') ? 'weekly' : 'daily'}</changefreq>\n    <priority>${path === '/' ? '1.0' : path.startsWith('/product/') ? '0.7' : '0.8'}</priority>\n  </url>`).join('\n')}
</urlset>
`;

mkdirSync(join(root, 'public'), { recursive: true });
writeFileSync(join(root, 'public', 'sitemap.xml'), xml, 'utf8');
console.log(`Wrote sitemap.xml with ${paths.length} URLs.`);
