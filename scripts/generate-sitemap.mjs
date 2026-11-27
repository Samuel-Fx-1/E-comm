/** Generates public/sitemap.xml from the static routes and catalog JSON files. */
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = readFileSync(join(root, 'src', 'config', 'site.ts'), 'utf8');
const base = (source.match(/url:\s*'([^']+)'/)?.[1] ?? 'https://soko.example.com').replace(/\/$/, '');
const catalogDir = join(root, 'data', 'catalog');

/** Product slugs come from the validated catalog, not from source regexes. */
function readSlugs() {
  return readdirSync(catalogDir)
    .filter((name) => name.endsWith('.json'))
    .sort()
    .flatMap((name) => {
      const data = JSON.parse(readFileSync(join(catalogDir, name), 'utf8'));
      return data.products.map((product) => product.slug);
    });
}

const slugs = readSlugs();
if (new Set(slugs).size !== slugs.length) {
  throw new Error('Duplicate product slugs in catalog; run npm run validate');
}

const staticPaths = [
  '/', '/search', '/deals', '/best-sellers', '/new-arrivals', '/trending',
  '/gen-z-picks', '/viral', '/customer-service', '/sell',
  '/category/tech-gaming', '/category/streetwear-footwear', '/category/viral-skincare-haircare',
  '/category/lifestyle-aesthetic-essentials', '/category/gen-alpha-kids-corner', '/credits',
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
console.log(`Wrote sitemap.xml with ${paths.length} URLs from ${slugs.length} catalog products.`);
