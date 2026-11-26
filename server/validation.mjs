/** zod validation for every API route. Query values arrive as strings. */
import { z } from 'zod';

const single = (value) => (Array.isArray(value) ? value[0] : value);
const toNumber = (value) => {
  const raw = single(value);
  if (raw === undefined || raw === null || raw === '') return undefined;
  const parsed = Number(raw);
  return Number.isNaN(parsed) ? raw : parsed;
};
const toInteger = (value) => {
  const parsed = toNumber(value);
  return typeof parsed === 'number' && !Number.isInteger(parsed) ? Math.trunc(parsed) : parsed;
};

const optionalString = (schema) => z.preprocess(single, schema.optional());
const optionalNumber = (schema) => z.preprocess(toNumber, schema.optional());
const optionalInteger = (schema) => z.preprocess(toInteger, schema.optional());
const limitParam = (fallback) => z.preprocess(toInteger, z.number().int().min(1).max(48).default(fallback));

const SORTS = ['featured', 'price-asc', 'price-desc', 'rating', 'newest'];
const CATEGORIES = [
  'all', 'tech-gaming', 'streetwear-footwear', 'viral-skincare-haircare',
  'lifestyle-aesthetic-essentials', 'gen-alpha-kids-corner',
];

export const schemas = {
  healthQuery: z.object({}),
  metaQuery: z.object({}),
  productQuery: z.object({
    q: optionalString(z.string().trim().max(120)),
    category: optionalString(z.enum(CATEGORIES)),
    brands: optionalString(z.string().max(1000)),
    min: optionalNumber(z.number().finite().min(0).max(1_500_000)),
    max: optionalNumber(z.number().finite().min(0).max(1_500_000)),
    rating: optionalNumber(z.number().min(0).max(5)),
    inStock: optionalString(z.enum(['0', '1'])),
    deals: optionalString(z.enum(['0', '1'])),
    genZPick: optionalString(z.enum(['0', '1'])),
    viral: optionalString(z.enum(['0', '1'])),
    sort: optionalString(z.enum(SORTS)),
    page: optionalInteger(z.number().int().min(1).max(1_000_000)),
    pageSize: optionalInteger(z.number().int().min(1).max(48)),
  }),
  collectionParams: z.object({
    collection: z.enum([
      'deals', 'best-sellers', 'new-arrivals', 'featured', 'trending', 'gen-z-picks', 'viral',
    ]),
  }),
  collectionQuery: z.object({ limit: limitParam(12) }),
  slugParams: z.object({ slug: z.string().trim().min(1).max(200) }),
  idParams: z.object({ id: z.string().trim().min(1).max(200) }),
  relatedQuery: z.object({ limit: limitParam(6) }),
  frequentQuery: z.object({}),
  suggestQuery: z.object({ q: z.preprocess(single, z.string().trim().min(1).max(120)), limit: limitParam(6) }),
};

function formatIssues(error) {
  return error.issues.map((issue) => ({
    field: issue.path.join('.') || 'request',
    message: issue.message,
  }));
}

export function validateQuery(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid query', issues: formatIssues(parsed.error) });
    }
    req.validQuery = parsed.data;
    return next();
  };
}

export function validateParams(schema) {
  return (req, res, next) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid path parameters', issues: formatIssues(parsed.error) });
    }
    req.validParams = parsed.data;
    return next();
  };
}
