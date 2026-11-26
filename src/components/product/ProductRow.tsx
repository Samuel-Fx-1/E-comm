import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Product } from '../../types';
import { ProductCard } from './ProductCard';

interface ProductRowProps {
  title: string;
  subtitle?: string;
  products: Product[];
  href?: string;
  linkLabel?: string;
}

export function ProductRow({ title, subtitle, products, href, linkLabel = 'See all' }: ProductRowProps) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollBy({ left: direction * track.clientWidth * 0.85, behavior: 'smooth' });
  };

  if (products.length === 0) return null;

  return (
    <section aria-labelledby={`row-${title.replace(/\s+/g, '-').toLowerCase()}`} className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            id={`row-${title.replace(/\s+/g, '-').toLowerCase()}`}
            className="font-serif text-2xl font-bold tracking-tight text-[var(--brand-ink)] sm:text-3xl"
          >
            {title}
          </h2>
          {subtitle && <p className="mt-1 text-sm text-[var(--brand-muted)]">{subtitle}</p>}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {href && (
            <Link
              to={href}
              className="hidden text-sm font-semibold text-[var(--brand-navy)] underline-offset-2 hover:underline sm:inline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
            >
              {linkLabel}
            </Link>
          )}
          <button
            type="button"
            onClick={() => scroll(-1)}
            aria-label={`Scroll ${title} left`}
            className="hidden rounded-full border border-[var(--brand-line)] bg-white p-2 text-[var(--brand-ink)] shadow-sm hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)] sm:inline-flex"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            aria-label={`Scroll ${title} right`}
            className="hidden rounded-full border border-[var(--brand-line)] bg-white p-2 text-[var(--brand-ink)] shadow-sm hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)] sm:inline-flex"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div ref={trackRef} className="no-scrollbar -mx-1 flex snap-x gap-4 overflow-x-auto px-1 pb-2">
        {products.map((product) => (
          <div key={product.id} className="w-[190px] shrink-0 snap-start sm:w-[220px]">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
      {href && (
        <Link
          to={href}
          className="inline-block text-sm font-semibold text-[var(--brand-navy)] underline-offset-2 hover:underline sm:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
        >
          {linkLabel}
        </Link>
      )}
    </section>
  );
}
