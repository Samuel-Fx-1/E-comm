import { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, TrendingUp } from 'lucide-react';
import { categories } from '../../data/categories';
import { products } from '../../data/products';
import { productMatchesQuery } from '../../lib/search';
import { useDebouncedValue, useOnClickOutside } from '../../lib/hooks';
import { useSite } from '../../context/SiteContext';
import { useStore } from '../../context/StoreContext';
import { imagesFor } from '../../data/imageMap';
import { ImageWithFallback } from '../ui/ImageWithFallback';

export function SearchBox() {
  const { t, money } = useSite();
  const { addRecent } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounced = useDebouncedValue(query, 150);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (location.pathname === '/search') {
      setQuery(params.get('q') ?? '');
      setCategory(params.get('category') ?? 'all');
    }
  }, [location.pathname, location.search]);

  useOnClickOutside(wrapperRef, () => setOpen(false), open);

  const matches = useMemo(() => {
    if (!debounced.trim()) return [];
    return products.filter((product) => productMatchesQuery(product, debounced)).slice(0, 6);
  }, [debounced]);

  const categoryMatches = useMemo(() => {
    if (!debounced.trim()) return [];
    const needle = debounced.toLowerCase();
    return categories.filter((entry) => entry.name.toLowerCase().includes(needle)).slice(0, 3);
  }, [debounced]);

  const showPanel = open && debounced.trim().length > 0;

  const go = (path: string) => {
    setOpen(false);
    setActive(-1);
    navigate(path);
  };

  const buildSearchUrl = (searchTerm: string) => {
    const params = new URLSearchParams();
    if (searchTerm.trim()) params.set('q', searchTerm.trim());
    if (category !== 'all') params.set('category', category);
    return `/search?${params.toString()}`;
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (active >= 0 && matches[active]) {
      go(`/product/${matches[active].slug}`);
      return;
    }
    if (query.trim()) {
      go(buildSearchUrl(query));
    } else {
      setOpen(false);
      inputRef.current?.focus();
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <form
        role="search"
        onSubmit={submit}
        className="flex w-full overflow-hidden rounded-lg border-2 border-[var(--brand-orange)] bg-white shadow-sm focus-within:ring-2 focus-within:ring-[var(--brand-yellow)]/70"
      >
        <label htmlFor="site-search" className="sr-only">
          {t('search')}
        </label>
        <select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          aria-label={t('allCategories')}
          className="hidden max-w-[150px] shrink-0 cursor-pointer border-r border-[var(--brand-line)] bg-[var(--brand-cream)] px-2 text-xs font-semibold text-[var(--brand-ink)] outline-none sm:block"
        >
          <option value="all">{t('all')}</option>
          {categories.map((entry) => (
            <option key={entry.slug} value={entry.slug}>
              {entry.name}
            </option>
          ))}
        </select>
        <div className="relative flex-1">
          <input
            ref={inputRef}
            id="site-search"
            type="search"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `search-option-${active}` : undefined}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setOpen(true);
              setActive(-1);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                setOpen(true);
                setActive((current) => Math.min(current + 1, matches.length - 1));
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                setActive((current) => Math.max(current - 1, -1));
              } else if (event.key === 'Escape') {
                setOpen(false);
                setActive(-1);
              }
            }}
            placeholder={t('searchPlaceholder')}
            autoComplete="off"
            className="w-full bg-white px-3 py-2.5 text-sm text-[var(--brand-ink)] outline-none placeholder:text-[var(--brand-muted)]"
          />
        </div>
        <button
          type="submit"
          aria-label={t('search')}
          className="flex shrink-0 items-center justify-center bg-[var(--brand-orange)] px-4 text-white transition-colors hover:bg-[var(--brand-orange-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <Search className="h-5 w-5" aria-hidden="true" />
        </button>
      </form>

      {showPanel && (
        <div
          id="search-suggestions"
          role="listbox"
          aria-label="Search suggestions"
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-[70] max-h-[70vh] overflow-y-auto rounded-xl border border-[var(--brand-line)] bg-white py-2 shadow-2xl"
        >
          {categoryMatches.length > 0 && (
            <div className="border-b border-[var(--brand-line)] px-2 pb-2">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand-muted)]">
                {t('categories')}
              </p>
              {categoryMatches.map((entry) => (
                <button
                  key={entry.slug}
                  type="button"
                  onClick={() => go(`/category/${entry.slug}`)}
                  className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm text-[var(--brand-ink)] hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                >
                  <TrendingUp className="h-3.5 w-3.5 text-[var(--brand-orange)]" aria-hidden="true" />
                  {entry.name}
                </button>
              ))}
            </div>
          )}

          {matches.length > 0 ? (
            <div className="px-2 pt-1">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--brand-muted)]">
                Products
              </p>
              {matches.map((product, index) => (
                <button
                  key={product.id}
                  id={`search-option-${index}`}
                  type="button"
                  role="option"
                  aria-selected={active === index}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => {
                    addRecent(product.id);
                    go(`/product/${product.slug}`);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors ${
                    active === index ? 'bg-[var(--brand-cream)]' : 'hover:bg-[var(--brand-cream)]'
                  } focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]`}
                >
                  <ImageWithFallback
                    src={imagesFor(product)[0]}
                    alt=""
                    className="h-10 w-10 shrink-0 rounded-md object-cover"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-[var(--brand-ink)]">{product.title}</span>
                    <span className="block text-xs text-[var(--brand-muted)]">{product.brand}</span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-[var(--brand-ink)]">{money(product.price)}</span>
                </button>
              ))}
            </div>
          ) : (
            <p className="px-4 py-3 text-sm text-[var(--brand-muted)]">
              No quick matches for “{debounced.trim()}”. Try a different spelling.
            </p>
          )}

          <button
            type="button"
            onClick={() => go(buildSearchUrl(query))}
            className="mt-1 flex w-full items-center justify-between gap-2 border-t border-[var(--brand-line)] px-4 py-2.5 text-left text-sm font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            <span>See all results for “{query.trim()}”</span>
            <Search className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}
