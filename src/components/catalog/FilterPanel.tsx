import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, X } from 'lucide-react';
import type { CategorySlug, ProductFilters } from '../../types';
import { categories } from '../../data/categories';
import { classNames } from '../../lib/format';

interface FilterPanelProps {
  filters: ProductFilters;
  brands: string[];
  categoryCounts: Record<string, number>;
  priceBounds: { min: number; max: number };
  lockedCategory?: CategorySlug;
  onCategory: (category: CategorySlug | 'all') => void;
  onBrand: (brand: string, checked: boolean) => void;
  onPrice: (min: number, max: number) => void;
  onRating: (rating: number) => void;
  onToggleStock: () => void;
  onToggleDeals: () => void;
  onClear: () => void;
}

export function FilterPanel({
  filters,
  brands,
  categoryCounts,
  priceBounds,
  lockedCategory,
  onCategory,
  onBrand,
  onPrice,
  onRating,
  onToggleStock,
  onToggleDeals,
  onClear,
}: FilterPanelProps) {
  const [minDraft, setMinDraft] = useState(String(filters.min || priceBounds.min));
  const [maxDraft, setMaxDraft] = useState(String(filters.max || priceBounds.max));

  useEffect(() => {
    setMinDraft(String(filters.min || priceBounds.min));
    setMaxDraft(String(filters.max || priceBounds.max));
  }, [filters.min, filters.max, priceBounds.min, priceBounds.max]);
  const activeCount =
    (filters.category !== 'all' && !lockedCategory ? 1 : 0) +
    filters.brands.length +
    (filters.rating > 0 ? 1 : 0) +
    (filters.inStock ? 1 : 0) +
    (filters.dealsOnly ? 1 : 0) +
    (filters.min > priceBounds.min || filters.max < priceBounds.max ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-bold uppercase tracking-wide text-[var(--brand-ink)]">Filters</h2>
        {activeCount > 0 && (
          <button
            type="button"
            onClick={() => {
              onClear();
              setMinDraft(String(priceBounds.min));
              setMaxDraft(String(priceBounds.max));
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--brand-orange)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            <X className="h-3 w-3" aria-hidden="true" /> Clear ({activeCount})
          </button>
        )}
      </div>

      {!lockedCategory && (
        <fieldset>
          <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">Category</legend>
          <ul className="space-y-1">
            <li>
              <button
                type="button"
                onClick={() => onCategory('all')}
                aria-pressed={filters.category === 'all'}
                className={classNames(
                  'flex w-full items-center justify-between rounded px-1 py-1 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]',
                  filters.category === 'all'
                    ? 'font-bold text-[var(--brand-orange)]'
                    : 'text-[var(--brand-ink)] hover:text-[var(--brand-orange)]'
                )}
              >
                All categories
              </button>
            </li>
            {categories.map((category) => (
              <li key={category.slug}>
                <button
                  type="button"
                  onClick={() => onCategory(category.slug)}
                  aria-pressed={filters.category === category.slug}
                  className={classNames(
                    'flex w-full items-center justify-between rounded px-1 py-1 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]',
                    filters.category === category.slug
                      ? 'font-bold text-[var(--brand-orange)]'
                      : 'text-[var(--brand-ink)] hover:text-[var(--brand-orange)]'
                  )}
                >
                  <span>{category.name}</span>
                  <span className="text-xs text-[var(--brand-muted)]">{categoryCounts[category.slug] ?? 0}</span>
                </button>
              </li>
            ))}
          </ul>
        </fieldset>
      )}

      <fieldset className="border-t border-[var(--brand-line)] pt-4">
        <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">Price (RWF)</legend>
        <form
          className="flex items-center gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            const nextMin = Math.max(priceBounds.min, Number(minDraft) || priceBounds.min);
            const nextMax = Math.min(priceBounds.max, Number(maxDraft) || priceBounds.max);
            onPrice(Math.min(nextMin, nextMax), Math.max(nextMin, nextMax));
          }}
        >
          <label className="flex-1">
            <span className="sr-only">Minimum price</span>
            <input
              type="number"
              min={priceBounds.min}
              max={priceBounds.max}
              value={minDraft}
              onChange={(event) => setMinDraft(event.target.value)}
              className="w-full rounded-lg border border-[var(--brand-line)] bg-white px-2 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
            />
          </label>
          <span className="text-xs text-[var(--brand-muted)]">to</span>
          <label className="flex-1">
            <span className="sr-only">Maximum price</span>
            <input
              type="number"
              min={priceBounds.min}
              max={priceBounds.max}
              value={maxDraft}
              onChange={(event) => setMaxDraft(event.target.value)}
              className="w-full rounded-lg border border-[var(--brand-line)] bg-white px-2 py-1.5 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-[var(--brand-navy)] px-2.5 py-1.5 text-xs font-bold text-white hover:bg-[var(--brand-navy-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            Go
          </button>
        </form>
      </fieldset>

      <fieldset className="border-t border-[var(--brand-line)] pt-4">
        <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">Customer rating</legend>
        <div className="space-y-1">
          {[4, 3, 2].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => onRating(filters.rating === rating ? 0 : rating)}
              aria-pressed={filters.rating === rating}
              className={classNames(
                'flex w-full items-center gap-1.5 rounded px-1 py-1 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]',
                filters.rating === rating ? 'font-bold text-[var(--brand-orange)]' : 'text-[var(--brand-ink)] hover:text-[var(--brand-orange)]'
              )}
            >
              <span className="flex" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={classNames(
                      'h-3.5 w-3.5',
                      star <= rating ? 'fill-[var(--brand-orange)] text-[var(--brand-orange)]' : 'text-[var(--brand-line)]'
                    )}
                  />
                ))}
              </span>
              &amp; up
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-t border-[var(--brand-line)] pt-4">
        <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">Brand</legend>
        <div className="max-h-48 space-y-1 overflow-y-auto pr-1">
          {brands.map((brand) => (
            <label key={brand} className="flex items-center gap-2 rounded px-1 py-1 text-sm text-[var(--brand-ink)] hover:bg-[var(--brand-cream)]">
              <input
                type="checkbox"
                checked={filters.brands.includes(brand)}
                onChange={(event) => onBrand(brand, event.target.checked)}
                className="h-4 w-4 rounded border-[var(--brand-line)] accent-[var(--brand-orange)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
              />
              {brand}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2 border-t border-[var(--brand-line)] pt-4">
        <legend className="mb-2 text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">More</legend>
        <label className="flex items-center gap-2 text-sm text-[var(--brand-ink)]">
          <input
            type="checkbox"
            checked={filters.inStock}
            onChange={onToggleStock}
            className="h-4 w-4 rounded border-[var(--brand-line)] accent-[var(--brand-orange)]"
          />
          In stock only
        </label>
        <label className="flex items-center gap-2 text-sm text-[var(--brand-ink)]">
          <input
            type="checkbox"
            checked={filters.dealsOnly}
            onChange={onToggleDeals}
            className="h-4 w-4 rounded border-[var(--brand-line)] accent-[var(--brand-orange)]"
          />
          On sale
        </label>
      </fieldset>

      <div className="border-t border-[var(--brand-line)] pt-4 text-xs text-[var(--brand-muted)]">
        <p>
          Need help choosing? Visit{' '}
          <Link
            to="/customer-service"
            className="font-semibold text-[var(--brand-navy)] underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            Customer Service
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
