import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ChevronRight, LayoutGrid, List, SlidersHorizontal, X } from 'lucide-react';
import type { CategorySlug, ProductFilters } from '../types';
import { categories, getCategory } from '../data/categories';
import { products } from '../data/products';
import { filterProducts } from '../lib/search';
import { apiAvailable, fetchMeta, fetchProducts } from '../data/api';
import type { ApiMeta } from '../data/api';
import { useApiData } from '../hooks/useApiData';
import { useDebouncedValue } from '../lib/hooks';
import { site } from '../config/site';
import { useSite } from '../context/SiteContext';
import { ProductCard } from '../components/product/ProductCard';
import { FilterPanel } from '../components/catalog/FilterPanel';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { Pagination } from '../components/ui/Pagination';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EmptyState } from '../components/ui/EmptyState';
import { Seo } from '../components/ui/Seo';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { CategoryIcon } from '../components/ui/CategoryIcon';
import { classNames } from '../lib/format';

const SORTS: Array<{ value: ProductFilters['sort']; label: string }> = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Customer rating' },
  { value: 'newest', label: 'Newest arrivals' },
];

/** Bounded local fallback — only the 85 bundled products are ever scanned. */
const localBounds = {
  min: Math.floor(Math.min(...products.map((product) => product.price))),
  max: Math.ceil(Math.max(...products.map((product) => product.price))),
};

function localMeta(): ApiMeta {
  const brandCounts = new Map<string, number>();
  const categoryCounts = new Map<string, number>();
  products.forEach((product) => {
    brandCounts.set(product.brand, (brandCounts.get(product.brand) ?? 0) + 1);
    categoryCounts.set(product.category, (categoryCounts.get(product.category) ?? 0) + 1);
  });
  return {
    total: products.length,
    categories: categories.map((category) => ({
      slug: category.slug,
      name: category.name,
      count: categoryCounts.get(category.slug) ?? 0,
    })),
    brands: [...brandCounts].map(([name, count]) => ({ name, count })).sort((a, b) => a.name.localeCompare(b.name)),
    priceBounds: localBounds,
  };
}

export default function CatalogPage() {
  const params = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const { t, language } = useSite();
  const [minimumSkeleton, setMinimumSkeleton] = useState(true);
  const [firstRequestSettled, setFirstRequestSettled] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const lockedCategory = categories.some((category) => category.slug === params.slug)
    ? (params.slug as CategorySlug)
    : undefined;
  const categoryMeta = lockedCategory ? getCategory(lockedCategory) : undefined;

  const search = searchParams.toString();
  const query = searchParams.get('q') ?? '';
  const view = searchParams.get('view') === 'list' ? 'list' : 'grid';

  const metaState = useApiData(
    async () => {
      if (!(await apiAvailable())) throw new Error('API unavailable');
      return fetchMeta();
    },
    [],
    localMeta
  );
  const priceBounds = metaState.data.priceBounds;

  const filters = useMemo<ProductFilters>(() => {
    const sp = new URLSearchParams(search);
    const readNumber = (key: string, fallback: number) => {
      if (!sp.has(key)) return fallback;
      const raw = Number(sp.get(key));
      return Number.isFinite(raw) ? raw : fallback;
    };
    const categoryParam = sp.get('category');
    const sortParam = sp.get('sort');
    const sort: ProductFilters['sort'] = SORTS.some((entry) => entry.value === sortParam)
      ? (sortParam as ProductFilters['sort'])
      : 'featured';
    return {
      q: sp.get('q') ?? '',
      category:
        lockedCategory ??
        (categories.some((entry) => entry.slug === categoryParam) ? (categoryParam as CategorySlug) : 'all'),
      min: Math.max(priceBounds.min, readNumber('min', priceBounds.min)),
      max: Math.min(priceBounds.max, readNumber('max', priceBounds.max)),
      rating: Math.min(5, Math.max(0, readNumber('rating', 0))),
      brands: (sp.get('brands') ?? '').split(',').filter(Boolean),
      inStock: sp.get('inStock') === '1',
      dealsOnly: sp.get('deals') === '1',
      sort,
      page: Math.max(1, readNumber('page', 1)),
    };
  }, [search, lockedCategory, priceBounds.min, priceBounds.max]);

  const debouncedFilters = useDebouncedValue(filters, 250);

  const localResult = useMemo(
    () =>
      filterProducts(products, {
        ...debouncedFilters,
        min: Math.min(debouncedFilters.min, localBounds.max),
        max: Math.max(debouncedFilters.max, localBounds.min),
      }),
    [debouncedFilters]
  );

  const productLoader = useCallback(
    async (signal: AbortSignal) => {
      if (!(await apiAvailable())) throw new Error('API unavailable');
      return fetchProducts(
        {
          q: debouncedFilters.q,
          category: debouncedFilters.category,
          brands: debouncedFilters.brands,
          min: debouncedFilters.min,
          max: debouncedFilters.max,
          rating: debouncedFilters.rating,
          inStock: debouncedFilters.inStock,
          deals: debouncedFilters.dealsOnly,
          sort: debouncedFilters.sort,
          page: debouncedFilters.page,
          pageSize: site.productsPerPage,
        },
        signal
      );
    },
    [debouncedFilters]
  );

  const productState = useApiData(productLoader, [debouncedFilters], () => ({
    items: localResult.items,
    total: localResult.total,
    page: debouncedFilters.page,
    pageSize: site.productsPerPage,
    pageCount: localResult.pageCount,
  }));
  const result = productState.data;

  useEffect(() => {
    const timer = window.setTimeout(() => setMinimumSkeleton(false), 420);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!productState.loading) setFirstRequestSettled(true);
  }, [productState.loading]);

  useEffect(() => {
    if (filtersOpen) setFiltersOpen(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const update = (patch: Record<string, string | null>, resetPage = true) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(patch).forEach(([key, value]) => {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    });
    if (resetPage) next.delete('page');
    setSearchParams(next, { replace: true });
  };

  const clearFilters = () => {
    const next = new URLSearchParams();
    if (query) next.set('q', query);
    if (view === 'list') next.set('view', 'list');
    setSearchParams(next, { replace: true });
  };

  const currentPage = Math.min(filters.page, result.pageCount);
  const title = categoryMeta ? categoryMeta.name : query ? `Results for “${query}”` : 'All products';
  const start = result.items.length === 0 ? 0 : (currentPage - 1) * result.pageSize + 1;
  const end = Math.min(result.total, start + result.items.length - 1);

  const brands = metaState.data.brands.map((entry) => entry.name);
  const categoryCounts = Object.fromEntries(
    metaState.data.categories.map((entry) => [entry.slug, entry.count])
  );
  const activeFilterCount =
    (filters.category !== 'all' && !lockedCategory ? 1 : 0) +
    filters.brands.length +
    (filters.rating > 0 ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.dealsOnly ? 1 : 0) +
    (filters.min > priceBounds.min || filters.max < priceBounds.max ? 1 : 0);

  const filterPanel = (
    <FilterPanel
      filters={filters}
      brands={brands}
      categoryCounts={categoryCounts}
      priceBounds={priceBounds}
      lockedCategory={lockedCategory}
      onCategory={(nextCategory) => update({ category: nextCategory === 'all' ? null : nextCategory })}
      onBrand={(brand, checked) => {
        const nextBrands = checked
          ? [...filters.brands, brand]
          : filters.brands.filter((entry) => entry !== brand);
        update({ brands: nextBrands.join(',') || null });
      }}
      onPrice={(min, max) => update({ min: String(min), max: String(max) })}
      onRating={(rating) => update({ rating: rating > 0 ? String(rating) : null })}
      onToggleStock={() => update({ inStock: filters.inStock ? null : '1' })}
      onToggleDeals={() => update({ deals: filters.dealsOnly ? null : '1' })}
      onClear={clearFilters}
    />
  );

  const loading = minimumSkeleton || !firstRequestSettled;

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <Seo
        title={categoryMeta ? categoryMeta.name : query ? `Search: ${query}` : 'All products'}
        description={categoryMeta ? categoryMeta.blurb : 'Browse the full Soko demo catalogue.'}
        path={lockedCategory ? `/category/${lockedCategory}` : '/search'}
        noIndex={Boolean(query)}
      />

      <Breadcrumbs
        items={[
          { label: t('home'), to: '/' },
          ...(categoryMeta ? [{ label: 'Categories', to: '/search' }, { label: categoryMeta.name }] : [{ label: query ? 'Search results' : 'All products' }]),
        ]}
      />

      {categoryMeta ? (
        <header className={`mt-3 overflow-hidden rounded-2xl bg-gradient-to-br ${categoryMeta.gradient} px-5 py-7 text-white shadow-lg sm:px-8`}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10">
                <CategoryIcon name={categoryMeta.icon} className="h-7 w-7 text-[var(--brand-yellow)]" />
              </span>
              <div>
                <h1 className="font-serif text-3xl font-bold sm:text-4xl">{categoryMeta.name}</h1>
                <p className="mt-1 max-w-xl text-sm text-white/70">{categoryMeta.blurb}</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {categories
                .filter((entry) => entry.slug !== categoryMeta.slug)
                .slice(0, 3)
                .map((entry) => (
                  <Link
                    key={entry.slug}
                    to={`/category/${entry.slug}`}
                    className="rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)]"
                  >
                    {entry.name}
                  </Link>
                ))}
            </div>
          </div>
        </header>
      ) : (
        <header className="mt-3">
          <h1 className="font-serif text-3xl font-bold text-[var(--brand-ink)] sm:text-4xl">
            {query ? (
              <>
                Results for <span className="text-[var(--brand-orange)]">“{query}”</span>
              </>
            ) : (
              'All products'
            )}
          </h1>
          <p className="mt-1 text-sm text-[var(--brand-muted)]">
            {result.total.toLocaleString()} {t('results')} across {categories.length} departments. Prices shown in your selected currency.
          </p>
        </header>
      )}

      <div className="mt-6 flex flex-col gap-6 lg:flex-row">
        <aside className="hidden w-60 shrink-0 lg:block">
          <div className="sticky top-36 rounded-xl border border-[var(--brand-line)] bg-white p-4">
            {filterPanel}
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--brand-line)] bg-white px-3 py-2.5">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFiltersOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--brand-line)] px-3 py-1.5 text-xs font-semibold text-[var(--brand-ink)] hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)] lg:hidden"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden="true" /> Filters
                {activeFilterCount > 0 && (
                  <span className="grid h-4 min-w-4 place-items-center rounded-full bg-[var(--brand-orange)] px-1 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <p className="text-xs text-[var(--brand-muted)]">
                {result.total > 0 ? (
                  <>
                    Showing <span className="font-semibold text-[var(--brand-ink)]">{start}–{end}</span> of{' '}
                    <span className="font-semibold text-[var(--brand-ink)]">{result.total.toLocaleString()}</span>
                  </>
                ) : (
                  'No products match these filters'
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="flex items-center gap-1.5 text-xs text-[var(--brand-muted)]">
                Sort by
                <select
                  value={filters.sort}
                  onChange={(event) => update({ sort: event.target.value === 'featured' ? null : event.target.value })}
                  className="rounded-lg border border-[var(--brand-line)] bg-white px-2 py-1.5 text-xs font-semibold text-[var(--brand-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                >
                  {SORTS.map((entry) => (
                    <option key={entry.value} value={entry.value}>
                      {entry.label}
                    </option>
                  ))}
                </select>
              </label>
              <div className="flex items-center rounded-lg border border-[var(--brand-line)] p-0.5" role="group" aria-label="Layout">
                <button
                  type="button"
                  onClick={() => update({ view: null }, false)}
                  aria-pressed={view === 'grid'}
                  aria-label="Grid view"
                  className={classNames(
                    'rounded p-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]',
                    view === 'grid' ? 'bg-[var(--brand-navy)] text-white' : 'text-[var(--brand-muted)] hover:text-[var(--brand-ink)]'
                  )}
                >
                  <LayoutGrid className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={() => update({ view: 'list' }, false)}
                  aria-pressed={view === 'list'}
                  aria-label="List view"
                  className={classNames(
                    'rounded p-1.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]',
                    view === 'list' ? 'bg-[var(--brand-navy)] text-white' : 'text-[var(--brand-muted)] hover:text-[var(--brand-ink)]'
                  )}
                >
                  <List className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

          {activeFilterCount > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {filters.category !== 'all' && !lockedCategory && (
                <button
                  type="button"
                  onClick={() => update({ category: null })}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-line)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--brand-ink)] hover:border-[var(--brand-navy)]"
                >
                  {getCategory(filters.category)?.name} <X className="h-3 w-3" aria-hidden="true" />
                </button>
              )}
              {filters.brands.map((brand) => (
                <button
                  key={brand}
                  type="button"
                  onClick={() => update({ brands: filters.brands.filter((entry) => entry !== brand).join(',') || null })}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-line)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--brand-ink)] hover:border-[var(--brand-navy)]"
                >
                  {brand} <X className="h-3 w-3" aria-hidden="true" />
                </button>
              ))}
              {filters.rating > 0 && (
                <button
                  type="button"
                  onClick={() => update({ rating: null })}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-line)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--brand-ink)] hover:border-[var(--brand-navy)]"
                >
                  {filters.rating}★ &amp; up <X className="h-3 w-3" aria-hidden="true" />
                </button>
              )}
              {(filters.min > priceBounds.min || filters.max < priceBounds.max) && (
                <button
                  type="button"
                  onClick={() => update({ min: null, max: null })}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-line)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--brand-ink)] hover:border-[var(--brand-navy)]"
                >
                  ${filters.min}–${filters.max} <X className="h-3 w-3" aria-hidden="true" />
                </button>
              )}
              {filters.inStock && (
                <button
                  type="button"
                  onClick={() => update({ inStock: null })}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-line)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--brand-ink)] hover:border-[var(--brand-navy)]"
                >
                  In stock <X className="h-3 w-3" aria-hidden="true" />
                </button>
              )}
              {filters.dealsOnly && (
                <button
                  type="button"
                  onClick={() => update({ deals: null })}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-line)] bg-white px-2.5 py-1 text-xs font-medium text-[var(--brand-ink)] hover:border-[var(--brand-navy)]"
                >
                  On sale <X className="h-3 w-3" aria-hidden="true" />
                </button>
              )}
              <button
                type="button"
                onClick={clearFilters}
                className="text-xs font-semibold text-[var(--brand-orange)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
              >
                Clear all
              </button>
            </div>
          )}

          <div className="mt-4">
            {loading ? (
              <ProductGridSkeleton count={site.productsPerPage} layout={view} />
            ) : result.total === 0 ? (
              <EmptyState
                title={t('noResults')}
                description={`We could not find anything for “${query || categoryMeta?.name || 'these filters'}”. Try removing a filter or searching a different term.`}
                action={
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="outline" onClick={clearFilters}>
                      Clear filters
                    </Button>
                    <Link
                      to="/search"
                      className="inline-flex items-center justify-center rounded-lg bg-[var(--brand-orange)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-orange-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                    >
                      Browse everything
                    </Link>
                  </div>
                }
              />
            ) : (
              <div
                className={
                  view === 'grid'
                    ? 'grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4'
                    : 'space-y-4'
                }
              >
                {result.items.map((product, index) => (
                  <ProductCard key={product.id} product={product} layout={view} priority={index < 8} />
                ))}
              </div>
            )}
          </div>

          {!loading && result.total > 0 && (
            <div className="mt-8">
              <Pagination
                page={currentPage}
                pageCount={result.pageCount}
                onChange={(page) => {
                  update({ page: String(page) }, false);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                label="Product pages"
              />
              <p className="mt-3 text-center text-xs text-[var(--brand-muted)]">
                Page {currentPage} of {result.pageCount} · {language === 'fr' ? 'Prix en devise locale' : 'Prices in your local currency'}
              </p>
            </div>
          )}
        </div>
      </div>

      <Modal open={filtersOpen} onClose={() => setFiltersOpen(false)} title="Filter products" size="sm" footer={<Button fullWidth onClick={() => setFiltersOpen(false)}>Show {result.total.toLocaleString()} results</Button>}>
        {filterPanel}
      </Modal>

      {!lockedCategory && !query && (
        <nav aria-label="All departments" className="mt-10 rounded-xl border border-[var(--brand-line)] bg-white p-4">
          <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--brand-muted)]">Browse departments</h2>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {categories.map((entry) => (
              <li key={entry.slug}>
                <Link
                  to={`/category/${entry.slug}`}
                  className="flex items-center justify-between rounded-lg px-2 py-2 text-sm font-medium text-[var(--brand-ink)] hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                >
                  {entry.name}
                  <ChevronRight className="h-4 w-4 text-[var(--brand-muted)]" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}
