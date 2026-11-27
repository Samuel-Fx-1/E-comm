/**
 * Small in-memory snapshot cache for products that are not in the local curated
 * bundle. API responses register their products here so cart, wishlist, compare
 * and order data can still be resolved after navigation (or from an order placed
 * earlier in the same session).
 *
 * Everything stored here is plain product data from the API — no runtime API
 * calls are made by this module.
 */
import type { CartLine, Product } from '../types';

const snapshots = new Map<string, Product>();

/** Register a product (and both of its lookup keys) for later resolution. */
export function rememberProduct(product: Product | null | undefined): void {
  if (!product) return;
  if (product.id) snapshots.set(product.id, product);
  if (product.slug) snapshots.set(product.slug, product);
}

export function rememberProducts(list: Product[]): void {
  list.forEach(rememberProduct);
}

/** Resolve by id or slug from products registered by the API or the lazy catalog import. */
export function resolveProduct(idOrSlug: string): Product | undefined {
  return snapshots.get(idOrSlug);
}

/**
 * Cart lines carry their own snapshot when possible. The stored snapshot wins,
 * then the session cache.
 */
export function resolveLineProduct(
  line: Pick<CartLine, 'productId' | 'snapshot'>
): Product | undefined {
  return line.snapshot ?? resolveProduct(line.productId);
}
