import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ShoppingCart } from 'lucide-react';
import type { Product } from '../../types';
import { products as allProducts } from '../../data/products';
import { apiAvailable, fetchFrequentlyBought } from '../../data/api';
import { useApiData } from '../../hooks/useApiData';
import { frequentlyBoughtTogether } from '../../lib/search';
import { imagesFor } from '../../data/imageMap';
import { useStore } from '../../context/StoreContext';
import { useSite } from '../../context/SiteContext';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { Button } from '../ui/Button';

export function FrequentlyBoughtTogether({ product }: { product: Product }) {
  const state = useApiData(
    async (signal) => {
      if (!(await apiAvailable())) throw new Error('API unavailable');
      return fetchFrequentlyBought(product.slug, signal);
    },
    [product.slug],
    () => frequentlyBoughtTogether(allProducts, product)
  );
  const companions = state.data;
  const { addToCart } = useStore();
  const { money } = useSite();
  const [selected, setSelected] = useState<string[]>(() => companions.map((entry) => entry.id));

  useEffect(() => {
    setSelected(companions.map((entry) => entry.id));
  }, [companions]);

  if (companions.length === 0) return null;

  const chosen = companions.filter((entry) => selected.includes(entry.id));
  const total = product.price + chosen.reduce((sum, entry) => sum + entry.price, 0);

  return (
    <section aria-labelledby="fbt-heading" className="rounded-2xl border border-[var(--brand-line)] bg-white p-4 sm:p-5">
      <h2 id="fbt-heading" className="font-serif text-xl font-bold text-[var(--brand-ink)]">
        Frequently bought together
      </h2>
      <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center">
        <div className="flex flex-wrap items-center gap-2">
          <div className="w-24 text-center">
            <ImageWithFallback src={imagesFor(product)[0]} alt={product.title} className="h-24 w-24 rounded-lg object-cover" />
            <p className="mt-1 line-clamp-2 text-[11px] font-medium text-[var(--brand-ink)]">This item</p>
          </div>
          {companions.map((entry) => (
            <div key={entry.id} className="flex items-center gap-2">
              <Plus className="h-4 w-4 shrink-0 text-[var(--brand-muted)]" aria-hidden="true" />
              <label className="w-24 cursor-pointer text-center">
                <ImageWithFallback src={imagesFor(entry)[0]} alt={entry.title} className="h-24 w-24 rounded-lg object-cover" />
                <span className="mt-1 block text-[11px] leading-4 text-[var(--brand-ink)]">
                  <input
                    type="checkbox"
                    checked={selected.includes(entry.id)}
                    onChange={(event) =>
                      setSelected((prev) =>
                        event.target.checked ? [...prev, entry.id] : prev.filter((id) => id !== entry.id)
                      )
                    }
                    className="mr-1 h-3 w-3 accent-[var(--brand-orange)]"
                  />
                  <span className="line-clamp-2">{entry.title}</span>
                </span>
              </label>
            </div>
          ))}
        </div>
        <div className="lg:ml-auto lg:text-right">
          <p className="text-sm text-[var(--brand-muted)]">
            Total for {chosen.length + 1} items: <span className="text-lg font-bold text-[var(--brand-ink)]">{money(total)}</span>
          </p>
          <Button
            size="sm"
            variant="accent"
            className="mt-2"
            onClick={() => {
              addToCart(product.id, 1, { snapshot: product, silent: true });
              chosen.forEach((entry) => addToCart(entry.id, 1, { snapshot: entry, silent: true, openDrawer: false }));
            }}
            disabled={chosen.length === 0}
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" /> Add all to cart
          </Button>
          <p className="mt-1 text-[11px] text-[var(--brand-muted)]">Prices include seller offers; delivery calculated at checkout.</p>
        </div>
      </div>
      <p className="mt-3 text-xs text-[var(--brand-muted)]">
        <Link to="/deals" className="font-semibold text-[var(--brand-navy)] underline underline-offset-2">
          See more bundle deals
        </Link>
      </p>
    </section>
  );
}
