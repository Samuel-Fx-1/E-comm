import type { CategorySlug, Product, ProductVariant } from '../types';
import { makeProduct } from './productFactory';
import techGaming from '../../data/catalog/tech-gaming.json';
import streetwearFootwear from '../../data/catalog/streetwear-footwear.json';
import viralSkincareHaircare from '../../data/catalog/viral-skincare-haircare.json';
import lifestyleEssentials from '../../data/catalog/lifestyle-aesthetic-essentials.json';
import kidsCorner from '../../data/catalog/gen-alpha-kids-corner.json';

export interface CatalogImage {
  source: 'pexels';
  photoId: string;
  url: string;
  alt: string;
  photographer: string;
  photographerUrl: string;
  photoUrl: string;
  license: string;
  licenseUrl?: string;
  width: number;
  height: number;
  color?: string;
}

export interface CatalogProduct {
  slug: string;
  name: string;
  brand: string;
  category: CategorySlug;
  subcategory: string;
  price: number;
  listPrice: number;
  rating: number;
  reviewCount: number;
  stock: number;
  shortDescription: string;
  bullets: string[];
  specs: Record<string, string>;
  variants: ProductVariant[];
  seller: string;
  deliveryDays: number;
  addedAt: string;
  flags: {
    isBestSeller: boolean;
    isDeal: boolean;
    isTrending: boolean;
    isGenZPick: boolean;
    isViral: boolean;
  };
  imageQueries: string[];
  images: CatalogImage[];
}

interface CatalogFile {
  category: CategorySlug;
  name: string;
  products: CatalogProduct[];
}

const files = [
  techGaming,
  streetwearFootwear,
  viralSkincareHaircare,
  lifestyleEssentials,
  kidsCorner,
] as CatalogFile[];

/** Raw JSON entries, used by the validator, image pipeline and review page. */
export const catalogEntries: CatalogProduct[] = files.flatMap((file) => file.products);

/** Hydrated products used by the client and the database seeder. */
export const catalogProducts: Product[] = catalogEntries.map((entry) =>
  makeProduct({
    title: entry.name,
    brand: entry.brand,
    category: entry.category,
    subcategory: entry.subcategory,
    price: entry.price,
    listPrice: entry.listPrice,
    rating: entry.rating,
    reviewCount: entry.reviewCount,
    stock: entry.stock,
    bullets: entry.bullets,
    specs: entry.specs,
    shortDescription: entry.shortDescription,
    variants: entry.variants,
    seller: entry.seller,
    deliveryDays: entry.deliveryDays,
    isBestSeller: entry.flags.isBestSeller,
    isDeal: entry.flags.isDeal,
    isTrending: entry.flags.isTrending,
    isGenZPick: entry.flags.isGenZPick,
    isViral: entry.flags.isViral,
    addedAt: entry.addedAt,
  })
);

export const catalogEntryBySlug = new Map(catalogEntries.map((entry) => [entry.slug, entry]));
