import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, MapPin, Package, Pencil, Plus, ShieldCheck, Trash2, User, Wallet,
} from 'lucide-react';
import type { SavedPaymentMethod } from '../types';
import { countries, getCountry, site } from '../config/site';
import { useAuth } from '../context/AuthContext';
import { useOrders } from '../context/OrdersContext';
import { useSite } from '../context/SiteContext';
import { useStore } from '../context/StoreContext';
import { useToast } from '../context/ToastContext';
import { formatDate } from '../lib/format';
import { Seo } from '../components/ui/Seo';
import { Button } from '../components/ui/Button';

const inputClass =
  'w-full rounded-lg border border-[var(--brand-line)] bg-white px-3 py-2 text-sm text-[var(--brand-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]';

export default function AccountPage() {
  const { user, addresses, paymentMethods, updateProfile, addAddress, removeAddress, addPaymentMethod, removePaymentMethod, signOut } = useAuth();
  const { orders } = useOrders();
  const { wishlist, reviews } = useStore();
  const { country, city, countryCode, language, setLanguage, currency, setCurrency, setCountryModalOpen, resetShipBanner, money, t } = useSite();
  const { toast } = useToast();

  const [name, setName] = useState(user?.name ?? '');
  const [nameError, setNameError] = useState('');

  const [addressForm, setAddressForm] = useState({
    label: 'Home',
    fullName: user?.name ?? '',
    phone: '',
    country: countryCode,
    city,
    line1: '',
    line2: '',
  });
  const [addressError, setAddressError] = useState('');

  const [paymentForm, setPaymentForm] = useState<{ type: SavedPaymentMethod['type']; label: string; detail: string }>({
    type: 'card',
    label: '',
    detail: '',
  });
  const [paymentError, setPaymentError] = useState('');

  useEffect(() => {
    setName(user?.name ?? '');
  }, [user?.name]);

  const reviewCount = Object.values(reviews).reduce((sum, list) => sum + list.length, 0);

  if (!user) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <Seo title="Your account" path="/account" noIndex />
        <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-8 text-center shadow-sm">
          <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--brand-cream)] text-[var(--brand-navy)]">
            <User className="h-8 w-8" aria-hidden="true" />
          </span>
          <h1 className="mt-4 font-serif text-3xl font-bold text-[var(--brand-ink)]">Sign in to your account</h1>
          <p className="mx-auto mt-2 max-w-md text-sm text-[var(--brand-muted)]">
            See your orders, saved addresses and wishlist. New here? Create a free account in under a minute.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <Link
              to="/signin"
              className="rounded-lg bg-[var(--brand-yellow)] px-5 py-2.5 text-sm font-bold text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
            >
              {t('signIn')}
            </Link>
            <Link
              to="/register"
              className="rounded-lg border border-[var(--brand-line)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--brand-ink)] hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
            >
              Create account
            </Link>
          </div>
          <p className="mt-4 text-[11px] text-[var(--brand-muted)]">
            Accounts, addresses and orders are stored in this browser.
          </p>
        </div>
      </div>
    );
  }

  const handleProfile = (event: React.FormEvent) => {
    event.preventDefault();
    const result = updateProfile(name);
    if (!result.ok) {
      setNameError(result.error ?? 'Could not update your profile.');
      return;
    }
    setNameError('');
    toast('Profile updated.');
  };

  const handleAddress = (event: React.FormEvent) => {
    event.preventDefault();
    if (addressForm.line1.trim().length < 4) {
      setAddressError('Enter a street address.');
      return;
    }
    if (addressForm.phone.replace(/\D/g, '').length < 7) {
      setAddressError('Enter a reachable phone number.');
      return;
    }
    addAddress({ ...addressForm, label: addressForm.label.trim() || 'Home' });
    setAddressError('');
    setAddressForm((prev) => ({ ...prev, line1: '', line2: '', phone: '' }));
    toast('Address saved.');
  };

  const handlePayment = (event: React.FormEvent) => {
    event.preventDefault();
    if (!paymentForm.label.trim() || !paymentForm.detail.trim()) {
      setPaymentError('Add a label and a short description.');
      return;
    }
    addPaymentMethod(paymentForm);
    setPaymentError('');
    setPaymentForm({ type: 'card', label: '', detail: '' });
    toast('Payment method saved locally.');
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Seo title="Your account" path="/account" noIndex />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-orange)]">Account</p>
          <h1 className="font-serif text-3xl font-bold text-[var(--brand-ink)] sm:text-4xl">Hello, {user.name.split(' ')[0]}</h1>
          <p className="mt-1 text-sm text-[var(--brand-muted)]">
            {user.email} · Member since {formatDate(user.createdAt)}
          </p>
        </div>
        <button
          type="button"
          onClick={signOut}
          className="rounded-lg border border-[var(--brand-line)] bg-white px-4 py-2 text-sm font-semibold text-[var(--brand-danger)] hover:border-[var(--brand-danger)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
        >
          {t('signOut')}
        </button>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link to="/orders" className="rounded-xl border border-[var(--brand-line)] bg-white p-4 hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]">
          <Package className="h-5 w-5 text-[var(--brand-orange)]" aria-hidden="true" />
          <p className="mt-2 text-2xl font-bold text-[var(--brand-ink)]">{orders.length}</p>
          <p className="text-xs text-[var(--brand-muted)]">Orders</p>
        </Link>
        <Link to="/wishlist" className="rounded-xl border border-[var(--brand-line)] bg-white p-4 hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]">
          <Heart className="h-5 w-5 text-[var(--brand-orange)]" aria-hidden="true" />
          <p className="mt-2 text-2xl font-bold text-[var(--brand-ink)]">{wishlist.length}</p>
          <p className="text-xs text-[var(--brand-muted)]">Wishlist items</p>
        </Link>
        <div className="rounded-xl border border-[var(--brand-line)] bg-white p-4">
          <MapPin className="h-5 w-5 text-[var(--brand-orange)]" aria-hidden="true" />
          <p className="mt-2 text-2xl font-bold text-[var(--brand-ink)]">{addresses.length}</p>
          <p className="text-xs text-[var(--brand-muted)]">Saved addresses</p>
        </div>
        <div className="rounded-xl border border-[var(--brand-line)] bg-white p-4">
          <ShieldCheck className="h-5 w-5 text-[var(--brand-orange)]" aria-hidden="true" />
          <p className="mt-2 text-2xl font-bold text-[var(--brand-ink)]">{reviewCount}</p>
          <p className="text-xs text-[var(--brand-muted)]">Reviews written</p>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-[var(--brand-line)] bg-white p-4 sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--brand-ink)]">
              <Pencil className="h-4 w-4 text-[var(--brand-orange)]" aria-hidden="true" /> Profile
            </h2>
            <form onSubmit={handleProfile} className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="flex-1">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Full name</span>
                <input value={name} onChange={(event) => setName(event.target.value)} className={inputClass} autoComplete="name" />
              </label>
              <Button type="submit" size="md">
                Save name
              </Button>
            </form>
            {nameError && <p className="mt-1 text-xs font-semibold text-[var(--brand-danger)]">{nameError}</p>}
            <p className="mt-2 text-[11px] text-[var(--brand-muted)]">
              Email changes are disabled for local accounts. Member since {formatDate(user.createdAt)}.
            </p>
          </section>

          <section className="rounded-2xl border border-[var(--brand-line)] bg-white p-4 sm:p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold text-[var(--brand-ink)]">
              <MapPin className="h-4 w-4 text-[var(--brand-orange)]" aria-hidden="true" /> Saved addresses
            </h2>
            {addresses.length === 0 ? (
              <p className="mt-2 text-sm text-[var(--brand-muted)]">No saved addresses yet. Add one below for faster checkout.</p>
            ) : (
              <ul className="mt-3 space-y-2">
                {addresses.map((entry) => (
                  <li key={entry.id} className="flex items-start justify-between gap-3 rounded-xl border border-[var(--brand-line)] p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-[var(--brand-ink)]">
                        {entry.label} · {entry.fullName}
                      </p>
                      <p className="text-xs text-[var(--brand-muted)]">
                        {entry.line1}
                        {entry.line2 ? `, ${entry.line2}` : ''} · {entry.city}, {getCountry(entry.country).name} · {entry.phone}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeAddress(entry.id)}
                      aria-label={`Remove ${entry.label} address`}
                      className="rounded p-1.5 text-[var(--brand-muted)] hover:bg-[var(--brand-danger)]/5 hover:text-[var(--brand-danger)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handleAddress} className="mt-4 grid gap-3 border-t border-[var(--brand-line)] pt-4 sm:grid-cols-2">
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Label</span>
                <input value={addressForm.label} onChange={(event) => setAddressForm((prev) => ({ ...prev, label: event.target.value }))} className={inputClass} placeholder="Home / Office" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Full name</span>
                <input value={addressForm.fullName} onChange={(event) => setAddressForm((prev) => ({ ...prev, fullName: event.target.value }))} className={inputClass} />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Phone</span>
                <input value={addressForm.phone} onChange={(event) => setAddressForm((prev) => ({ ...prev, phone: event.target.value }))} className={inputClass} inputMode="tel" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Country</span>
                <select
                  value={addressForm.country}
                  onChange={(event) => {
                    const next = getCountry(event.target.value);
                    setAddressForm((prev) => ({ ...prev, country: next.code, city: next.cities[0] }));
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
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">City</span>
                <select value={addressForm.city} onChange={(event) => setAddressForm((prev) => ({ ...prev, city: event.target.value }))} className={inputClass}>
                  {getCountry(addressForm.country).cities.map((entry) => (
                    <option key={entry} value={entry}>
                      {entry}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Street address</span>
                <input value={addressForm.line1} onChange={(event) => setAddressForm((prev) => ({ ...prev, line1: event.target.value }))} className={inputClass} />
              </label>
              <label className="sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Apartment, landmark (optional)</span>
                <input value={addressForm.line2} onChange={(event) => setAddressForm((prev) => ({ ...prev, line2: event.target.value }))} className={inputClass} />
              </label>
              {addressError && <p className="text-xs font-semibold text-[var(--brand-danger)] sm:col-span-2">{addressError}</p>}
              <div className="sm:col-span-2">
                <Button type="submit" size="sm">
                  <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Add address
                </Button>
              </div>
            </form>
          </section>
        </div>

        <div className="space-y-4">
          <section className="rounded-2xl border border-[var(--brand-line)] bg-white p-4">
            <h2 className="text-sm font-bold text-[var(--brand-ink)]">Quick links</h2>
            <ul className="mt-2 space-y-1 text-sm">
              {[
                { to: '/orders', label: 'Your orders' },
                { to: '/wishlist', label: 'Wishlist' },
                { to: '/compare', label: 'Compare products' },
                { to: '/cart', label: 'Shopping cart' },
                { to: '/customer-service', label: 'Customer service' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="block rounded-lg px-2 py-1.5 text-[var(--brand-ink)] hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-[var(--brand-line)] bg-white p-4">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-[var(--brand-ink)]">
              <Wallet className="h-4 w-4 text-[var(--brand-orange)]" aria-hidden="true" /> Payment methods
            </h2>
            {paymentMethods.length === 0 ? (
              <p className="mt-2 text-xs text-[var(--brand-muted)]">No saved methods. Add a payment method below.</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {paymentMethods.map((method) => (
                  <li key={method.id} className="flex items-start justify-between gap-2 rounded-lg border border-[var(--brand-line)] p-2">
                    <div>
                      <p className="text-xs font-bold text-[var(--brand-ink)]">{method.label}</p>
                      <p className="text-[11px] text-[var(--brand-muted)]">{method.detail}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removePaymentMethod(method.id)}
                      aria-label={`Remove ${method.label}`}
                      className="rounded p-1 text-[var(--brand-muted)] hover:text-[var(--brand-danger)]"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <form onSubmit={handlePayment} className="mt-3 space-y-2 border-t border-[var(--brand-line)] pt-3">
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Type</span>
                <select
                  value={paymentForm.type}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, type: event.target.value as SavedPaymentMethod['type'] }))}
                  className={inputClass}
                >
                  <option value="card">Card</option>
                  <option value="mobile-money">Mobile money</option>
                  <option value="cash">Cash</option>
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Label</span>
                <input value={paymentForm.label} onChange={(event) => setPaymentForm((prev) => ({ ...prev, label: event.target.value }))} className={inputClass} placeholder="Visa ending 4242" />
              </label>
              <label className="block">
                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Detail</span>
                <input value={paymentForm.detail} onChange={(event) => setPaymentForm((prev) => ({ ...prev, detail: event.target.value }))} className={inputClass} placeholder="Expires 12/28 · local" />
              </label>
              {paymentError && <p className="text-[11px] font-semibold text-[var(--brand-danger)]">{paymentError}</p>}
              <Button type="submit" size="sm" variant="outline" fullWidth>
                Add payment method
              </Button>
            </form>
            <p className="mt-2 text-[10px] leading-4 text-[var(--brand-muted)]">
              // DEMO: never store real card data. These entries are labels only.
            </p>
          </section>

          <section className="rounded-2xl border border-[var(--brand-line)] bg-white p-4">
            <h2 className="text-sm font-bold text-[var(--brand-ink)]">Market preferences</h2>
            <div className="mt-2 space-y-3 text-xs">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Deliver to</p>
                <button
                  type="button"
                  onClick={() => setCountryModalOpen(true)}
                  className="mt-1 flex w-full items-center justify-between rounded-lg border border-[var(--brand-line)] px-2 py-1.5 text-left font-semibold text-[var(--brand-ink)] hover:border-[var(--brand-navy)]"
                >
                  {city}, {country.name}
                  <MapPin className="h-3.5 w-3.5 text-[var(--brand-orange)]" aria-hidden="true" />
                </button>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Currency</p>
                <select value={currency} onChange={(event) => setCurrency(event.target.value)} className={`${inputClass} mt-1 py-1.5`}>
                  {countries.map((entry) => (
                    <option key={entry.currency} value={entry.currency}>
                      {entry.currency} — {entry.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Language</p>
                <div className="mt-1 flex gap-2">
                  {(['en', 'fr'] as const).map((code) => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => setLanguage(code)}
                      className={`rounded-lg px-3 py-1.5 font-semibold ${
                        language === code ? 'bg-[var(--brand-navy)] text-white' : 'border border-[var(--brand-line)] bg-white text-[var(--brand-ink)]'
                      }`}
                    >
                      {code === 'en' ? 'English' : 'Français'}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetShipBanner();
                  toast('Shipping banner restored.');
                }}
                className="text-[11px] font-semibold text-[var(--brand-navy)] underline underline-offset-2"
              >
                Restore the ships-to banner
              </button>
            </div>
          </section>

          <p className="rounded-xl bg-[var(--brand-cream)] p-3 text-[11px] leading-4 text-[var(--brand-muted)]">
            Free delivery applies over {money(site.freeDeliveryThresholdRwf)}. All prices are stored in RWF and converted
            at fixed reference rates.
          </p>
        </div>
      </div>
    </div>
  );
}
