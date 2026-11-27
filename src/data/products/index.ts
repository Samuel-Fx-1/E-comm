import type { Product } from '../../types';
import { curatedProducts } from './curated';

/** The storefront now ships exactly the 20 curated products. */
export const products: Product[] = curatedProducts;

export const getProduct = (slug: string): Product | undefined =>
  products.find((product) => product.slug === slug);

export const getProductById = (id: string): Product | undefined =>
  products.find((product) => product.id === id);

export const bestSellers = products.filter((product) => product.isBestSeller);

export const deals = products.filter((product) => product.isDeal || product.discount > 0);

export const newArrivals = [...products].sort((a, b) => b.addedAt.localeCompare(a.addedAt));

export const trending = products.filter((product) => product.isTrending);

export const genZPicks = products.filter((product) => product.isGenZPick);

export const viral = products.filter((product) => product.isViral);

export const brands = [...new Set(products.map((product) => product.brand))].sort((a, b) =>
  a.localeCompare(b)
);

export { curatedProducts };
