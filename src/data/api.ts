/**
 * Typed, same-origin client for the Soko product API.
 *
 * Every request is best-effort: callers use `apiAvailable()` and/or the
 * `useApiData` hook, which fall back to the bundled catalogue when the API is
 * down (for example a static `npm run preview`). Fetched products are cached in
 * `productLookup` so generated products can still be shown from cart/order data.
 */
import type { CategorySlug, Product } from '../types';
import { rememberProducts } from './productLookup';

export interface ApiMeta {
  total: number;
  categories: Array<{ slug: string; name: string; count: number }>;
  brands: Array<{ name: string; count: number }>;
  priceBounds: { min: number; max: number };
}

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface ProductQuery {
  q?: string;
  category?: CategorySlug | string;
  brands?: string[];
  min?: number;
  max?: number;
  rating?: number;
  inStock?: boolean;
  deals?: boolean;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest' | string;
  page?: number;
  pageSize?: number;
}

export type CollectionName = 'deals' | 'best-sellers' | 'new-arrivals' | 'featured' | 'trending';

const API_BASE = '/api';
const HEALTH_TIMEOUT_MS = 3000;

let availability: Promise<boolean> | undefined;

function addParam(params: URLSearchParams, key: string, value: string | number | boolean | undefined | null): void {
  if (value === undefined || value === null || value === '') return;
  params.set(key, String(value));
}

function productQueryString(filters: ProductQuery): string {
  const params = new URLSearchParams();
  addParam(params, 'q', filters.q?.trim());
  addParam(params, 'category', filters.category && filters.category !== 'all' ? filters.category : undefined);
  addParam(params, 'brands', filters.brands?.length ? filters.brands.join(',') : undefined);
  addParam(params, 'min', filters.min);
  addParam(params, 'max', filters.max);
  addParam(params, 'rating', filters.rating && filters.rating > 0 ? filters.rating : undefined);
  addParam(params, 'inStock', filters.inStock ? 1 : undefined);
  addParam(params, 'deals', filters.deals ? 1 : undefined);
  addParam(params, 'sort', filters.sort && filters.sort !== 'featured' ? filters.sort : undefined);
  addParam(params, 'page', filters.page);
  addParam(params, 'pageSize', filters.pageSize);
  return params.toString();
}

async function getJson<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    signal,
    headers: { Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`API request failed (${response.status})`);
  return (await response.json()) as T;
}

function cacheItems(items: Product[] | undefined): Product[] {
  const safe = Array.isArray(items) ? items : [];
  rememberProducts(safe);
  return safe;
}

/**
 * Cached health check. A failed or absent API resolves to `false`, never an
 * exception, so the UI can switch to bundled data immediately.
 */
export function apiAvailable(): Promise<boolean> {
  if (availability) return availability;
  availability = (async () => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), HEALTH_TIMEOUT_MS);
    try {
      const health = await getJson<{ ok?: boolean; total?: number }>('/health', controller.signal);
      return Boolean(health.ok);
    } catch {
      return false;
    } finally {
      clearTimeout(timer);
    }
  })();
  return availability;
}

export async function fetchMeta(signal?: AbortSignal): Promise<ApiMeta> {
  return getJson<ApiMeta>('/meta', signal);
}

export async function fetchProducts(filters: ProductQuery = {}, signal?: AbortSignal): Promise<ProductPage> {
  const page = await getJson<ProductPage>(`/products?${productQueryString(filters)}`, signal);
  const items = cacheItems(page.items);
  return {
    items,
    total: page.total ?? items.length,
    page: page.page ?? filters.page ?? 1,
    pageSize: page.pageSize ?? filters.pageSize ?? items.length,
    pageCount: page.pageCount ?? 1,
  };
}

export async function fetchProductBySlug(slug: string, signal?: AbortSignal): Promise<Product> {
  const product = await getJson<Product>(`/products/${encodeURIComponent(slug)}`, signal);
  rememberProducts([product]);
  return product;
}

export async function fetchProductById(id: string, signal?: AbortSignal): Promise<Product> {
  const product = await getJson<Product>(`/products/id/${encodeURIComponent(id)}`, signal);
  rememberProducts([product]);
  return product;
}

export async function fetchCollection(
  name: CollectionName,
  limit = 12,
  signal?: AbortSignal
): Promise<Product[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  const items = await getJson<Product[]>(`/collections/${name}?${params.toString()}`, signal);
  return cacheItems(items);
}

export async function fetchRelated(slug: string, limit = 6, signal?: AbortSignal): Promise<Product[]> {
  const params = new URLSearchParams({ limit: String(limit) });
  const items = await getJson<Product[]>(
    `/products/${encodeURIComponent(slug)}/related?${params.toString()}`,
    signal
  );
  return cacheItems(items);
}

export async function fetchFrequentlyBought(slug: string, signal?: AbortSignal): Promise<Product[]> {
  const items = await getJson<Product[]>(
    `/products/${encodeURIComponent(slug)}/frequently-bought`,
    signal
  );
  return cacheItems(items);
}

export async function fetchSuggestions(q: string, limit = 6, signal?: AbortSignal): Promise<Product[]> {
  const params = new URLSearchParams({ q, limit: String(limit) });
  const items = await getJson<Product[]>(`/search/suggest?${params.toString()}`, signal);
  return cacheItems(items);
}
