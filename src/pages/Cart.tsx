import { Link } from 'react-router-dom';
import { Bookmark, ChevronRight, ShieldCheck, ShoppingCart, Trash2, Truck } from 'lucide-react';
import { resolveLineProduct } from '../data/productLookup';
import { imagesFor } from '../data/imageMap';
import { site } from '../config/site';
import { useStore } from '../context/StoreContext';
import { useSite } from '../context/SiteContext';
import { QuantitySelect } from '../components/ui/QuantitySelect';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { EmptyState } from '../components/ui/EmptyState';
import { Seo } from '../components/ui/Seo';
import { Button } from '../components/ui/Button';

export default function CartPage() {
  const {
    cart, savedForLater, updateQty, removeFromCart, saveForLater, moveToCart, removeSaved, cartSubtotal, cartCount,
  } = useStore();
  const { money, t } = useSite();

  const shipping = cartSubtotal >= site.freeShippingThresholdUsd || cartSubtotal === 0 ? 0 : site.standardShippingUsd;
  const tax = cartSubtotal * site.taxRate;
  const total = cartSubtotal + shipping + tax;
  const remaining = Math.max(0, site.freeShippingThresholdUsd - cartSubtotal);
  const progress = Math.min(100, (cartSubtotal / site.freeShippingThresholdUsd) * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Seo title="Shopping cart" path="/cart" noIndex />

      <div className="flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-serif text-3xl font-bold text-[var(--brand-ink)] sm:text-4xl">Shopping cart</h1>
        <Link to="/search" className="text-sm font-semibold text-[var(--brand-navy)] underline-offset-2 hover:underline">
          Continue shopping
        </Link>
      </div>

      {cart.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<ShoppingCart className="h-7 w-7" aria-hidden="true" />}
            title="Your Soko cart is empty"
            description="Browse today's deals or pick up something from your wishlist. Free delivery applies on orders over $35."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Link to="/" className="rounded-lg bg-[var(--brand-orange)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-orange-dark)]">
                  Start shopping
                </Link>
                <Link to="/wishlist" className="rounded-lg border border-[var(--brand-line)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--brand-ink)] hover:border-[var(--brand-navy)]">
                  View wishlist
                </Link>
              </div>
            }
          />
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="min-w-0 space-y-5">
            <div className="rounded-2xl border border-[var(--brand-line)] bg-white">
              <div className="flex items-center justify-between border-b border-[var(--brand-line)] px-4 py-3">
                <h2 className="text-lg font-bold text-[var(--brand-ink)]">Items ({cartCount})</h2>
                <span className="text-sm text-[var(--brand-muted)]">Price</span>
              </div>
              <ul className="divide-y divide-[var(--brand-line)]">
                {cart.map((line) => {
                  const product = resolveLineProduct(line);
                  if (!product) return null;
                  return (
                    <li key={line.productId} className="flex gap-3 p-4 sm:gap-4">
                      <Link to={`/product/${product.slug}`} className="shrink-0">
                        <ImageWithFallback
                          src={imagesFor(product)[0]}
                          alt={product.title}
                          className="h-24 w-24 rounded-lg object-cover sm:h-32 sm:w-32"
                        />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--brand-muted)]">{product.brand}</p>
                            <Link
                              to={`/product/${product.slug}`}
                              className="mt-0.5 line-clamp-2 text-base font-semibold leading-snug text-[var(--brand-ink)] hover:text-[var(--brand-orange)]"
                            >
                              {product.title}
                            </Link>
                            <p className="mt-1 text-xs font-semibold text-[var(--brand-success)]">
                              {product.stock > 0 ? 'In stock' : 'Out of stock'}
                            </p>
                          </div>
                          <p className="text-lg font-bold text-[var(--brand-ink)]">{money(product.price * line.qty)}</p>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <QuantitySelect
                            compact
                            value={line.qty}
                            max={Math.max(1, product.stock)}
                            onChange={(value) => updateQty(product.id, value)}
                            label={`Quantity for ${product.title}`}
                          />
                          <button
                            type="button"
                            onClick={() => saveForLater(product.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--brand-line)] px-2.5 py-1.5 text-xs font-semibold text-[var(--brand-ink)] hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                          >
                            <Bookmark className="h-3.5 w-3.5" aria-hidden="true" /> {t('saveForLater')}
                          </button>
                          <button
                            type="button"
                            onClick={() => removeFromCart(product.id)}
                            className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[var(--brand-danger)] hover:bg-[var(--brand-danger)]/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                          >
                            <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Delete
                          </button>
                        </div>
                        <p className="mt-2 text-xs text-[var(--brand-muted)]">
                          {product.price >= 35 ? 'This item qualifies for free delivery.' : 'Delivery calculated at checkout.'}
                        </p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {savedForLater.length > 0 && (
              <div className="rounded-2xl border border-[var(--brand-line)] bg-white">
                <div className="border-b border-[var(--brand-line)] px-4 py-3">
                  <h2 className="text-lg font-bold text-[var(--brand-ink)]">Saved for later ({savedForLater.length})</h2>
                </div>
                <ul className="divide-y divide-[var(--brand-line)]">
                  {savedForLater.map((line) => {
                    const product = resolveLineProduct(line);
                    if (!product) return null;
                    return (
                      <li key={line.productId} className="flex gap-3 p-4">
                        <Link to={`/product/${product.slug}`} className="shrink-0">
                          <ImageWithFallback src={imagesFor(product)[0]} alt={product.title} className="h-20 w-20 rounded-lg object-cover" />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <Link to={`/product/${product.slug}`} className="line-clamp-2 text-sm font-semibold text-[var(--brand-ink)] hover:text-[var(--brand-orange)]">
                            {product.title}
                          </Link>
                          <p className="mt-1 text-sm font-bold text-[var(--brand-ink)]">{money(product.price)}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => moveToCart(product.id)}
                              className="rounded-lg bg-[var(--brand-yellow)] px-3 py-1.5 text-xs font-bold text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                            >
                              {t('moveToCart')}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeSaved(product.id)}
                              className="rounded-lg px-3 py-1.5 text-xs font-semibold text-[var(--brand-muted)] hover:text-[var(--brand-danger)]"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-36 lg:h-fit">
            <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-4">
              <h2 className="text-lg font-bold text-[var(--brand-ink)]">Order summary</h2>

              <div className="mt-3 rounded-lg bg-[var(--brand-cream)] p-3">
                <p className="flex items-center gap-1.5 text-xs font-semibold text-[var(--brand-success)]">
                  <Truck className="h-4 w-4" aria-hidden="true" />
                  {remaining === 0 ? 'Your order qualifies for free delivery' : `${money(remaining)} away from free delivery`}
                </p>
                <div
                  className="mt-2 h-2 overflow-hidden rounded-full bg-white"
                  role="progressbar"
                  aria-valuenow={Math.round(progress)}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label="Progress towards free delivery"
                >
                  <div className="h-full rounded-full bg-[var(--brand-success)]" style={{ width: `${progress}%` }} />
                </div>
              </div>

              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-[var(--brand-muted)]">Subtotal ({cartCount} items)</dt>
                  <dd className="font-semibold text-[var(--brand-ink)]">{money(cartSubtotal)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--brand-muted)]">Delivery</dt>
                  <dd className="font-semibold text-[var(--brand-ink)]">{shipping === 0 ? t('free') : money(shipping)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-[var(--brand-muted)]">Estimated tax (8%)</dt>
                  <dd className="font-semibold text-[var(--brand-ink)]">{money(tax)}</dd>
                </div>
                <div className="flex justify-between border-t border-[var(--brand-line)] pt-2 text-base">
                  <dt className="font-bold text-[var(--brand-ink)]">Order total</dt>
                  <dd className="text-xl font-bold text-[var(--brand-ink)]">{money(total)}</dd>
                </div>
              </dl>

              <Link
                to="/checkout"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-yellow)] px-4 py-2.5 text-sm font-bold text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
              >
                Proceed to checkout <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <p className="mt-2 flex items-center justify-center gap-1 text-[11px] text-[var(--brand-muted)]">
                <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" /> Demo checkout — no real payment
              </p>
            </div>

            <div className="mt-4 rounded-2xl border border-[var(--brand-line)] bg-white p-4 text-xs text-[var(--brand-muted)]">
              <p className="font-bold text-[var(--brand-ink)]">Delivery options</p>
              <p className="mt-1">Standard delivery is free over {money(site.freeShippingThresholdUsd)}. Express delivery is available at checkout.</p>
              <p className="mt-2">
                Need help?{' '}
                <Link to="/customer-service" className="font-semibold text-[var(--brand-navy)] underline underline-offset-2">
                  Visit Customer Service
                </Link>
                .
              </p>
            </div>
          </aside>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <Button variant="outline" size="sm" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          Back to top
        </Button>
      </div>
    </div>
  );
}
