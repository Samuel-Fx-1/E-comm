/**
 * Single image resolver for Soko. Photos are resolved once by
 * scripts/fetch-product-images.mjs and cached in data/product-images.json;
 * nothing here calls an API at page load.
 *
 * Priority: data/image-overrides.json (your own photos) → cached API photos →
 * bundled SVG artwork. Unsplash URLs are hotlinked, never rehosted.
 */
import type { Product, ResolvedImage } from '../types';
import { products } from './products';
import imageCache from '../../data/product-images.json';
import overridesData from '../../data/image-overrides.json';

export interface ImageCredit {
  photographer: string;
  photographerUrl: string;
  photoUrl: string;
  license: string;
  licenseUrl?: string;
  downloadLocation?: string;
}

interface CachedImage {
  source: 'unsplash' | 'pexels' | 'pixabay';
  photoId?: string;
  baseUrl?: string;
  paths?: string[];
  alt: string;
  width: number;
  height: number;
  color?: string;
  credit: ImageCredit;
}

interface CachedEntry {
  title: string;
  category: string;
  status: 'pending' | 'resolved' | 'unmatched';
  source: string;
  reason?: string;
  images: CachedImage[];
}

interface OverrideEntry {
  images: string[];
  alt?: string;
  credit?: ImageCredit;
  illustrative?: boolean;
}

export interface ImageInfo extends ResolvedImage {
  /** Bundled artwork to use if a remote photo fails to load. */
  fallbackSrc?: string;
}

const cache = imageCache as unknown as { products: Record<string, CachedEntry> };
const overrides = overridesData as Record<string, OverrideEntry>;

const IMAGE_SIZES: readonly number[] = [320, 640, 1200];
const CARD_SIZES = '(max-width: 640px) 46vw, (max-width: 1024px) 24vw, 240px';
const LARGE_SIZES = '(max-width: 768px) 100vw, 620px';

function unsplashUrl(base: string, width: number, height: number, blur = false): string {
  const url = new URL(base);
  url.searchParams.set('fit', 'crop');
  url.searchParams.set('crop', 'entropy');
  url.searchParams.set('w', String(width));
  url.searchParams.set('h', String(height));
  url.searchParams.set('q', blur ? '35' : String(width <= 320 ? 70 : width <= 640 ? 78 : 82));
  url.searchParams.set('fm', 'webp');
  if (blur) url.searchParams.set('blur', '200');
  return url.toString();
}

function srcSetFromUrls(build: (width: number) => string): string {
  return IMAGE_SIZES.map((width) => `${build(width)} ${width}w`).join(', ');
}

function cachedToImage(image: CachedImage, product: Product, index: number): ResolvedImage | undefined {
  const alt = image.alt || `${product.name} — view ${index + 1}`;
  if (image.source === 'unsplash') {
    if (!image.baseUrl) return undefined;
    return {
      src: unsplashUrl(image.baseUrl, 640, 640),
      srcSet: srcSetFromUrls((width) => unsplashUrl(image.baseUrl!, width, width)),
      sizes: CARD_SIZES,
      alt,
      source: 'unsplash',
      width: 1200,
      height: 1200,
      blurSrc: unsplashUrl(image.baseUrl, 32, 32, true),
      color: image.color,
      creditId: image.photoId,
    };
  }
  if (image.source === 'pexels' || image.source === 'pixabay') {
    const paths = image.paths ?? [];
    if (paths.length === 0) return undefined;
    const byWidth = new Map(IMAGE_SIZES.map((width, position) => [width, paths[position] ?? paths[paths.length - 1]]));
    return {
      src: byWidth.get(640)!,
      srcSet: srcSetFromUrls((width) => byWidth.get(width)!),
      sizes: CARD_SIZES,
      alt,
      source: image.source,
      width: 1200,
      height: 1200,
      color: image.color,
      creditId: image.photoId,
    };
  }
  return undefined;
}

function overrideToImage(path: string, entry: OverrideEntry, product: Product, index: number): ResolvedImage {
  const sized = IMAGE_SIZES.map((width) => {
    const candidate = path.replace(/\.\w+$/, `-${width}.webp`);
    return candidate === path ? undefined : candidate;
  });
  const hasSrcSet = sized.every(Boolean);
  return {
    src: hasSrcSet ? sized[1]! : path,
    srcSet: hasSrcSet ? srcSetFromUrls((width) => sized[IMAGE_SIZES.indexOf(width)]!) : undefined,
    sizes: CARD_SIZES,
    alt: entry.alt || `${product.name} — view ${index + 1}`,
    source: 'override',
    width: 1200,
    height: 1200,
    illustrative: entry.illustrative,
  };
}

function generatedImages(product: Product): ResolvedImage[] {
  return product.images.map((path, index) => ({
    src: path,
    alt: `${product.name} — view ${index + 1}`,
    source: 'generated',
    width: 800,
    height: 800,
  }));
}

/** Main image plus gallery views; always at least four entries. */
export function resolveImages(product: Product): ResolvedImage[] {
  const generated = generatedImages(product);
  const override = overrides[product.slug];
  let selected: ResolvedImage[] = [];

  if (override?.images?.length) {
    selected = override.images.map((path, index) => overrideToImage(path, override, product, index));
  } else {
    const entry = cache.products?.[product.slug];
    if (entry?.status === 'resolved' && entry.images?.length) {
      selected = entry.images
        .map((image, index) => cachedToImage(image, product, index))
        .filter((image): image is ResolvedImage => Boolean(image));
    }
  }

  const images: ResolvedImage[] = [];
  for (let index = 0; index < Math.max(4, selected.length); index += 1) {
    images.push(selected[index] ?? generated[index] ?? generated[generated.length - 1]);
  }
  return images;
}

/** Backwards-compatible helper used by existing thumbnails and order history. */
export function imagesFor(product: Pick<Product, 'slug' | 'images' | 'name'>): string[] {
  const full = products.find((entry) => entry.slug === product.slug) ?? (product as Product);
  return resolveImages(full).map((image) => image.src);
}

export function creditFor(product: Product): ImageCredit | undefined {
  const override = overrides[product.slug];
  if (override?.credit) return override.credit;
  const entry = cache.products?.[product.slug];
  return entry?.status === 'resolved' ? entry.images?.[0]?.credit : undefined;
}

export function creditedProducts(): Array<{ product: Product; image: ResolvedImage; credit: ImageCredit }> {
  return products.flatMap((product) => {
    const credit = creditFor(product);
    if (!credit) return [];
    return [{ product, image: resolveImages(product)[0], credit }];
  });
}

export function fallbackProducts(): Product[] {
  return products.filter((product) => resolveImages(product)[0].source === 'generated');
}

const infoBySrc = new Map<string, ImageInfo>();
for (const product of products) {
  const resolved = resolveImages(product);
  resolved.forEach((image, index) => {
    infoBySrc.set(image.src, { ...image, fallbackSrc: product.images[index] ?? product.images[0] });
  });
}

/** Curated API products use /products/<slug>/pixabay-<id>-<view>-<size>.webp. */
const PIXABAY_PATH = /^\/products\/([^/]+)\/pixabay-[^/]+-[^/]+-\d+\.webp$/;

function pixabayInfo(src: string): ImageInfo | undefined {
  const match = PIXABAY_PATH.exec(src);
  if (!match) return undefined;
  const base = src.replace(/-\d+\.webp$/, '');
  return {
    src,
    srcSet: IMAGE_SIZES.map((width) => `${base}-${width}.webp ${width}w`).join(', '),
    sizes: CARD_SIZES,
    alt: match[1].replace(/-/g, ' '),
    source: 'pixabay',
    width: 1200,
    height: 1200,
  };
}

/** Lets ImageWithFallback add responsive metadata from a plain src string. */
export function imageInfo(src: string): ImageInfo | undefined {
  return infoBySrc.get(src) ?? pixabayInfo(src);
}

export { CARD_SIZES as cardSizes, LARGE_SIZES as largeSizes };
