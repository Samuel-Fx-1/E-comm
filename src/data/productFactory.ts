import type { CategorySlug, Product, ProductVariant } from '../types';
import { discountPercent } from '../lib/format';

export interface ProductSeed {
  title: string;
  brand: string;
  category: CategorySlug;
  subcategory?: string;
  price: number;
  listPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  bullets: string[];
  specs: Record<string, string>;
  shortDescription?: string;
  variants?: ProductVariant[];
  seller?: string;
  deliveryDays?: number;
  isBestSeller?: boolean;
  isDeal?: boolean;
  addedAt?: string;
}

const RWF_RATE = 1300;
const RWF_ROUNDING = 100;

const subcategories: Record<CategorySlug, string> = {
  electronics: 'Audio, video & accessories',
  'home-kitchen': 'Home & kitchen essentials',
  fashion: 'Clothing & accessories',
  beauty: 'Beauty & personal care',
  sports: 'Sports & outdoors',
  books: 'Books & learning',
  toys: 'Toys & games',
  groceries: 'Groceries & pantry',
};

const defaultVariants: Record<CategorySlug, ProductVariant[]> = {
  electronics: [
    { type: 'color', name: 'Colour', value: 'Black' },
    { type: 'color', name: 'Colour', value: 'White' },
  ],
  'home-kitchen': [{ type: 'color', name: 'Finish', value: 'Natural' }],
  fashion: [
    { type: 'size', name: 'Size', value: 'M' },
    { type: 'size', name: 'Size', value: 'L' },
    { type: 'color', name: 'Colour', value: 'Black' },
  ],
  beauty: [],
  sports: [
    { type: 'size', name: 'Size', value: 'M' },
    { type: 'size', name: 'Size', value: 'L' },
  ],
  books: [{ type: 'size', name: 'Format', value: 'Paperback' }],
  toys: [{ type: 'color', name: 'Colour', value: 'Multi' }],
  groceries: [{ type: 'size', name: 'Pack', value: 'Standard' }],
};

const toRwf = (usd: number): number => Math.round((usd * RWF_RATE) / RWF_ROUNDING) * RWF_ROUNDING;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function hash(text: string): number {
  let value = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value);
}

const BASE_DATE = new Date('2026-10-30T00:00:00Z').getTime();

export function makeProduct(seed: ProductSeed): Product {
  const slug = slugify(seed.title);
  const seedHash = hash(slug);
  const listPrice = seed.listPrice ?? seed.price;
  const daysAgo = seedHash % 210;
  const addedAt = seed.addedAt ?? new Date(BASE_DATE - daysAgo * 86_400_000).toISOString().slice(0, 10);

  const base = `/images/products/${seed.category}/${slug}`;
  const fallbackImages = [1, 2, 3, 4].map(
    (view) => `${base}-${view}.svg`
  );

  return {
    id: slug,
    slug,
    name: seed.title,
    title: seed.title,
    brand: seed.brand,
    category: seed.category,
    subcategory: seed.subcategory ?? subcategories[seed.category],
    priceRwf: toRwf(seed.price),
    oldPriceRwf: toRwf(listPrice),
    price: seed.price,
    listPrice,
    discount: discountPercent(seed.price, listPrice),
    rating: seed.rating,
    reviewCount: seed.reviewCount,
    stock: seed.stock,
    shortDescription: seed.shortDescription ?? seed.bullets[0] ?? '',
    images: fallbackImages,
    bullets: seed.bullets,
    specs: seed.specs,
    variants: seed.variants ?? defaultVariants[seed.category],
    seller: seed.seller ?? `${seed.brand} Official`,
    deliveryDays: seed.deliveryDays ?? 2 + (seedHash % 5),
    isBestSeller: seed.isBestSeller ?? false,
    isDeal: seed.isDeal ?? false,
    addedAt,
  };
}
