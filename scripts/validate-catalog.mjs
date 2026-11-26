#!/usr/bin/env node
/**
 * Validates data/catalog/*.json before seeding or shipping.
 *
 * Run `npm run validate` (or `npm test`). Use `--skip-network` for offline
 * structural checks; the default run verifies every image URL responds with an
 * image content type.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const CATALOG_DIR = join(ROOT, 'data', 'catalog');
const REJECTS_PATH = join(ROOT, 'data', 'image-rejects.json');
const SKIP_NETWORK = process.argv.includes('--skip-network');

const CATEGORY_SLUGS = [
  'tech-gaming', 'streetwear-footwear', 'viral-skincare-haircare',
  'lifestyle-aesthetic-essentials', 'gen-alpha-kids-corner',
];

const errors = [];
const fail = (message) => errors.push(message);

const urlSchema = z.string().url();
const imageSchema = z.object({
  source: z.literal('pexels'),
  photoId: z.string().regex(/^\d+$/, 'photoId must be a Pexels photo id'),
  url: urlSchema,
  alt: z.string().min(3),
  photographer: z.string().min(2),
  photographerUrl: urlSchema,
  photoUrl: urlSchema,
  license: z.string().min(2),
  licenseUrl: urlSchema.optional(),
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  color: z.string().optional(),
});
const flagsSchema = z.object({
  isBestSeller: z.boolean(),
  isDeal: z.boolean(),
  isTrending: z.boolean(),
  isGenZPick: z.boolean(),
  isViral: z.boolean(),
});
const variantSchema = z.object({
  type: z.enum(['color', 'size']),
  name: z.string().min(1),
  value: z.string().min(1),
});
const productSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  name: z.string().min(2),
  brand: z.string().min(2),
  category: z.enum(CATEGORY_SLUGS),
  subcategory: z.string().min(2),
  price: z.number().int().positive(),
  listPrice: z.number().int().positive(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().nonnegative(),
  stock: z.number().int().nonnegative(),
  shortDescription: z.string(),
  bullets: z.array(z.string().min(5)).min(3).max(5),
  specs: z.record(z.string(), z.string().min(1)).refine((value) => Object.keys(value).length >= 4, {
    message: 'at least four spec rows are required',
  }),
  variants: z.array(variantSchema),
  seller: z.string().min(2),
  deliveryDays: z.number().int().positive(),
  addedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  flags: flagsSchema,
  imageQueries: z.array(z.string().min(3)).length(4),
  images: z.array(imageSchema),
});
const fileSchema = z.object({
  category: z.enum(CATEGORY_SLUGS),
  name: z.string().min(2),
  products: z.array(productSchema).min(1),
});

const MEDICAL_CLAIMS = ['cures', 'treats', 'clinically proven', 'medical grade'];
const SAFETY_CLAIMS = ['ce certified', 'child-safe certified'];
const BLOCKED_BRANDS = [
  'apple', 'airpods', 'iphone', 'samsung', 'sony', 'bose', 'nike', 'adidas', 'dyson',
  'nintendo', 'lego', 'barbie', 'disney', 'coca-cola', 'starbucks', 'tesla', 'spotify',
  'whatsapp', 'google', 'amazon', 'microsoft', 'xiaomi', 'anker',
];
const MERCH_FLAGS = ['isBestSeller', 'isTrending', 'isGenZPick', 'isViral'];

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    fail(`${path}: invalid JSON (${error.message})`);
    return null;
  }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function hasClaim(text, terms) {
  return terms.find((term) => new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i').test(text));
}

function productText(product) {
  return [
    product.name,
    product.brand,
    product.shortDescription,
    ...product.bullets,
    ...Object.values(product.specs),
  ].join(' ').toLowerCase();
}

function sentences(product) {
  return [product.shortDescription, ...product.bullets]
    .flatMap((text) => text.split(/[.!?]+/))
    .map((sentence) => sentence.trim().toLowerCase())
    .filter((sentence) => sentence.length > 12);
}

function normalizedPhotoUrl(url) {
  const parsed = new URL(url);
  return `${parsed.origin}${parsed.pathname}`;
}

function loadProducts() {
  const files = readdirSync(CATALOG_DIR).filter((name) => name.endsWith('.json')).sort();
  const products = [];
  for (const file of files) {
    const raw = readJson(join(CATALOG_DIR, file));
    if (!raw) continue;
    const parsed = fileSchema.safeParse(raw);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        fail(`${file}: ${issue.path.join('.') || 'root'} — ${issue.message}`);
      }
      continue;
    }
    const expectedCategory = file.replace(/\.json$/, '');
    if (parsed.data.category !== expectedCategory) {
      fail(`${file}: category is ${parsed.data.category}, expected ${expectedCategory}`);
    }
    for (const product of parsed.data.products) {
      if (product.category !== expectedCategory) {
        fail(`${product.slug}: category ${product.category} does not match ${file}`);
      }
      products.push({ ...product, file });
    }
  }
  return { files, products };
}

function checkProductRules(products, rejects) {
  const bySlug = new Map();
  const byName = new Map();
  const photoUrls = new Map();
  const sentenceOwners = new Map();

  for (const product of products) {
    bySlug.set(product.slug, [...(bySlug.get(product.slug) ?? []), product.file]);
    byName.set(product.name.toLowerCase(), [...(byName.get(product.name.toLowerCase()) ?? []), product.slug]);

    if (product.price < 1_000 || product.price > 1_500_000) {
      fail(`${product.slug}: price ${product.price} RWF is outside 1,000–1,500,000`);
    }
    if (product.listPrice < product.price) {
      fail(`${product.slug}: listPrice is lower than price`);
    }
    const descriptionLength = product.shortDescription.length;
    if (descriptionLength < 90 || descriptionLength > 160) {
      fail(`${product.slug}: description has ${descriptionLength} characters, expected 90–160`);
    }

    const text = productText(product);
    const medical = hasClaim(text, MEDICAL_CLAIMS);
    if (medical) fail(`${product.slug}: medical claim found ("${medical}")`);
    const safety = hasClaim(text, SAFETY_CLAIMS);
    if (safety) fail(`${product.slug}: safety-certification claim found ("${safety}")`);
    const brand = hasClaim(text, BLOCKED_BRANDS);
    if (brand) fail(`${product.slug}: blocked real brand found ("${brand}")`);

    for (const sentence of new Set(sentences(product))) {
      const owners = sentenceOwners.get(sentence) ?? new Set();
      owners.add(product.slug);
      sentenceOwners.set(sentence, owners);
    }

    if (product.images.length < 4) {
      fail(`${product.slug}: has ${product.images.length} image(s), expected at least 4`);
    }
    for (const image of product.images) {
      if (rejects.has(image.photoId)) {
        fail(`${product.slug}: uses rejected photo id ${image.photoId}`);
      }
      const key = normalizedPhotoUrl(image.url);
      const previous = photoUrls.get(key);
      if (previous) {
        fail(`${product.slug}: reuses image URL already used by ${previous} (${key})`);
      } else {
        photoUrls.set(key, product.slug);
      }
    }
  }

  for (const [slug, files] of bySlug) {
    if (files.length > 1) fail(`duplicate slug "${slug}" in ${files.join(', ')}`);
  }
  for (const [name, slugs] of byName) {
    if (slugs.length > 1) fail(`duplicate product name "${name}" used by ${slugs.join(', ')}`);
  }
  for (const [sentence, owners] of sentenceOwners) {
    if (owners.size > 2) {
      fail(`sentence repeated across ${owners.size} products: "${sentence}"`);
    }
  }

  const total = products.length;
  for (const flag of MERCH_FLAGS) {
    const count = products.filter((product) => product.flags[flag]).length;
    const min = total >= 100 ? Math.floor(total * 0.08) : 1;
    const max = total >= 100 ? Math.ceil(total * 0.25) : Math.ceil(total * 0.4);
    if (count < min || count > max) {
      fail(`${flag}: ${count} product(s) is outside the sensible range ${min}–${max}`);
    }
  }

  const categories = new Map();
  for (const product of products) {
    categories.set(product.category, [...(categories.get(product.category) ?? []), product]);
  }
  for (const [category, entries] of categories) {
    if (entries.length < 20) continue;
    const flagged = entries.filter((product) => MERCH_FLAGS.some((flag) => product.flags[flag])).length;
    const ratio = flagged / entries.length;
    if (ratio > 0.4) {
      fail(`${category}: ${flagged}/${entries.length} products are flagged (${Math.round(ratio * 100)}%, max 40%)`);
    }
  }

  return photoUrls;
}

async function checkImages(photoUrls) {
  if (SKIP_NETWORK) {
    console.log('Image URL checks skipped (--skip-network).');
    return;
  }
  let checked = 0;
  for (const [url, slug] of photoUrls) {
    let verified = false;
    for (const method of ['HEAD', 'GET']) {
      try {
        const response = await fetch(url, {
          method,
          signal: AbortSignal.timeout(12_000),
          headers: { 'user-agent': 'Soko catalog validator' },
        });
        if (response.status === 405 && method === 'HEAD') continue;
        const contentType = response.headers.get('content-type') ?? '';
        if (!response.ok) {
          fail(`${slug}: image URL returned HTTP ${response.status} (${url})`);
          verified = true;
          break;
        }
        if (!contentType.toLowerCase().startsWith('image/')) {
          fail(`${slug}: image URL content-type is ${contentType || 'missing'} (${url})`);
          verified = true;
          break;
        }
        verified = true;
        if (method === 'GET') await response.body?.cancel();
        break;
      } catch (error) {
        if (method === 'GET') fail(`${slug}: image URL could not be checked (${error.message})`);
      }
    }
    if (verified) checked += 1;
  }
  console.log(`Checked ${checked} unique image URL(s).`);
}

async function main() {
  const rejectsRaw = readJson(REJECTS_PATH) ?? { photoIds: [] };
  const rejects = new Set(Array.isArray(rejectsRaw.photoIds) ? rejectsRaw.photoIds : []);
  const { files, products } = loadProducts();
  const photoUrls = checkProductRules(products, rejects);
  await checkImages(photoUrls);

  console.log(`Validated ${products.length} product(s) across ${files.length} catalog file(s).`);
  if (errors.length > 0) {
    console.error(`\nCatalog validation failed with ${errors.length} error(s):`);
    for (const error of errors) console.error(`  - ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log('Catalog validation passed.');
}

await main();
