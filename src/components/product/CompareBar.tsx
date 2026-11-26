import { Link } from 'react-router-dom';
import { GitCompareArrows, X } from 'lucide-react';
import { resolveProduct } from '../../data/productLookup';
import { imagesFor } from '../../data/imageMap';
import { useStore } from '../../context/StoreContext';
import { ImageWithFallback } from '../ui/ImageWithFallback';

export function CompareBar() {
  const { compare, toggleCompare, clearCompare } = useStore();
  if (compare.length === 0) return null;
  const products = compare.map((id) => resolveProduct(id)).filter(Boolean);

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 border-t border-white/10 bg-[var(--brand-navy)] text-white shadow-2xl sm:bottom-0">
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-2.5">
        <span className="hidden shrink-0 items-center gap-2 text-xs font-bold uppercase tracking-wide text-white/70 sm:flex">
          <GitCompareArrows className="h-4 w-4" aria-hidden="true" /> Compare
        </span>
        <div className="flex flex-1 items-center gap-2">
          {products.map((product) =>
            product ? (
              <div key={product.id} className="flex items-center gap-2 rounded-lg bg-white/10 p-1 pr-1.5">
                <ImageWithFallback src={imagesFor(product)[0]} alt={product.title} className="h-8 w-8 rounded object-cover" />
                <span className="hidden max-w-[130px] truncate text-xs font-medium sm:block">{product.title}</span>
                <button
                  type="button"
                  onClick={() => toggleCompare(product.id, product)}
                  className="rounded p-0.5 text-white/60 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  aria-label={`Remove ${product.title} from compare`}
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            ) : null
          )}
        </div>
        <button
          type="button"
          onClick={clearCompare}
          className="shrink-0 text-xs font-semibold text-white/70 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Clear
        </button>
        <Link
          to="/compare"
          className="shrink-0 rounded-full bg-[var(--brand-yellow)] px-4 py-2 text-xs font-bold text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Compare ({compare.length})
        </Link>
      </div>
    </div>
  );
}
