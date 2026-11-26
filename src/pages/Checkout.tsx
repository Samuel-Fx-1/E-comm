import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ChevronLeft, CreditCard, Lock, MapPin, Smartphone, Truck, Wallet } from 'lucide-react';
import type { Address, Product } from '../types';
import { countries, getCountry, site } from '../config/site';
import { resolveLineProduct } from '../data/productLookup';
import { imagesFor } from '../data/imageMap';
import { deliveryDateRange, estimatedDeliveryIso, formatDate, classNames } from '../lib/format';
import { useStore } from '../context/StoreContext';
import { useSite } from '../context/SiteContext';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { EmptyState } from '../components/ui/EmptyState';
import { Seo } from '../components/ui/Seo';
import { Button } from '../components/ui/Button';

type Step = 'address' | 'delivery' | 'payment' | 'review';

const STEPS: Array<{ id: Step; label: string }> = [
  { id: 'address', label: 'Address' },
  { id: 'delivery', label: 'Delivery' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
];

const inputClass =
  'w-full rounded-lg border border-[var(--brand-line)] bg-white px-3 py-2 text-sm text-[var(--brand-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { cart, cartSubtotal, clearCart } = useStore();
  const { user, addresses, addAddress } = useAuth();
  const { countryCode, city, language, money } = useSite();
  const { placeOrder } = useOrders();
  const placingRef = useRef(false);

  const saved = addresses[0];
  const [step, setStep] = useState<Step>('address');
  const [address, setAddress] = useState<Address>({
    fullName: saved?.fullName ?? user?.name ?? '',
    phone: saved?.phone ?? '',
    country: saved?.country ?? countryCode,
    city: saved?.city ?? city,
    line1: saved?.line1 ?? '',
    line2: saved?.line2 ?? '',
    postalCode: saved?.postalCode ?? '',
  });
  const [saveAddress, setSaveAddress] = useState(!saved);
  const [delivery, setDelivery] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'mobile-money' | 'cash'>('card');
  const [card, setCard] = useState({ number: '', name: user?.name ?? '', expiry: '', cvv: '' });
  const [momo, setMomo] = useState({ provider: 'MTN Mobile Money', phone: '' });
  const [errors, setErrors] = useState<string[]>([]);

  const lines = cart
    .map((line) => ({ line, product: resolveLineProduct(line) }))
    .filter((entry): entry is { line: typeof cart[number]; product: Product } => Boolean(entry.product));

  if (lines.length === 0 && !placingRef.current) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Seo title="Checkout" path="/checkout" noIndex />
        <EmptyState
          title="Nothing to check out yet"
          description="Your cart is empty. Add a few items and come back to complete your demo order."
          action={
            <Link to="/search" className="rounded-lg bg-[var(--brand-orange)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-orange-dark)]">
              Browse products
            </Link>
          }
        />
      </div>
    );
  }

  const shipping =
    delivery === 'express'
      ? site.expressShippingUsd
      : cartSubtotal >= site.freeShippingThresholdUsd
        ? 0
        : site.standardShippingUsd;
  const tax = cartSubtotal * site.taxRate;
  const total = cartSubtotal + shipping + tax;

  const maxDeliveryDays = Math.max(...lines.map((entry) => entry.product.deliveryDays), 3);
  const standardEstimate = deliveryDateRange(maxDeliveryDays, address.country, false, language);
  const expressEstimate = deliveryDateRange(maxDeliveryDays, address.country, true, language);
  const estimatedDelivery = estimatedDeliveryIso(maxDeliveryDays, address.country, delivery === 'express');

  const cardDigits = card.number.replace(/\D/g, '');
  const paymentLabel =
    paymentMethod === 'card'
      ? `Card ending ${cardDigits.slice(-4) || '0000'}`
      : paymentMethod === 'mobile-money'
        ? `${momo.provider} · ${momo.phone || 'demo'}`
        : 'Cash on delivery';

  const validateAddress = (): string[] => {
    const list: string[] = [];
    if (address.fullName.trim().length < 2) list.push('Enter the recipient’s full name.');
    if (address.phone.replace(/\D/g, '').length < 7) list.push('Enter a reachable phone number.');
    if (address.line1.trim().length < 4) list.push('Enter a street address.');
    if (!address.city.trim()) list.push('Choose a city.');
    if (!address.country) list.push('Choose a country.');
    return list;
  };

  const validatePayment = (): string[] => {
    const list: string[] = [];
    // DEMO: card details are checked locally only — nothing is sent to a payment processor.
    if (paymentMethod === 'card') {
      if (cardDigits.length < 12) list.push('Enter a demo card number (12–19 digits).');
      if (card.name.trim().length < 2) list.push('Enter the name on the card.');
      if (!/^\d{2}\/\d{2}$/.test(card.expiry)) list.push('Enter expiry as MM/YY.');
      if (!/^\d{3,4}$/.test(card.cvv)) list.push('Enter a 3 or 4 digit CVV.');
    }
    if (paymentMethod === 'mobile-money' && momo.phone.replace(/\D/g, '').length < 7) {
      list.push('Enter the mobile money phone number.');
    }
    return list;
  };

  const goNext = () => {
    if (step === 'address') {
      const list = validateAddress();
      setErrors(list);
      if (list.length > 0) return;
      if (saveAddress && !saved) addAddress({ ...address, label: 'Home' });
      setStep('delivery');
      return;
    }
    if (step === 'delivery') {
      setErrors([]);
      setStep('payment');
      return;
    }
    if (step === 'payment') {
      const list = validatePayment();
      setErrors(list);
      if (list.length > 0) return;
      setStep('review');
    }
  };

  const goBack = () => {
    setErrors([]);
    const index = STEPS.findIndex((entry) => entry.id === step);
    if (index > 0) setStep(STEPS[index - 1].id);
    else navigate('/cart');
  };

  const handlePlaceOrder = () => {
    placingRef.current = true;
    const order = placeOrder({
      items: lines.map(({ line, product }) => ({
        productId: product.id,
        title: product.title,
        slug: product.slug,
        image: imagesFor(product)[0],
        price: product.price,
        qty: line.qty,
        snapshot: product,
      })),
      subtotal: cartSubtotal,
      shipping,
      tax,
      total,
      address,
      deliveryMethod: delivery,
      paymentLabel,
      estimatedDelivery,
      email: user?.email,
    });
    clearCart();
    navigate(`/order-confirmation/${order.id}`);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Seo title="Checkout" path="/checkout" noIndex />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Cart', to: '/cart' }, { label: 'Checkout' }]} />

      <div className="mt-2 flex flex-wrap items-end justify-between gap-2">
        <h1 className="font-serif text-3xl font-bold text-[var(--brand-ink)] sm:text-4xl">Checkout</h1>
        <p className="flex items-center gap-1 text-xs font-medium text-[var(--brand-muted)]">
          <Lock className="h-3.5 w-3.5" aria-hidden="true" /> Demo checkout · no real payment is taken
        </p>
      </div>

      <ol className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4" aria-label="Checkout steps">
        {STEPS.map((entry, index) => {
          const currentIndex = STEPS.findIndex((item) => item.id === step);
          const done = index < currentIndex;
          const current = entry.id === step;
          return (
            <li key={entry.id}>
              <button
                type="button"
                onClick={() => {
                  if (index < currentIndex) {
                    setStep(entry.id);
                    setErrors([]);
                  }
                }}
                disabled={index > currentIndex}
                aria-current={current ? 'step' : undefined}
                className={classNames(
                  'flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors',
                  current
                    ? 'border-[var(--brand-orange)] bg-[var(--brand-orange)]/5 text-[var(--brand-orange)]'
                    : done
                      ? 'border-[var(--brand-success)]/30 bg-[var(--brand-success)]/5 text-[var(--brand-success)]'
                      : 'border-[var(--brand-line)] bg-white text-[var(--brand-muted)]'
                )}
              >
                <span
                  className={classNames(
                    'grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold',
                    current
                      ? 'bg-[var(--brand-orange)] text-white'
                      : done
                        ? 'bg-[var(--brand-success)] text-white'
                        : 'bg-[var(--brand-line)] text-[var(--brand-muted)]'
                  )}
                >
                  {done ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : index + 1}
                </span>
                {entry.label}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-4">
          {errors.length > 0 && (
            <div role="alert" className="rounded-xl border border-[var(--brand-danger)]/30 bg-[var(--brand-danger)]/5 p-3">
              <p className="text-sm font-bold text-[var(--brand-danger)]">Please check the following:</p>
              <ul className="mt-1 list-inside list-disc text-xs text-[var(--brand-danger)]">
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {step === 'address' && (
            <section aria-labelledby="address-heading" className="rounded-2xl border border-[var(--brand-line)] bg-white p-4 sm:p-6">
              <h2 id="address-heading" className="flex items-center gap-2 text-xl font-bold text-[var(--brand-ink)]">
                <MapPin className="h-5 w-5 text-[var(--brand-orange)]" aria-hidden="true" /> Delivery address
              </h2>
              <p className="mt-1 text-xs text-[var(--brand-muted)]">Tell us where this demo order should be delivered.</p>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Full name</span>
                  <input
                    value={address.fullName}
                    onChange={(event) => setAddress((prev) => ({ ...prev, fullName: event.target.value }))}
                    className={inputClass}
                    autoComplete="name"
                    placeholder="e.g. Aline Mukamana"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Phone number</span>
                  <input
                    value={address.phone}
                    onChange={(event) => setAddress((prev) => ({ ...prev, phone: event.target.value }))}
                    className={inputClass}
                    autoComplete="tel"
                    inputMode="tel"
                    placeholder="+250 788 000 000"
                  />
                </label>
                <label>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Country</span>
                  <select
                    value={address.country}
                    onChange={(event) => {
                      const next = getCountry(event.target.value);
                      setAddress((prev) => ({ ...prev, country: next.code, city: next.cities[0] }));
                    }}
                    className={inputClass}
                  >
                    {countries.map((entry) => (
                      <option key={entry.code} value={entry.code}>
                        {entry.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">City / town</span>
                  <select
                    value={address.city}
                    onChange={(event) => setAddress((prev) => ({ ...prev, city: event.target.value }))}
                    className={inputClass}
                  >
                    {getCountry(address.country).cities.map((entry) => (
                      <option key={entry} value={entry}>
                        {entry}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Postal code (optional)</span>
                  <input
                    value={address.postalCode ?? ''}
                    onChange={(event) => setAddress((prev) => ({ ...prev, postalCode: event.target.value }))}
                    className={inputClass}
                    autoComplete="postal-code"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Street address</span>
                  <input
                    value={address.line1}
                    onChange={(event) => setAddress((prev) => ({ ...prev, line1: event.target.value }))}
                    className={inputClass}
                    autoComplete="address-line1"
                    placeholder="House number, street, area"
                  />
                </label>
                <label className="sm:col-span-2">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Apartment, landmark (optional)</span>
                  <input
                    value={address.line2 ?? ''}
                    onChange={(event) => setAddress((prev) => ({ ...prev, line2: event.target.value }))}
                    className={inputClass}
                    autoComplete="address-line2"
                  />
                </label>
              </div>

              {user && (
                <label className="mt-4 flex items-center gap-2 text-sm text-[var(--brand-ink)]">
                  <input
                    type="checkbox"
                    checked={saveAddress}
                    onChange={(event) => setSaveAddress(event.target.checked)}
                    disabled={Boolean(saved)}
                    className="h-4 w-4 accent-[var(--brand-orange)]"
                  />
                  Save this address to my account
                  {saved && <span className="text-xs text-[var(--brand-muted)]">(address already saved)</span>}
                </label>
              )}
            </section>
          )}

          {step === 'delivery' && (
            <section aria-labelledby="delivery-heading" className="rounded-2xl border border-[var(--brand-line)] bg-white p-4 sm:p-6">
              <h2 id="delivery-heading" className="flex items-center gap-2 text-xl font-bold text-[var(--brand-ink)]">
                <Truck className="h-5 w-5 text-[var(--brand-orange)]" aria-hidden="true" /> Delivery speed
              </h2>
              <p className="mt-1 text-xs text-[var(--brand-muted)]">
                Delivering to {address.city}, {getCountry(address.country).name}.
              </p>
              <div className="mt-4 space-y-3" role="radiogroup" aria-label="Delivery speed">
                <label
                  className={classNames(
                    'flex cursor-pointer items-start gap-3 rounded-xl border p-4',
                    delivery === 'standard' ? 'border-[var(--brand-orange)] bg-[var(--brand-orange)]/5' : 'border-[var(--brand-line)]'
                  )}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={delivery === 'standard'}
                    onChange={() => setDelivery('standard')}
                    className="mt-1 h-4 w-4 accent-[var(--brand-orange)]"
                  />
                  <span className="flex-1">
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[var(--brand-ink)]">Standard delivery</span>
                      <span className="font-bold text-[var(--brand-ink)]">
                        {cartSubtotal >= site.freeShippingThresholdUsd ? 'Free' : money(site.standardShippingUsd)}
                      </span>
                    </span>
                    <span className="mt-1 block text-sm text-[var(--brand-muted)]">Arrives {standardEstimate}</span>
                    <span className="mt-0.5 block text-xs text-[var(--brand-success)]">Free on orders over {money(site.freeShippingThresholdUsd)}</span>
                  </span>
                </label>
                <label
                  className={classNames(
                    'flex cursor-pointer items-start gap-3 rounded-xl border p-4',
                    delivery === 'express' ? 'border-[var(--brand-orange)] bg-[var(--brand-orange)]/5' : 'border-[var(--brand-line)]'
                  )}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={delivery === 'express'}
                    onChange={() => setDelivery('express')}
                    className="mt-1 h-4 w-4 accent-[var(--brand-orange)]"
                  />
                  <span className="flex-1">
                    <span className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-bold text-[var(--brand-ink)]">Express delivery</span>
                      <span className="font-bold text-[var(--brand-ink)]">{money(site.expressShippingUsd)}</span>
                    </span>
                    <span className="mt-1 block text-sm text-[var(--brand-muted)]">Arrives {expressEstimate}</span>
                    <span className="mt-0.5 block text-xs text-[var(--brand-muted)]">Priority handling where available.</span>
                  </span>
                </label>
              </div>
            </section>
          )}

          {step === 'payment' && (
            <section aria-labelledby="payment-heading" className="rounded-2xl border border-[var(--brand-line)] bg-white p-4 sm:p-6">
              <h2 id="payment-heading" className="flex items-center gap-2 text-xl font-bold text-[var(--brand-ink)]">
                <Wallet className="h-5 w-5 text-[var(--brand-orange)]" aria-hidden="true" /> Payment method
              </h2>
              <p className="mt-1 text-xs text-[var(--brand-muted)]">
                // DEMO: this checkout simulates payment. Do not enter a real card number.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Payment method">
                {[
                  { id: 'card' as const, label: 'Card', icon: CreditCard },
                  { id: 'mobile-money' as const, label: 'Mobile money', icon: Smartphone },
                  { id: 'cash' as const, label: 'Cash on delivery', icon: Wallet },
                ].map((method) => (
                  <label
                    key={method.id}
                    className={classNames(
                      'flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm font-semibold',
                      paymentMethod === method.id
                        ? 'border-[var(--brand-orange)] bg-[var(--brand-orange)]/5 text-[var(--brand-ink)]'
                        : 'border-[var(--brand-line)] text-[var(--brand-muted)]'
                    )}
                  >
                    <input
                      type="radio"
                      name="payment"
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id)}
                      className="h-4 w-4 accent-[var(--brand-orange)]"
                    />
                    <method.icon className="h-4 w-4" aria-hidden="true" />
                    {method.label}
                  </label>
                ))}
              </div>

              {paymentMethod === 'card' && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label className="sm:col-span-2">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Card number (demo)</span>
                    <input
                      value={card.number}
                      onChange={(event) => setCard((prev) => ({ ...prev, number: event.target.value.replace(/[^\d ]/g, '').slice(0, 19) }))}
                      className={inputClass}
                      inputMode="numeric"
                      autoComplete="off"
                      placeholder="4242 4242 4242 4242"
                    />
                  </label>
                  <label className="sm:col-span-2">
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Name on card</span>
                    <input
                      value={card.name}
                      onChange={(event) => setCard((prev) => ({ ...prev, name: event.target.value }))}
                      className={inputClass}
                      autoComplete="off"
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Expiry (MM/YY)</span>
                    <input
                      value={card.expiry}
                      onChange={(event) => setCard((prev) => ({ ...prev, expiry: event.target.value.replace(/[^\d/]/g, '').slice(0, 5) }))}
                      className={inputClass}
                      inputMode="numeric"
                      placeholder="12/28"
                    />
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">CVV</span>
                    <input
                      value={card.cvv}
                      onChange={(event) => setCard((prev) => ({ ...prev, cvv: event.target.value.replace(/\D/g, '').slice(0, 4) }))}
                      className={inputClass}
                      inputMode="numeric"
                      type="password"
                      placeholder="123"
                    />
                  </label>
                </div>
              )}

              {paymentMethod === 'mobile-money' && (
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <label>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Provider</span>
                    <select
                      value={momo.provider}
                      onChange={(event) => setMomo((prev) => ({ ...prev, provider: event.target.value }))}
                      className={inputClass}
                    >
                      <option>MTN Mobile Money</option>
                      <option>Airtel Money</option>
                      <option>M-Pesa</option>
                    </select>
                  </label>
                  <label>
                    <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Phone number</span>
                    <input
                      value={momo.phone}
                      onChange={(event) => setMomo((prev) => ({ ...prev, phone: event.target.value }))}
                      className={inputClass}
                      inputMode="tel"
                      placeholder="+250 788 000 000"
                    />
                  </label>
                  <p className="text-xs text-[var(--brand-muted)] sm:col-span-2">
                    In a live store you would receive a prompt on your phone. This demo never contacts a payment provider.
                  </p>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <p className="mt-4 rounded-lg bg-[var(--brand-cream)] p-3 text-sm text-[var(--brand-ink)]">
                  Pay the courier when your order arrives. Cash on delivery is available for eligible addresses and demo
                  orders only.
                </p>
              )}
            </section>
          )}

          {step === 'review' && (
            <section aria-labelledby="review-heading" className="space-y-4">
              <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-4 sm:p-6">
                <h2 id="review-heading" className="text-xl font-bold text-[var(--brand-ink)]">Review your order</h2>
                <p className="mt-1 text-xs text-[var(--brand-muted)]">Check everything before placing your demo order.</p>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <div className="rounded-xl bg-[var(--brand-cream)] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">Shipping address</h3>
                      <button type="button" onClick={() => setStep('address')} className="text-xs font-semibold text-[var(--brand-navy)] underline">
                        Change
                      </button>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[var(--brand-ink)]">{address.fullName}</p>
                    <p className="text-sm text-[var(--brand-muted)]">
                      {address.line1}
                      {address.line2 ? `, ${address.line2}` : ''}
                      <br />
                      {address.city}, {getCountry(address.country).name}
                      {address.postalCode ? ` ${address.postalCode}` : ''}
                      <br />
                      {address.phone}
                    </p>
                  </div>
                  <div className="rounded-xl bg-[var(--brand-cream)] p-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">Delivery & payment</h3>
                      <button type="button" onClick={() => setStep('delivery')} className="text-xs font-semibold text-[var(--brand-navy)] underline">
                        Change
                      </button>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-[var(--brand-ink)]">
                      {delivery === 'express' ? 'Express delivery' : 'Standard delivery'}
                    </p>
                    <p className="text-sm text-[var(--brand-muted)]">
                      Arrives {formatDate(estimatedDelivery, language)}
                      <br />
                      {paymentLabel}
                    </p>
                    <button type="button" onClick={() => setStep('payment')} className="mt-1 text-xs font-semibold text-[var(--brand-navy)] underline">
                      Change payment
                    </button>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[var(--brand-line)] bg-white">
                <h3 className="border-b border-[var(--brand-line)] px-4 py-3 text-sm font-bold text-[var(--brand-ink)]">
                  Items ({lines.length})
                </h3>
                <ul className="divide-y divide-[var(--brand-line)]">
                  {lines.map(({ line, product }) => (
                    <li key={product.id} className="flex items-center gap-3 p-4">
                      <ImageWithFallback src={imagesFor(product)[0]} alt={product.title} className="h-16 w-16 rounded-lg object-cover" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-semibold text-[var(--brand-ink)]">{product.title}</p>
                        <p className="text-xs text-[var(--brand-muted)]">Qty {line.qty} · {product.seller}</p>
                      </div>
                      <p className="text-sm font-bold text-[var(--brand-ink)]">{money(product.price * line.qty)}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" onClick={goBack}>
              <ChevronLeft className="h-4 w-4" aria-hidden="true" /> {step === 'address' ? 'Back to cart' : 'Back'}
            </Button>
            {step === 'review' ? (
              <Button variant="primary" onClick={handlePlaceOrder}>
                <Lock className="h-4 w-4" aria-hidden="true" /> Place demo order · {money(total)}
              </Button>
            ) : (
              <Button variant="primary" onClick={goNext}>
                Continue
              </Button>
            )}
          </div>
        </div>

        <aside className="lg:sticky lg:top-36 lg:h-fit">
          <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-4">
            <h2 className="text-lg font-bold text-[var(--brand-ink)]">Order summary</h2>
            <ul className="mt-3 max-h-64 space-y-3 overflow-y-auto pr-1">
              {lines.map(({ line, product }) => (
                <li key={product.id} className="flex items-center gap-2">
                  <span className="relative shrink-0">
                    <ImageWithFallback src={imagesFor(product)[0]} alt={product.title} className="h-12 w-12 rounded object-cover" />
                    <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--brand-navy)] px-1 text-[10px] font-bold text-white">
                      {line.qty}
                    </span>
                  </span>
                  <span className="min-w-0 flex-1 truncate text-xs text-[var(--brand-ink)]">{product.title}</span>
                  <span className="text-xs font-bold text-[var(--brand-ink)]">{money(product.price * line.qty)}</span>
                </li>
              ))}
            </ul>

            <dl className="mt-4 space-y-2 border-t border-[var(--brand-line)] pt-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--brand-muted)]">Subtotal</dt>
                <dd className="font-semibold text-[var(--brand-ink)]">{money(cartSubtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--brand-muted)]">Delivery</dt>
                <dd className="font-semibold text-[var(--brand-ink)]">{shipping === 0 ? 'Free' : money(shipping)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--brand-muted)]">Tax (8%)</dt>
                <dd className="font-semibold text-[var(--brand-ink)]">{money(tax)}</dd>
              </div>
              <div className="flex justify-between border-t border-[var(--brand-line)] pt-2">
                <dt className="font-bold text-[var(--brand-ink)]">Order total</dt>
                <dd className="text-xl font-bold text-[var(--brand-ink)]">{money(total)}</dd>
              </div>
            </dl>
            <p className="mt-3 flex items-center gap-1 text-[11px] text-[var(--brand-muted)]">
              <Lock className="h-3 w-3" aria-hidden="true" /> Simulated checkout · no charge is made
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
