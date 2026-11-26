import { Link } from 'react-router-dom';
import { ArrowUp, ShoppingBag } from 'lucide-react';
import { site } from '../../config/site';
import { useSite } from '../../context/SiteContext';

const columns = [
  {
    title: 'Get to know us',
    links: [
      { label: 'About Soko', to: '/customer-service' },
      { label: 'Careers', to: '/customer-service' },
      { label: 'Sustainability', to: '/customer-service' },
      { label: 'Press room', to: '/customer-service' },
    ],
  },
  {
    title: 'Make money with us',
    links: [
      { label: 'Sell on Soko', to: '/sell' },
      { label: 'Become an affiliate', to: '/sell' },
      { label: 'Advertise with us', to: '/sell' },
      { label: 'Partner with us', to: '/sell' },
    ],
  },
  {
    title: 'Let us help you',
    links: [
      { label: 'Your account', to: '/account' },
      { label: 'Your orders', to: '/orders' },
      { label: 'Shipping & delivery', to: '/customer-service' },
      { label: 'Returns & refunds', to: '/customer-service' },
      { label: 'Help centre', to: '/customer-service' },
    ],
  },
  {
    title: 'Shop',
    links: [
      { label: "Today's Deals", to: '/deals' },
      { label: 'Best Sellers', to: '/best-sellers' },
      { label: 'New Arrivals', to: '/new-arrivals' },
      { label: 'Wishlist', to: '/wishlist' },
      { label: 'Compare', to: '/compare' },
    ],
  },
];

export function Footer() {
  const { t } = useSite();

  return (
    <footer className="mt-14 bg-[var(--brand-navy)] text-white">
      <button
        type="button"
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="flex w-full items-center justify-center gap-2 bg-[var(--brand-navy-soft)] py-3 text-sm font-semibold text-white/90 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--brand-yellow)]"
      >
        <ArrowUp className="h-4 w-4" aria-hidden="true" /> {t('backToTop')}
      </button>

      <div className="mx-auto grid max-w-7xl gap-8 px-6 py-12 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2">
          <Link to="/" className="flex items-center gap-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)]">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--brand-orange)]">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-serif text-2xl font-bold">
              {site.logoText}
              <span className="text-[var(--brand-orange)]">{site.logoAccent}</span>
            </span>
          </Link>
          <p className="mt-3 max-w-xs text-sm leading-6 text-white/65">{site.tagline}</p>
          <p className="mt-4 max-w-xs text-xs leading-5 text-white/45">
            A demo marketplace built for learning. Products, reviews and sellers are fictional. No real payments are
            processed.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-bold text-white">{column.title}</h2>
            <ul className="mt-3 space-y-2">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-xs text-white/60 underline-offset-2 hover:text-white hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-white/10 pb-20 lg:pb-0">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-6 py-6 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 {site.legalName}. All rights reserved.</p>
          <ul className="flex flex-wrap gap-2" aria-label="Accepted demo payment methods">
            {['VISA', 'Mastercard', 'MTN MoMo', 'Airtel Money', 'Cash on delivery'].map((label) => (
              <li key={label} className="rounded border border-white/15 px-2 py-1 text-[10px] font-semibold text-white/70">
                {label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
