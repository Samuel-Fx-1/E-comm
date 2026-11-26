import { Link } from 'react-router-dom';
import { GitCompareArrows, Heart, ShoppingCart, Truck } from 'lucide-react';
import type { Product } from '../../types';
import { resolveImages } from '../../data/imageMap';
import { useStore } from '../../context/StoreContext';
import { useSite } from '../../context/SiteContext';
import { deliveryDateRange } from '../../lib/format';
import { Price } from '../ui/Price';
import { Rating } from '../ui/Rating';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { classNames } from '../../lib/format';

interface ProductCardProps {
  product: Product;
  layout?: 'grid' | 'list';
  /** Set for the first visible row so above-the-fold photos load immediately. */
  priority?: boolean;
}

export function ProductCard({ product, layout = 'grid', priority = false }: ProductCardProps) {
  const { addToCart, toggleWishlist, wishlist, toggleCompare, compare } = useStore();
  const { countryCode, language, t } = useSite();
  const saved = wishlist.includes(product.id);
  const comparing = compare.includes(product.id);
  const outOfStock = product.stock <= 0;
  const images = resolveImages(product);
  const delivery = deliveryDateRange(product.deliveryDays, countryCode, false, language);

  const media = (
    <Link
      to={`/product/${product.slug}`}
      className="relative block overflow-hidden rounded-lg bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
      aria-label={product.title}
    >
      <ImageWithFallback
        src={images[0].src}
        srcSet={images[0].srcSet}
        sizes={images[0].sizes}
        width={images[0].width}
        height={images[0].height}
        alt={images[0].alt}
        priority={priority}
        className={classNames(
          'w-full object-cover transition-transform duration-300 hover:scale-105',
          layout === 'grid' ? 'aspect-square' : 'h-44 w-44'
        )}
      />
      {product.discount > 0 && (
        <span className="absolute left-2 top-2 rounded bg-[var(--brand-danger)] px-2 py-0.5 text-xs font-bold text-white shadow">
          -{product.discount}%
        </span>
      )}
      {product.isBestSeller && (
        <span className="absolute bottom-2 left-2 rounded bg-[var(--brand-yellow)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--brand-navy-deep)] shadow">
          Best seller
        </span>
      )}
    </Link>
  );

  const actions = (
    <div className="mt-3 flex flex-col gap-2">
      <button
        type="button"
        onClick={() => addToCart(product.id)}
        disabled={outOfStock}
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-[var(--brand-yellow)] px-4 py-2 text-sm font-bold text-[var(--brand-navy-deep)] transition-colors hover:bg-[var(--brand-yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)] disabled:cursor-not-allowed disabled:bg-[var(--brand-line)] disabled:text-[var(--brand-muted)]"
      >
        <ShoppingCart className="h-4 w-4" aria-hidden="true" />
        {outOfStock ? 'Out of stock' : t('addToCart')}
      </button>
      <button
        type="button"
        onClick={() => toggleCompare(product.id)}
        className={classNames(
          'inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]',
          comparing
            ? 'bg-[var(--brand-navy)] text-white'
            : 'text-[var(--brand-muted)] hover:bg-[var(--brand-cream)] hover:text-[var(--brand-ink)]'
        )}
        aria-pressed={comparing}
      >
        <GitCompareArrows className="h-3.5 w-3.5" aria-hidden="true" />
        {comparing ? 'Comparing' : t('compare')}
      </button>
    </div>
  );

  if (layout === 'list') {
    return (
      <article className="group flex flex-col gap-4 rounded-xl border border-[var(--brand-line)] bg-white p-4 transition-shadow hover:shadow-md sm:flex-row">
        <div className="relative shrink-0">
          {media}
          <button
            type="button"
            onClick={() => toggleWishlist(product.id)}
            aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={saved}
            className="absolute right-2 top-2 rounded-full bg-white/90 p-2 shadow-sm hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            <Heart
              className={classNames('h-4 w-4', saved ? 'fill-[var(--brand-danger)] text-[var(--brand-danger)]' : 'text-[var(--brand-muted)]')}
              aria-hidden="true"
            />
          </button>
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">{product.brand}</p>
            <Link
              to={`/product/${product.slug}`}
              className="mt-1 block text-lg font-bold leading-snug text-[var(--brand-ink)] hover:text-[var(--brand-orange)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
            >
              {product.title}
            </Link>
          </div>
          <Rating rating={product.rating} count={product.reviewCount} showNumber />
          <Price price={product.price} listPrice={product.listPrice} />
          <p className="line-clamp-2 text-sm text-[var(--brand-muted)]">{product.shortDescription}</p>
          <p className="flex items-center gap-1.5 text-xs font-medium text-[var(--brand-success)]">
            <Truck className="h-4 w-4" aria-hidden="true" /> Delivery {delivery}
          </p>
          {product.stock > 0 && product.stock < 10 && (
            <p className="text-xs font-semibold text-[var(--brand-danger)]">Only {product.stock} left in stock</p>
          )}
          <div className="mt-auto max-w-xs">{actions}</div>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col rounded-xl border border-[var(--brand-line)] bg-white p-3 transition-shadow hover:shadow-lg">
      <button
        type="button"
        onClick={() => toggleWishlist(product.id)}
        aria-label={saved ? 'Remove from wishlist' : 'Add to wishlist'}
        aria-pressed={saved}
        className="absolute right-4 top-4 z-10 rounded-full bg-white/90 p-2 shadow-sm hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
      >
        <Heart
          className={classNames('h-4 w-4', saved ? 'fill-[var(--brand-danger)] text-[var(--brand-danger)]' : 'text-[var(--brand-muted)]')}
          aria-hidden="true"
        />
      </button>
      {media}
      <div className="mt-3 flex flex-1 flex-col gap-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--brand-muted)]">{product.brand}</p>
        <Link
          to={`/product/${product.slug}`}
          className="line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-[var(--brand-ink)] hover:text-[var(--brand-orange)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
        >
          {product.title}
        </Link>
        <Rating rating={product.rating} count={product.reviewCount} />
        <Price price={product.price} listPrice={product.listPrice} size="sm" />
        <p className="flex items-center gap-1 text-[11px] font-medium text-[var(--brand-success)]">
          <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          <span className="line-clamp-1">{delivery}</span>
        </p>
        {outOfStock && <p className="text-xs font-semibold text-[var(--brand-danger)]">Currently unavailable</p>}
        {!outOfStock && product.stock < 10 && (
          <p className="text-[11px] font-semibold text-[var(--brand-danger)]">Only {product.stock} left</p>
        )}
        <div className="mt-auto pt-1">{actions}</div>
      </div>
    </article>
  );
}
