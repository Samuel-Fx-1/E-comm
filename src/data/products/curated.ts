/**
 * Backwards-compatible export. The catalog JSON files in data/catalog/ are the
 * single source of truth; this module keeps the existing import path working.
 */
export { catalogProducts as curatedProducts } from '../catalog';
