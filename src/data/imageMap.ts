/**
 * Single image resolver for Soko. Gallery images come only from the catalog
 * JSON files; no generated SVG is padded into a photo slot. Manual photos in
 * data/image-overrides.json take priority over catalog photos.
 *
 * Pexels CDN URLs are hotlinked with 320/640/1200 srcset variants. Nothing here
 * calls an API at page load.
 */
import type { Product, ResolvedImage } from '../types';
import { catalogEntries, catalogEntryBySlug } from './catalog';
import type { CatalogImage } from './catalog';
import { products } from './products';
import overridesData from '../../data/image-overrides.json';

export interface ImageCredit {
  photoId?: string;
  photographer: string;
  photographerUrl: string;
  photoUrl: string;
  license: string;
  licenseUrl?: string;
  downloadLocation?: string;
}

interface OverrideEntry {
  images: string[];
  alt?: string;
  credit?: ImageCredit;
  illustrative?: boolean;
}

export interface ImageInfo extends ResolvedImage {
  /** Set only for manually supplied local photos. */
  fallbackSrc?: string;
}

const overrides = overridesData as Record<string, OverrideEntry>;

const IMAGE_SIZES: readonly number[] = [320, 640, 1200];
const CARD_SIZES = '(max-width: 640px) 46vw, (max-width: 1024px) 24vw, 240px';
const LARGE_SIZES = '(max-width: 768px) 100vw, 620px';

function srcSetFromUrls(build: (width: number) => string): string {
  return IMAGE_SIZES.map((width) => `${build(width)} ${width}w`).join(', ');
}

function pexelsSized(url: string, width: number): string {
  const sized = new URL(url);
  sized.searchParams.set('w', String(width));
  sized.searchParams.set('h', String(width));
  return sized.toString();
}

function catalogImageToImage(image: CatalogImage, product: Product, index: number): ResolvedImage {
  const isPexels = image.source === 'pexels';
  return {
    src: isPexels ? pexelsSized(image.url, 640) : image.url,
    srcSet: isPexels ? srcSetFromUrls((width) => pexelsSized(image.url, width)) : undefined,
    sizes: CARD_SIZES,
    alt: image.alt || `${product.name} — view ${index + 1}`,
    source: image.source,
    width: image.width,
    height: image.height,
    color: image.color,
    creditId: image.photoId,
  };
}

export function creditFromImage(image: CatalogImage): ImageCredit {
  return {
    photoId: image.photoId,
    photographer: image.photographer,
    photographerUrl: image.photographerUrl,
    photoUrl: image.photoUrl,
    license: image.license,
    licenseUrl: image.licenseUrl,
  };
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

/** Real gallery photos only; returns fewer than four entries when photos are missing. */
export function resolveImages(product: Product): ResolvedImage[] {
  const override = overrides[product.slug];
  if (override?.images?.length) {
    return override.images.map((path, index) => overrideToImage(path, override, product, index));
  }
  const entry = catalogEntryBySlug.get(product.slug);
  return entry?.images.map((image, index) => catalogImageToImage(image, product, index)) ?? [];
}

/** Backwards-compatible helper used by existing thumbnails and order history. */
export function imagesFor(product: Pick<Product, 'slug' | 'images' | 'name'>): string[] {
  const full = products.find((entry) => entry.slug === product.slug) ?? (product as Product);
  return resolveImages(full).map((image) => image.src);
}

/** Credit for the first gallery photo. */
export function creditFor(product: Product): ImageCredit | undefined {
  const override = overrides[product.slug];
  if (override?.credit) return override.credit;
  const entry = catalogEntryBySlug.get(product.slug);
  return entry?.images[0] ? creditFromImage(entry.images[0]) : undefined;
}

/** Credits aligned with the gallery order. */
export function creditsFor(product: Product): ImageCredit[] {
  const override = overrides[product.slug];
  if (override?.credit) {
    return resolveImages(product).map(() => override.credit!);
  }
  const entry = catalogEntryBySlug.get(product.slug);
  return entry?.images.map(creditFromImage) ?? [];
}

export function creditedProducts(): Array<{ product: Product; image: ResolvedImage; credit: ImageCredit }> {
  return products.flatMap((product) => {
    const images = resolveImages(product);
    const credits = creditsFor(product);
    if (!images[0] || !credits[0]) return [];
    return [{ product, image: images[0], credit: credits[0] }];
  });
}

/** Products that need manual photo replacement because the gallery is empty. */
export function fallbackProducts(): Product[] {
  return products.filter((product) => resolveImages(product).length === 0);
}

export function catalogImageQueries(slug: string): string[] {
  return catalogEntries.find((entry) => entry.slug === slug)?.imageQueries ?? [];
}

const infoBySrc = new Map<string, ImageInfo>();
for (const product of products) {
  resolveImages(product).forEach((image) => {
    infoBySrc.set(image.src, { ...image });
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
