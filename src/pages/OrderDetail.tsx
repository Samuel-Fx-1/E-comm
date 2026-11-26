import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, Printer, RotateCcw, Truck, Wallet } from 'lucide-react';
import { useOrders } from '../context/OrdersContext';
import { useStore } from '../context/StoreContext';
import { useSite } from '../context/SiteContext';
import { useToast } from '../context/ToastContext';
import { getCountry } from '../config/site';
import { formatDate } from '../lib/format';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { OrderTimeline } from '../components/orders/OrderTimeline';
import { EmptyState } from '../components/ui/EmptyState';
import { Seo } from '../components/ui/Seo';

export default function OrderDetailPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { getOrder } = useOrders();
  const { addToCart, setDrawerOpen } = useStore();
  const { money, language } = useSite();
  const { toast } = useToast();
  const order = getOrder(id);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Order not found"
          description="That order number is not stored in this browser. It may have been placed on another device."
          action={
            <Link to="/orders" className="rounded-lg bg-[var(--brand-orange)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-orange-dark)]">
              Back to your orders
            </Link>
          }
        />
      </div>
    );
  }

  const country = getCountry(order.address.country);

  const buyAgain = () => {
    order.items.forEach((item) => addToCart(item.productId, item.qty, { silent: true, openDrawer: false }));
    toast('Items added to your cart.');
    setDrawerOpen(true);
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
      <Seo title={`Order ${order.id}`} path={`/orders/${order.id}`} noIndex />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Your orders', to: '/orders' }, { label: order.id }]} />

      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-orange)]">Order details</p>
          <h1 className="font-serif text-3xl font-bold text-[var(--brand-ink)] sm:text-4xl">{order.id}</h1>
          <p className="mt-1 text-sm text-[var(--brand-muted)]">
            Placed {formatDate(order.createdAt, language)} · {order.sample ? 'Sample order' : 'Demo order'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={buyAgain}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--brand-yellow)] px-4 py-2 text-sm font-bold text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" /> Buy it again
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--brand-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-ink)] hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            <Printer className="h-4 w-4" aria-hidden="true" /> Print
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-[var(--brand-line)] bg-white p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--brand-ink)]">
                <Package className="h-5 w-5 text-[var(--brand-orange)]" aria-hidden="true" /> Status: {order.status}
              </h2>
              <p className="text-xs text-[var(--brand-muted)]">
                {order.status === 'Delivered' ? 'Delivered' : 'Expected'} {formatDate(order.estimatedDelivery, language)}
              </p>
            </div>
            <div className="mt-4">
              <OrderTimeline order={order} />
            </div>
          </section>

          <section className="rounded-2xl border border-[var(--brand-line)] bg-white">
            <h2 className="border-b border-[var(--brand-line)] px-4 py-3 text-sm font-bold text-[var(--brand-ink)]">
              Items ({order.items.reduce((sum, item) => sum + item.qty, 0)})
            </h2>
            <ul className="divide-y divide-[var(--brand-line)]">
              {order.items.map((item) => (
                <li key={`${item.productId}-${item.price}`} className="flex items-center gap-3 p-4">
                  <ImageWithFallback src={item.image} alt={item.title} className="h-16 w-16 rounded-lg object-cover" />
                  <div className="min-w-0 flex-1">
                    <Link to={`/product/${item.slug}`} className="line-clamp-2 text-sm font-semibold text-[var(--brand-ink)] hover:text-[var(--brand-orange)]">
                      {item.title}
                    </Link>
                    <p className="text-xs text-[var(--brand-muted)]">Qty {item.qty} · {money(item.price)} each</p>
                    <button
                      type="button"
                      onClick={() => {
                        addToCart(item.productId, item.qty);
                      }}
                      className="mt-1 text-xs font-semibold text-[var(--brand-navy)] underline underline-offset-2"
                    >
                      Buy again
                    </button>
                  </div>
                  <p className="text-sm font-bold text-[var(--brand-ink)]">{money(item.price * item.qty)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-xl border border-[var(--brand-line)] bg-white p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-[var(--brand-ink)]">
              <MapPin className="h-4 w-4 text-[var(--brand-orange)]" aria-hidden="true" /> Shipping address
            </h2>
            <p className="mt-2 text-sm font-semibold text-[var(--brand-ink)]">{order.address.fullName}</p>
            <p className="text-sm text-[var(--brand-muted)]">
              {order.address.line1}
              {order.address.line2 ? `, ${order.address.line2}` : ''}
              <br />
              {order.address.city}, {country.name}
              {order.address.postalCode ? ` ${order.address.postalCode}` : ''}
              <br />
              {order.address.phone}
            </p>
          </section>

          <section className="rounded-xl border border-[var(--brand-line)] bg-white p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-[var(--brand-ink)]">
              <Truck className="h-4 w-4 text-[var(--brand-orange)]" aria-hidden="true" /> Delivery method
            </h2>
            <p className="mt-2 text-sm text-[var(--brand-muted)]">
              {order.deliveryMethod === 'express' ? 'Express delivery' : 'Standard delivery'}
              <br />
              {order.shipping === 0 ? 'Free delivery' : money(order.shipping)}
            </p>
          </section>

          <section className="rounded-xl border border-[var(--brand-line)] bg-white p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-[var(--brand-ink)]">
              <Wallet className="h-4 w-4 text-[var(--brand-orange)]" aria-hidden="true" /> Payment
            </h2>
            <p className="mt-2 text-sm text-[var(--brand-muted)]">{order.paymentLabel}</p>
            <p className="text-[11px] text-[var(--brand-muted)]">Simulated payment · demo only</p>

            <dl className="mt-3 space-y-2 border-t border-[var(--brand-line)] pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--brand-muted)]">Subtotal</dt>
                <dd className="font-semibold text-[var(--brand-ink)]">{money(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--brand-muted)]">Delivery</dt>
                <dd className="font-semibold text-[var(--brand-ink)]">{order.shipping === 0 ? 'Free' : money(order.shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--brand-muted)]">Tax</dt>
                <dd className="font-semibold text-[var(--brand-ink)]">{money(order.tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-[var(--brand-line)] pt-2">
                <dt className="font-bold text-[var(--brand-ink)]">Total</dt>
                <dd className="text-lg font-bold text-[var(--brand-ink)]">{money(order.total)}</dd>
              </div>
            </dl>
          </section>

          <Link
            to="/orders"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--brand-navy)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to all orders
          </Link>
        </aside>
      </div>
    </div>
  );
}
