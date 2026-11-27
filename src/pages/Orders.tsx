import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Package, RotateCcw } from 'lucide-react';
import type { OrderStatus } from '../types';
import { useOrders } from '../context/OrdersContext';
import { useStore } from '../context/StoreContext';
import { useSite } from '../context/SiteContext';
import { useToast } from '../context/ToastContext';
import { getCountry } from '../config/site';
import { classNames, formatDate } from '../lib/format';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { EmptyState } from '../components/ui/EmptyState';
import { Seo } from '../components/ui/Seo';

const FILTERS: Array<{ id: OrderStatus | 'all'; label: string }> = [
  { id: 'all', label: 'All orders' },
  { id: 'Ordered', label: 'Ordered' },
  { id: 'Shipped', label: 'Shipped' },
  { id: 'Out for delivery', label: 'Out for delivery' },
  { id: 'Delivered', label: 'Delivered' },
];

export default function OrdersPage() {
  const { orders } = useOrders();
  const { addToCart, setDrawerOpen } = useStore();
  const { money, language } = useSite();
  const { toast } = useToast();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');

  const filtered = useMemo(
    () => (filter === 'all' ? orders : orders.filter((order) => order.status === filter)),
    [orders, filter]
  );

  const buyAgain = (orderId: string) => {
    const order = orders.find((entry) => entry.id === orderId);
    if (!order) return;
    order.items.forEach((item) =>
      addToCart(item.productId, item.qty, { snapshot: item.snapshot, silent: true, openDrawer: false })
    );
    toast('Items added to your cart.');
    setDrawerOpen(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <Seo title="Your orders" path="/orders" noIndex />

      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--brand-ink)] sm:text-4xl">Your orders</h1>
          <p className="mt-1 text-sm text-[var(--brand-muted)]">
            Track purchases saved in this browser and reorder your favourites.
          </p>
        </div>
        <Link to="/account" className="text-sm font-semibold text-[var(--brand-navy)] underline-offset-2 hover:underline">
          Account settings
        </Link>
      </div>

      <div className="no-scrollbar mt-4 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((entry) => (
          <button
            key={entry.id}
            type="button"
            onClick={() => setFilter(entry.id)}
            aria-pressed={filter === entry.id}
            className={classNames(
              'shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]',
              filter === entry.id
                ? 'border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white'
                : 'border-[var(--brand-line)] bg-white text-[var(--brand-ink)] hover:border-[var(--brand-navy)]'
            )}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Package className="h-7 w-7" aria-hidden="true" />}
            title="No orders in this status"
            description="Try another filter, or start a checkout to create an order."
            action={
              <Link to="/search" className="rounded-lg bg-[var(--brand-orange)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-orange-dark)]">
                Start shopping
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-4 space-y-4">
          {filtered.map((order) => {
            const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
            const country = getCountry(order.address.country);
            return (
              <li key={order.id} className="overflow-hidden rounded-2xl border border-[var(--brand-line)] bg-white">
                <div className="grid gap-3 border-b border-[var(--brand-line)] bg-[var(--brand-cream)] px-4 py-3 text-xs sm:grid-cols-4">
                  <div>
                    <p className="uppercase tracking-wide text-[var(--brand-muted)]">Order placed</p>
                    <p className="mt-0.5 font-semibold text-[var(--brand-ink)]">{formatDate(order.createdAt, language)}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide text-[var(--brand-muted)]">Total</p>
                    <p className="mt-0.5 font-semibold text-[var(--brand-ink)]">{money(order.total)}</p>
                  </div>
                  <div>
                    <p className="uppercase tracking-wide text-[var(--brand-muted)]">Ship to</p>
                    <p className="mt-0.5 truncate font-semibold text-[var(--brand-ink)]">{order.address.fullName}, {country.name}</p>
                  </div>
                  <div className="sm:text-right">
                    <p className="uppercase tracking-wide text-[var(--brand-muted)]">Order # {order.id}</p>
                    <p className="mt-0.5 font-semibold text-[var(--brand-ink)]">
                      Order
                    </p>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p
                      className={classNames(
                        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold',
                        order.status === 'Delivered'
                          ? 'bg-[var(--brand-success)]/10 text-[var(--brand-success)]'
                          : 'bg-[var(--brand-orange)]/10 text-[var(--brand-orange)]'
                      )}
                    >
                      <Package className="h-3.5 w-3.5" aria-hidden="true" /> {order.status}
                    </p>
                    <p className="text-xs text-[var(--brand-muted)]">
                      {order.status === 'Delivered'
                        ? `Delivered ${formatDate(order.estimatedDelivery, language)}`
                        : `Expected ${formatDate(order.estimatedDelivery, language)}`}
                    </p>
                  </div>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex flex-1 gap-2 overflow-x-auto">
                      {order.items.map((item) => (
                        <Link
                          key={`${item.productId}-${item.price}`}
                          to={`/product/${item.slug}`}
                          className="group flex min-w-0 items-center gap-2 rounded-lg border border-[var(--brand-line)] p-1.5 pr-2.5 hover:border-[var(--brand-navy)]"
                        >
                          <ImageWithFallback src={item.image} alt={item.title} className="h-12 w-12 shrink-0 rounded object-cover" />
                          <span className="min-w-0">
                            <span className="line-clamp-1 block max-w-[220px] text-xs font-semibold text-[var(--brand-ink)] group-hover:text-[var(--brand-orange)]">
                              {item.title}
                            </span>
                            <span className="block text-[11px] text-[var(--brand-muted)]">Qty {item.qty}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Link
                        to={`/orders/${order.id}`}
                        className="inline-flex items-center gap-1 rounded-lg border border-[var(--brand-line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--brand-ink)] hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                      >
                        View details <ChevronRight className="h-3 w-3" aria-hidden="true" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => buyAgain(order.id)}
                        className="inline-flex items-center gap-1 rounded-lg bg-[var(--brand-yellow)] px-3 py-1.5 text-xs font-bold text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                      >
                        <RotateCcw className="h-3 w-3" aria-hidden="true" /> Buy it again
                      </button>
                    </div>
                  </div>
                  <p className="mt-2 text-[11px] text-[var(--brand-muted)]">
                    {itemCount} item{itemCount === 1 ? '' : 's'} · {order.paymentLabel} · {order.deliveryMethod === 'express' ? 'Express' : 'Standard'} delivery
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
