import type { Product, ProductFilters } from '../types';
import { site } from '../config/site';

export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function productMatchesQuery(product: Product, query: string): boolean {
  const q = normalize(query);
  if (!q) return true;
  const haystack = [
    product.title,
    product.brand,
    product.category.replace('-', ' '),
    product.seller,
    ...product.bullets,
    ...Object.values(product.specs),
  ]
    .join(' ')
    .toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  return terms.every((term) => haystack.includes(term));
}

export interface FacetResult {
  items: Product[];
  total: number;
  pageCount: number;
  brands: string[];
  categoryCounts: Record<string, number>;
  priceMin: number;
  priceMax: number;
}

export function filterProducts(all: Product[], filters: ProductFilters): FacetResult {
  const queryMatched = all.filter((p) => productMatchesQuery(p, filters.q));

  const categoryScoped = queryMatched.filter(
    (p) => filters.category === 'all' || p.category === filters.category
  );

  const brands = [...new Set(categoryScoped.map((p) => p.brand))].sort((a, b) => a.localeCompare(b));

  const categoryCounts: Record<string, number> = {};
  for (const product of queryMatched) {
    categoryCounts[product.category] = (categoryCounts[product.category] ?? 0) + 1;
  }

  const priceMin = Math.floor(Math.min(...all.map((p) => p.price)));
  const priceMax = Math.ceil(Math.max(...all.map((p) => p.price)));

  let items = categoryScoped.filter((product) => {
    if (product.price < filters.min || product.price > filters.max) return false;
    if (filters.rating > 0 && product.rating < filters.rating) return false;
    if (filters.brands.length > 0 && !filters.brands.includes(product.brand)) return false;
    if (filters.inStock && product.stock <= 0) return false;
    if (filters.dealsOnly && !product.isDeal && product.discount <= 0) return false;
    return true;
  });

  switch (filters.sort) {
    case 'price-asc':
      items = [...items].sort((a, b) => a.price - b.price);
      break;
    case 'price-desc':
      items = [...items].sort((a, b) => b.price - a.price);
      break;
    case 'rating':
      items = [...items].sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case 'newest':
      items = [...items].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
      break;
    default:
      items = [...items].sort((a, b) => {
        const score = (p: Product) =>
          (p.isBestSeller ? 2 : 0) +
          (p.isGenZPick ? 2 : 0) +
          (p.isTrending ? 1 : 0) +
          (p.isViral ? 1 : 0) +
          (p.isDeal ? 1 : 0) +
          p.rating / 5;
        return score(b) - score(a);
      });
  }

  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / site.productsPerPage));
  const page = Math.min(Math.max(1, filters.page), pageCount);
  const start = (page - 1) * site.productsPerPage;
  const paged = items.slice(start, start + site.productsPerPage);

  return { items: paged, total, pageCount, brands, categoryCounts, priceMin, priceMax };
}

export function relatedProducts(all: Product[], product: Product, limit = 6): Product[] {
  return all
    .filter((p) => p.id !== product.id)
    .map((p) => {
      let score = p.category === product.category ? 3 : 0;
      if (p.brand === product.brand) score += 1;
      score += p.rating / 10;
      return { product: p, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((entry) => entry.product);
}

export function frequentlyBoughtTogether(all: Product[], product: Product): Product[] {
  const sameCategory = all.filter(
    (p) => p.category === product.category && p.id !== product.id && p.stock > 0
  );
  const others = all.filter(
    (p) => p.category !== product.category && p.isBestSeller && p.stock > 0
  );
  return [...sameCategory.slice(0, 2), ...others.slice(0, 1)].slice(0, 3);
}
