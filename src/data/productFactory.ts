import type { CategorySlug, Product } from '../types';
import { discountPercent } from '../lib/format';

export interface ProductSeed {
  title: string;
  brand: string;
  category: CategorySlug;
  price: number;
  listPrice?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  bullets: string[];
  specs: Record<string, string>;
  seller?: string;
  deliveryDays?: number;
  isBestSeller?: boolean;
  isDeal?: boolean;
  addedAt?: string;
}

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

  return {
    id: slug,
    slug,
    title: seed.title,
    brand: seed.brand,
    category: seed.category,
    price: seed.price,
    listPrice,
    discount: discountPercent(seed.price, listPrice),
    rating: seed.rating,
    reviewCount: seed.reviewCount,
    stock: seed.stock,
    images: [`/images/products/${slug}-1.svg`, `/images/products/${slug}-2.svg`],
    bullets: seed.bullets,
    specs: seed.specs,
    seller: seed.seller ?? `${seed.brand} Official`,
    deliveryDays: seed.deliveryDays ?? 2 + (seedHash % 5),
    isBestSeller: seed.isBestSeller ?? false,
    isDeal: seed.isDeal ?? false,
    addedAt,
  };
}
