import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, MapPin, Package, Printer, Truck, Wallet } from 'lucide-react';
import { useOrders } from '../context/OrdersContext';
import { useSite } from '../context/SiteContext';
import { getCountry } from '../config/site';
import { formatDate } from '../lib/format';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { OrderTimeline } from '../components/orders/OrderTimeline';
import { EmptyState } from '../components/ui/EmptyState';
import { Seo } from '../components/ui/Seo';

export default function ConfirmationPage() {
  const { id = '' } = useParams<{ id: string }>();
  const { getOrder } = useOrders();
  const { money, language } = useSite();
  const order = getOrder(id);

  if (!order) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Order not found"
          description="We could not find that order number in this browser. Check Your Orders or start a new order."
          action={
            <Link to="/orders" className="rounded-lg bg-[var(--brand-orange)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-orange-dark)]">
              View your orders
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Seo title={`Order ${order.id}`} path={`/order-confirmation/${order.id}`} noIndex />

      <div className="rounded-2xl border border-[var(--brand-success)]/30 bg-white p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-14 w-14 text-[var(--brand-success)]" aria-hidden="true" />
        <h1 className="mt-3 font-serif text-3xl font-bold text-[var(--brand-ink)]">Order placed</h1>
        <p className="mt-2 text-sm text-[var(--brand-muted)]">
          Thank you{order.address.fullName ? `, ${order.address.fullName.split(' ')[0]}` : ''}. Your order{' '}
          <span className="font-mono font-bold text-[var(--brand-ink)]">{order.id}</span> is confirmed.
        </p>
        <p className="mt-1 text-xs text-[var(--brand-muted)]">
          A hosted store would email a receipt{order.email ? ` to ${order.email}` : ''}. No email is sent and no payment was taken.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <Link
            to={`/orders/${order.id}`}
            className="rounded-lg bg-[var(--brand-navy)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-navy-soft)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            View order details
          </Link>
          <Link
            to="/search"
            className="rounded-lg border border-[var(--brand-line)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--brand-ink)] hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            Continue shopping
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--brand-line)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--brand-ink)] hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            <Printer className="h-4 w-4" aria-hidden="true" /> Print receipt
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[var(--brand-line)] bg-white p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">
            <Truck className="h-4 w-4" aria-hidden="true" /> Arriving
          </p>
          <p className="mt-1 text-sm font-bold text-[var(--brand-ink)]">{formatDate(order.estimatedDelivery, language)}</p>
          <p className="text-xs text-[var(--brand-muted)]">{order.deliveryMethod === 'express' ? 'Express delivery' : 'Standard delivery'}</p>
        </div>
        <div className="rounded-xl border border-[var(--brand-line)] bg-white p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">
            <MapPin className="h-4 w-4" aria-hidden="true" /> Ship to
          </p>
          <p className="mt-1 text-sm font-bold text-[var(--brand-ink)]">{order.address.fullName}</p>
          <p className="text-xs text-[var(--brand-muted)]">
            {order.address.city}, {getCountry(order.address.country).name}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--brand-line)] bg-white p-4">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">
            <Wallet className="h-4 w-4" aria-hidden="true" /> Payment
          </p>
          <p className="mt-1 text-sm font-bold text-[var(--brand-ink)]">{order.paymentLabel}</p>
          <p className="text-xs text-[var(--brand-muted)]">Recorded locally</p>
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-[var(--brand-line)] bg-white p-4 sm:p-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--brand-ink)]">
          <Package className="h-5 w-5 text-[var(--brand-orange)]" aria-hidden="true" /> Order progress
        </h2>
        <div className="mt-4">
          <OrderTimeline order={order} />
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="rounded-2xl border border-[var(--brand-line)] bg-white">
          <h2 className="border-b border-[var(--brand-line)] px-4 py-3 text-sm font-bold text-[var(--brand-ink)]">
            Items in this order
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
                </div>
                <p className="text-sm font-bold text-[var(--brand-ink)]">{money(item.price * item.qty)}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="h-fit rounded-2xl border border-[var(--brand-line)] bg-white p-4">
          <h2 className="text-sm font-bold text-[var(--brand-ink)]">Order total</h2>
          <dl className="mt-3 space-y-2 text-sm">
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
            <div className="flex justify-between border-t border-[var(--brand-line)] pt-2 text-base">
              <dt className="font-bold text-[var(--brand-ink)]">Total</dt>
              <dd className="text-xl font-bold text-[var(--brand-ink)]">{money(order.total)}</dd>
            </div>
          </dl>
          <p className="mt-3 rounded-lg bg-[var(--brand-cream)] p-2 text-[11px] text-[var(--brand-muted)]">
            Order totals are simulated and stored only in this browser.
          </p>
        </div>
      </div>
    </div>
  );
}
