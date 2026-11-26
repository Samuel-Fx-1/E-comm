import { Link } from 'react-router-dom';
import { Bookmark, ShoppingCart, Trash2, Truck } from 'lucide-react';
import type { Product } from '../../types';
import { resolveLineProduct } from '../../data/productLookup';
import { imagesFor } from '../../data/imageMap';
import { site } from '../../config/site';
import { useStore } from '../../context/StoreContext';
import { useSite } from '../../context/SiteContext';
import { Drawer } from '../ui/Modal';
import { QuantitySelect } from '../ui/QuantitySelect';
import { ImageWithFallback } from '../ui/ImageWithFallback';

export function CartDrawer() {
  const { drawerOpen, setDrawerOpen, cart, updateQty, removeFromCart, saveForLater, cartSubtotal, cartCount } = useStore();
  const { money, t } = useSite();

  const lines = cart
    .map((line) => ({ line, product: resolveLineProduct(line) }))
    .filter((entry): entry is { line: typeof cart[number]; product: Product } => Boolean(entry.product));

  const remaining = Math.max(0, site.freeDeliveryThresholdRwf - cartSubtotal);
  const progress = Math.min(100, (cartSubtotal / site.freeDeliveryThresholdRwf) * 100);

  return (
    <Drawer
      open={drawerOpen}
      onClose={() => setDrawerOpen(false)}
      title={`${t('cart')} (${cartCount})`}
      footer={
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs font-medium">
              <span className="flex items-center gap-1.5 text-[var(--brand-success)]">
                <Truck className="h-4 w-4" aria-hidden="true" />
                {remaining === 0 ? 'Your order qualifies for free delivery' : `${money(remaining)} away from free delivery`}
              </span>
              <span className="text-[var(--brand-muted)]">{Math.round(progress)}%</span>
            </div>
            <div
              className="mt-1.5 h-2 overflow-hidden rounded-full bg-[var(--brand-line)]"
              role="progressbar"
              aria-valuenow={Math.round(progress)}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Free delivery progress"
            >
              <div className="h-full rounded-full bg-[var(--brand-success)] transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="flex items-center justify-between text-base">
            <span className="font-semibold text-[var(--brand-ink)]">{t('subtotal')}</span>
            <span className="text-xl font-bold text-[var(--brand-ink)]">{money(cartSubtotal)}</span>
          </div>
          <Link
            to="/checkout"
            onClick={() => setDrawerOpen(false)}
            className="block w-full rounded-lg bg-[var(--brand-yellow)] px-4 py-2.5 text-center text-sm font-bold text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            {t('proceedCheckout')}
          </Link>
          <Link
            to="/cart"
            onClick={() => setDrawerOpen(false)}
            className="block w-full rounded-lg border border-[var(--brand-line)] px-4 py-2 text-center text-sm font-semibold text-[var(--brand-ink)] hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            {t('viewCart')}
          </Link>
        </div>
      }
    >
      {lines.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center py-16 text-center">
          <ShoppingCart className="h-12 w-12 text-[var(--brand-line)]" aria-hidden="true" />
          <p className="mt-3 text-lg font-bold text-[var(--brand-ink)]">Your cart is empty</p>
          <p className="mt-1 text-sm text-[var(--brand-muted)]">Add something you love and it will show up here.</p>
          <Link
            to="/"
            onClick={() => setDrawerOpen(false)}
            className="mt-5 rounded-full bg-[var(--brand-orange)] px-5 py-2 text-sm font-bold text-white hover:bg-[var(--brand-orange-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            {t('continueShopping')}
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-[var(--brand-line)]">
          {lines.map(({ line, product }) => (
            <li key={product.id} className="flex gap-3 py-4 first:pt-0">
              <Link to={`/product/${product.slug}`} onClick={() => setDrawerOpen(false)} className="shrink-0">
                <ImageWithFallback
                  src={imagesFor(product)[0]}
                  alt={product.title}
                  className="h-20 w-20 rounded-lg object-cover"
                />
              </Link>
              <div className="min-w-0 flex-1">
                <Link
                  to={`/product/${product.slug}`}
                  onClick={() => setDrawerOpen(false)}
                  className="line-clamp-2 text-sm font-semibold text-[var(--brand-ink)] hover:text-[var(--brand-orange)]"
                >
                  {product.title}
                </Link>
                <p className="mt-0.5 text-xs text-[var(--brand-muted)]">{product.brand}</p>
                <p className="mt-1 text-sm font-bold text-[var(--brand-ink)]">{money(product.price)}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <QuantitySelect
                    compact
                    value={line.qty}
                    max={product.stock}
                    onChange={(value) => updateQty(product.id, value)}
                  />
                  <button
                    type="button"
                    onClick={() => saveForLater(product.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand-navy)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                  >
                    <Bookmark className="h-3.5 w-3.5" aria-hidden="true" /> {t('saveForLater')}
                  </button>
                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[var(--brand-danger)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> {t('remove')}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
