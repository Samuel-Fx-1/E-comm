import type { Product } from '../../types';
import { electronics } from './electronics';
import { homeKitchen } from './home-kitchen';
import { fashion } from './fashion';
import { beauty } from './beauty';
import { sports } from './sports';
import { books } from './books';
import { toys } from './toys';
import { groceries } from './groceries';
import { trendingProducts } from './trending';

export const products: Product[] = [
  ...electronics,
  ...homeKitchen,
  ...fashion,
  ...beauty,
  ...sports,
  ...books,
  ...toys,
  ...groceries,
  ...trendingProducts,
];

export const getProduct = (slug: string): Product | undefined =>
  products.find((product) => product.slug === slug);

export const getProductById = (id: string): Product | undefined =>
  products.find((product) => product.id === id);

export const bestSellers = products.filter((product) => product.isBestSeller);

export const deals = products.filter((product) => product.isDeal || product.discount > 0);

export const newArrivals = [...products].sort((a, b) => b.addedAt.localeCompare(a.addedAt));

export const trending = products.filter((product) => product.isTrending);

export const brands = [...new Set(products.map((product) => product.brand))].sort((a, b) =>
  a.localeCompare(b)
);

export { electronics, homeKitchen, fashion, beauty, sports, books, toys, groceries, trendingProducts };
