/**
 * Resolves product images ONCE and caches the result in data/product-images.json.
 * It is never called from the browser or at page load.
 *
 * Providers:
 *   unsplash  hotlinked images.unsplash.com URLs + UTM attribution. Photos are
 *             NOT downloaded or rehosted. The download_location endpoint is
 *             fired for the main photo, as Unsplash's API guidelines require.
 *   pexels    API photos downloaded once, resized with sharp to 320/640/1200px
 *             WebP under public/products/<slug>/. Originals are never committed.
 *   pixabay   Same one-shot download + sharp WebP pipeline as Pexels. Pixabay's
 *             API terms forbid permanent hotlinking, so photos are stored locally
 *             and credited on product pages and /credits.
 *
 * Manual photos can be placed under public/products/<slug>/ and listed in
 * data/image-overrides.json; they take priority over all APIs at runtime.
 *
 * Usage:
 *   npm run images:fetch                       # Unsplash, resumable
 *   npm run images:fetch -- --limit 25         # stay inside a rate-limit window
 *   npm run images:fetch -- --provider pexels
 *   npm run images:fetch -- --provider pixabay
 *   npm run images:fetch -- --dry-run          # show queries, no network calls
 *
 * Keys are read from .env.local (or .env) on the server side only.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const productsDir = join(root, 'src', 'data', 'products');
const outputPath = join(root, 'data', 'product-images.json');
const overridesPath = join(root, 'data', 'image-overrides.json');
const localImageRoot = join(root, 'public', 'products');
mkdirSync(dirname(outputPath), { recursive: true });

const args = process.argv.slice(2);
const getValue = (name, fallback) => {
  const withEquals = args.find((arg) => arg.startsWith(`--${name}=`));
  if (withEquals) return withEquals.slice(name.length + 3);
  const index = args.indexOf(`--${name}`);
  const next = args[index + 1];
  return index >= 0 && next && !next.startsWith('--') ? next : fallback;
};
const hasFlag = (name) => args.includes(`--${name}`);
const providerArg = getValue('provider', 'unsplash').toLowerCase();
const limit = Math.max(1, Number(getValue('limit', '85')) || 85);
const delayMs = Math.max(250, Number(getValue('delay', '1500')) || 1500);
const dryRun = hasFlag('dry-run');
const retryFailed = hasFlag('retry-failed');

/** Minimal .env reader so keys never end up in the client bundle or in logs. */
function loadEnv() {
  const values = {};
  for (const file of ['.env.local', '.env']) {
    const path = join(root, file);
    if (!existsSync(path)) continue;
    for (const line of readFileSync(path, 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (match && !match[2].startsWith('#')) values[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
    }
  }
  return values;
}
const env = loadEnv();

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readProducts() {
  const products = [];
  for (const file of readdirSync(productsDir).filter((name) => name.endsWith('.ts'))) {
    const source = readFileSync(join(productsDir, file), 'utf8');
    for (const match of source.matchAll(/makeProduct\(\{([\s\S]*?)\}\)/g)) {
      const block = match[1];
      const titleMatch = block.match(/title:\s*(['"])((?:\\.|(?!\1).)*)\1/);
      const brandMatch = block.match(/brand:\s*(['"])((?:\\.|(?!\1).)*)\1/);
      const category = block.match(/category:\s*'([a-z-]+)'/)?.[1];
      if (!titleMatch || !category) continue;
      const title = titleMatch[2].replace(/\\(['"])/g, '$1');
      const brand = brandMatch?.[2] ?? '';
      // Fictional brands return no stock photos; search the descriptive name.
      const descriptive = title.replace(new RegExp(`^${brand}\\s+`, 'i'), '');
      products.push({
        slug: slugify(title),
        title,
        category,
        query: `${descriptive} ${category.replace(/-/g, ' ')}`.trim(),
        fallbackQuery: category.replace(/-/g, ' '),
      });
    }
  }
  return products;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const UTM = 'utm_source=soko-demo&utm_medium=referral&utm_campaign=product-credits';
const withUtm = (url) => `${url}${url.includes('?') ? '&' : '?'}${UTM}`;

function ageCheck(products) {
  const slugs = new Set(products.map((product) => product.slug));
  if (slugs.size !== products.length) {
    console.warn(`Warning: ${products.length - slugs.size} duplicate product slug(s).`);
  }
}

function ensureEntries(cache, products) {
  for (const product of products) {
    if (!cache.products[product.slug]) {
      cache.products[product.slug] = {
        title: product.title,
        category: product.category,
        query: product.query,
        status: 'pending',
        source: 'generated',
        reason: 'Not resolved yet',
        images: [],
      };
    }
  }
}

function saveCache(cache) {
  cache.generatedAt = new Date().toISOString();
  writeFileSync(`${outputPath}.tmp`, `${JSON.stringify(cache, null, 2)}\n`, 'utf8');
  renameSync(`${outputPath}.tmp`, outputPath);
}

/** Pixabay reports a 60-second window; stay well inside it. */
const rateGate = { remaining: Infinity, reset: 0 };

async function apiFetch(url, options, attempts = 3) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    if (rateGate.remaining <= 2 && rateGate.reset > 0) {
      const waitMs = Math.min(rateGate.reset * 1000, 120_000);
      console.warn(`  rate window almost exhausted; waiting ${Math.round(waitMs / 1000)}s`);
      await sleep(waitMs);
      rateGate.remaining = Infinity;
      rateGate.reset = 0;
    }
    let response;
    try {
      response = await fetch(url, options);
    } catch (error) {
      lastError = error;
      await sleep(delayMs * (attempt + 1));
      continue;
    }
    if (response.status === 401 || response.status === 403) {
      const error = new Error(`AUTH_INVALID (HTTP ${response.status})`);
      error.auth = true;
      throw error;
    }
    if (response.status === 429 || response.status >= 500) {
      const retryAfter = Number(response.headers.get('x-ratelimit-reset') || response.headers.get('retry-after') || 0);
      const waitMs = Math.min(Math.max(retryAfter * 1000, delayMs * (attempt + 1)), 120_000);
      lastError = new Error(`HTTP ${response.status}`);
      if (attempt < attempts - 1) {
        console.warn(`  throttled (${response.status}); waiting ${Math.round(waitMs / 1000)}s`);
        await sleep(waitMs);
        continue;
      }
      const error = new Error(`RATE_LIMITED (HTTP ${response.status})`);
      error.rateLimited = true;
      throw error;
    }
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const remainingHeader = response.headers.get('x-ratelimit-remaining');
    const resetHeader = response.headers.get('x-ratelimit-reset');
    if (remainingHeader !== null && Number.isFinite(Number(remainingHeader))) rateGate.remaining = Number(remainingHeader);
    if (resetHeader !== null && Number.isFinite(Number(resetHeader))) rateGate.reset = Number(resetHeader);
    return { response, data: await response.json(), headers: response.headers };
  }
  throw lastError ?? new Error('Request failed');
}

const peopleWords = /\b(person|people|man|woman|male|female|face|portrait|model|child|kid|baby|selfie|crowd|boy|girl|human|teenager|hands?)\b/i;
/** Pixabay forbids commercial use of recognisable brands, so drop branded tags. */
const brandWords = /\b(airpod|iphone|ipad|ipod|samsung|nike|adidas|puma|sony|huawei|xiaomi|google|microsoft|nintendo|playstation|xbox|disney|coca-?cola|pepsi|logo|brand|trademark|starbucks|tesla|rolex|gucci|chanel)\b/i;

function unsplashImage(photo, alt) {
  return {
    source: 'unsplash',
    photoId: photo.id,
    baseUrl: String(photo.urls?.raw ?? '').split('?')[0],
    alt: alt || photo.alt_description || photo.description || '',
    width: photo.width || 1200,
    height: photo.height || 1200,
    color: photo.color || undefined,
    credit: {
      photographer: photo.user?.name || 'Unsplash contributor',
      photographerUrl: withUtm(photo.user?.links?.html || 'https://unsplash.com'),
      photoUrl: withUtm(photo.links?.html || `https://unsplash.com/photos/${photo.id}`),
      license: 'Unsplash License',
      licenseUrl: 'https://unsplash.com/license',
    },
  };
}

function pickUnsplash(results) {
  return results
    .filter((photo) => photo.urls?.raw && photo.width >= photo.height * 0.7)
    .filter((photo) => !peopleWords.test(`${photo.alt_description ?? ''} ${photo.description ?? ''}`))
    .slice(0, 4)
    .map((photo) => unsplashImage(photo, ''));
}

async function resolveUnsplash(product, key, cache) {
  const headers = { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' };
  const search = async (query) => {
    const url = new URL('https://api.unsplash.com/search/photos');
    url.searchParams.set('query', query);
    url.searchParams.set('per_page', '8');
    url.searchParams.set('orientation', 'squarish');
    return apiFetch(url.toString(), { headers });
  };

  let results = (await search(product.query)).data.results ?? [];
  let images = pickUnsplash(results);
  if (images.length === 0 && product.fallbackQuery !== product.query) {
    await sleep(delayMs);
    results = (await search(product.fallbackQuery)).data.results ?? [];
    images = pickUnsplash(results);
  }
  if (images.length === 0) return { status: 'unmatched', reason: 'No suitable photo without people', images: [] };

  // Guidelines: notify Unsplash when a photo is selected for a product.
  let downloadLocation;
  let downloadError;
  try {
    const response = await fetch(`https://api.unsplash.com/photos/${images[0].photoId}/download`, { method: 'POST', headers });
    if (response.ok) {
      const payload = await response.json();
      downloadLocation = payload.url;
    } else {
      downloadError = `HTTP ${response.status}`;
    }
  } catch (error) {
    downloadError = error instanceof Error ? error.message : String(error);
  }
  images[0].credit.downloadLocation = downloadLocation;

  return {
    status: 'resolved',
    source: 'unsplash',
    images: images.map((image, index) => ({ ...image, alt: `${product.title} — view ${index + 1}` })),
    downloadFired: Boolean(downloadLocation),
    downloadError,
  };
}

async function saveWebp(buffer, destination, size, position = 'attention') {
  await sharp(buffer)
    .rotate()
    .resize(size, size, { fit: 'cover', position })
    .webp({ quality: 82, effort: 4 })
    .toFile(destination);
}

async function resolvePexels(product, key) {
  const headers = { Authorization: key };
  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', product.query);
  url.searchParams.set('per_page', '4');
  url.searchParams.set('orientation', 'square');
  const { data } = await apiFetch(url.toString(), { headers });
  const hits = (data.photos ?? []).filter((photo) => !peopleWords.test(`${photo.alt ?? ''}`));
  if (hits.length === 0) return { status: 'unmatched', reason: 'No suitable Pexels photo', images: [] };

  const directory = join(localImageRoot, product.slug);
  mkdirSync(directory, { recursive: true });
  const images = [];
  for (const [index, photo] of hits.slice(0, 4).entries()) {
    const source = photo.src?.large ?? photo.src?.medium ?? photo.src?.original;
    if (!source) continue;
    const response = await fetch(source);
    if (!response.ok) continue;
    const buffer = Buffer.from(await response.arrayBuffer());
    const paths = [];
    for (const size of [320, 640, 1200]) {
      const filename = `pexels-${photo.id}-${size}.webp`;
      await saveWebp(buffer, join(directory, filename), size);
      paths.push(`/products/${product.slug}/${filename}`);
    }
    images.push({
      source: 'pexels',
      paths,
      alt: `${product.title} — view ${index + 1}`,
      width: 1200,
      height: 1200,
      credit: {
        photographer: photo.photographer || 'Pexels contributor',
        photographerUrl: withUtm(photo.photographer_url || 'https://www.pexels.com'),
        photoUrl: withUtm(photo.url || `https://www.pexels.com/photo/${photo.id}/`),
        license: 'Pexels License',
        licenseUrl: 'https://www.pexels.com/license/',
      },
    });
  }
  if (images.length === 0) return { status: 'unmatched', reason: 'Pexels photo downloads failed', images: [] };
  return { status: 'resolved', source: 'pexels', images };
}

const CROP_POSITIONS = ['top', 'right', 'bottom', 'left'];

/** Pixabay: download once, store optimised WebP locally, credit the contributor. */
async function resolvePixabay(product, key) {
  const seenIds = new Set();
  const seenQueries = new Set();
  const hits = [];

  for (const query of [product.query, product.fallbackQuery]) {
    if (hits.length >= 4 || seenQueries.has(query)) continue;
    seenQueries.add(query);
    const url = new URL('https://pixabay.com/api/');
    url.searchParams.set('key', key);
    url.searchParams.set('q', query);
    url.searchParams.set('image_type', 'photo');
    url.searchParams.set('safesearch', 'true');
    url.searchParams.set('lang', 'en');
    url.searchParams.set('order', 'popular');
    url.searchParams.set('per_page', '20');
    const { data } = await apiFetch(url.toString());
    for (const hit of data.hits ?? []) {
      if (hits.length >= 4) break;
      if (!hit.pageURL || !hit.largeImageURL || seenIds.has(hit.id)) continue;
      if (Number(hit.imageWidth) < 600 || Number(hit.imageHeight) < 600) continue;
      const text = `${hit.tags ?? ''} ${hit.pageURL}`;
      if (peopleWords.test(text) || brandWords.test(text)) continue;
      seenIds.add(hit.id);
      hits.push(hit);
    }
  }
  if (hits.length === 0) return { status: 'unmatched', reason: 'No suitable Pixabay photo without people or brands', images: [] };

  const directory = join(localImageRoot, product.slug);
  mkdirSync(directory, { recursive: true });
  const buffers = new Map();
  const images = [];

  for (let index = 0; index < 4; index += 1) {
    const hit = hits[index % hits.length];
    const reusing = index >= hits.length;
    const position = reusing ? CROP_POSITIONS[(index - hits.length) % CROP_POSITIONS.length] : 'attention';
    const view = reusing ? `crop${index + 1}` : `photo${index + 1}`;

    let buffer = buffers.get(hit.id);
    if (!buffer) {
      const response = await fetch(hit.largeImageURL);
      if (!response.ok) continue;
      buffer = Buffer.from(await response.arrayBuffer());
      buffers.set(hit.id, buffer);
    }

    const paths = [];
    for (const size of [320, 640, 1200]) {
      const filename = `pixabay-${hit.id}-${view}-${size}.webp`;
      await saveWebp(buffer, join(directory, filename), size, position);
      paths.push(`/products/${product.slug}/${filename}`);
    }

    images.push({
      source: 'pixabay',
      photoId: String(hit.id),
      paths,
      alt: `${product.title} — view ${index + 1}`,
      width: 1200,
      height: 1200,
      credit: {
        photographer: hit.user || 'Pixabay contributor',
        photographerUrl: withUtm(`https://pixabay.com/users/${encodeURIComponent(hit.user || 'pixabay')}-${hit.user_id || ''}/`),
        photoUrl: withUtm(hit.pageURL),
        license: 'Pixabay Content License',
        licenseUrl: 'https://pixabay.com/service/license/',
      },
    });
  }

  if (images.length === 0) return { status: 'unmatched', reason: 'Pixabay photo downloads failed', images: [] };
  return { status: 'resolved', source: 'pixabay', images };
}

async function main() {
  const products = readProducts();
  ageCheck(products);
  const cache = existsSync(outputPath)
    ? JSON.parse(readFileSync(outputPath, 'utf8'))
    : { version: 1, terms: {}, products: {} };
  cache.version = 1;
  cache.terms = {
    unsplash: {
      source: 'https://unsplash.com/developers',
      guidelines: 'https://help.unsplash.com/en/articles/2511245-unsplash-api-guidelines',
      license: 'https://unsplash.com/license',
      hotlinkOnly: true,
      attribution: 'Photographer + Unsplash links with UTM parameters are shown on product pages and /credits.',
    },
    pexels: {
      source: 'https://www.pexels.com/api/documentation/',
      license: 'https://www.pexels.com/license/',
      hotlinkOnly: false,
      attribution: 'Photographer/source links are stored in data/product-images.json.',
    },
    pixabay: {
      source: 'https://pixabay.com/api/docs/',
      license: 'https://pixabay.com/service/license/',
      hotlinkOnly: false,
      attribution: 'Pixabay asks that the source be shown; contributor + photo links appear on product pages and /credits.',
      cacheHours: 24,
      rateLimit: '100 requests per 60 seconds',
    },
  };
  ensureEntries(cache, products);

  if (dryRun) {
    for (const product of products) console.log(`${product.slug}: ${product.query}`);
    saveCache(cache);
    console.log(`Dry run: ${products.length} queries prepared; no API calls made.`);
    return;
  }

  const keyNames = { unsplash: 'UNSPLASH_ACCESS_KEY', pexels: 'PEXELS_API_KEY', pixabay: 'PIXABAY_API_KEY' };
  const keyName = keyNames[providerArg];
  if (!keyName) {
    console.error(`Unknown provider "${providerArg}". Use unsplash, pexels or pixabay.`);
    process.exitCode = 1;
    return;
  }
  const key = env[keyName]?.trim();
  if (!key) {
    saveCache(cache);
    console.error(`${keyName} is not set in .env.local. See .env.local.example.`);
    process.exitCode = 1;
    return;
  }

  const todo = products.filter((product) => {
    const entry = cache.products[product.slug];
    return entry.status === 'pending' || (retryFailed && entry.status === 'unmatched');
  }).slice(0, limit);
  console.log(`${todo.length} product(s) to resolve with ${providerArg}; ${products.length - todo.length} already cached.`);

  let resolved = 0;
  let unmatched = 0;
  for (const [index, product] of todo.entries()) {
    cache.products[product.slug].query = product.query;
    console.log(`[${index + 1}/${todo.length}] ${product.slug}`);
    try {
      const result = providerArg === 'pexels'
        ? await resolvePexels(product, key)
        : providerArg === 'pixabay'
          ? await resolvePixabay(product, key)
          : await resolveUnsplash(product, key, cache);
      cache.products[product.slug] = {
        ...cache.products[product.slug],
        title: product.title,
        category: product.category,
        ...result,
        resolvedAt: new Date().toISOString(),
      };
      if (result.status === 'resolved') resolved += 1;
      else unmatched += 1;
    } catch (error) {
      if (error.auth) {
        cache.products[product.slug].reason = 'API key rejected';
        saveCache(cache);
        console.error(`\n${keyName} was rejected by the provider. Re-run after updating .env.local.`);
        console.error('Progress was saved; finished products will not be re-fetched.');
        process.exitCode = 1;
        return;
      }
      if (error.rateLimited) {
        cache.products[product.slug].reason = 'Rate limited — re-run to continue';
        saveCache(cache);
        console.error('\nRate limit reached. Progress was saved; re-run this command later.');
        process.exitCode = 1;
        return;
      }
      cache.products[product.slug] = {
        ...cache.products[product.slug],
        status: 'unmatched',
        reason: error instanceof Error ? error.message : String(error),
      };
      unmatched += 1;
    }
    saveCache(cache);
    if (index < todo.length - 1) await sleep(delayMs);
  }

  const gaps = products.filter((product) => cache.products[product.slug]?.status !== 'resolved');
  console.log(`\nResolved ${resolved}, unmatched ${unmatched}, still using generated art: ${gaps.length}.`);
  if (gaps.length > 0) {
    console.log('Products still falling back:');
    for (const product of gaps) console.log(`  - ${product.slug} (${cache.products[product.slug]?.reason ?? 'pending'})`);
  }
  console.log(`Overrides file: ${overridesPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
