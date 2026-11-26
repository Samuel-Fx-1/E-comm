/**
 * Rebuilds data/product-images.json from the catalog JSON files.
 * The catalog files are the source of truth; this cache is a derived,
 * human-readable record of Pexels photo credits and CDN URLs.
 */
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CATALOG_DIR = join(ROOT, 'data', 'catalog');
const OUTPUT = join(ROOT, 'data', 'product-images.json');
const SIZES = [320, 640, 1200];

function sizedUrl(url, width) {
  const parsed = new URL(url);
  parsed.searchParams.set('w', String(width));
  parsed.searchParams.set('h', String(width));
  return parsed.toString();
}

const products = {};
for (const file of readdirSync(CATALOG_DIR).filter((name) => name.endsWith('.json')).sort()) {
  const payload = JSON.parse(readFileSync(join(CATALOG_DIR, file), 'utf8'));
  for (const product of payload.products) {
    products[product.slug] = {
      title: product.name,
      category: product.category,
      status: product.images.length >= 4 ? 'resolved' : 'partial',
      source: 'pexels',
      queries: product.imageQueries,
      images: product.images.map((image) => ({
        source: 'pexels',
        photoId: image.photoId,
        paths: SIZES.map((width) => sizedUrl(image.url, width)),
        alt: image.alt,
        width: image.width,
        height: image.height,
        color: image.color,
        credit: {
          photographer: image.photographer,
          photographerUrl: image.photographerUrl,
          photoUrl: image.photoUrl,
          license: image.license,
          licenseUrl: image.licenseUrl,
        },
      })),
    };
  }
}

const output = {
  version: 3,
  terms: {
    pexels: {
      source: 'https://www.pexels.com/api/documentation/',
      license: 'https://www.pexels.com/license/',
      hotlinkOnly: true,
      attribution: 'Photographer and Pexels photo links are stored here and in data/catalog/*.json.',
    },
  },
  products,
};

writeFileSync(OUTPUT, `${JSON.stringify(output, null, 2)}\n`);
console.log(`Wrote ${Object.keys(products).length} product image records to data/product-images.json`);
