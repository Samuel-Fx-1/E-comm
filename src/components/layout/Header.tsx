import { Link } from 'react-router-dom';
import { MapPin, Menu, ShoppingBag, ShoppingCart, Sparkles, X } from 'lucide-react';
import { site } from '../../config/site';
import { useSite } from '../../context/SiteContext';
import { useStore } from '../../context/StoreContext';
import { SearchBox } from './SearchBox';
import { AccountMenu } from './AccountMenu';
import { LanguageCurrencyMenu } from './LanguageCurrencyMenu';

interface HeaderProps {
  onOpenAll: () => void;
}

export function Header({ onOpenAll }: HeaderProps) {
  const { country, city, setCountryModalOpen, t } = useSite();
  const { cartCount } = useStore();

  return (
    <header className="sticky top-0 z-50 shadow-lg">
      <div className="bg-[var(--brand-navy)] text-white">
        <div className="mx-auto flex max-w-7xl items-center gap-1 px-3 py-2 sm:gap-2 sm:px-4 lg:gap-3">
          <button
            type="button"
            onClick={onOpenAll}
            className="rounded p-2 hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)] md:hidden"
            aria-label={t('menu')}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <Link
            to="/"
            aria-label={`${site.name} home`}
            className="flex shrink-0 items-center gap-1.5 rounded p-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)]"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--brand-orange)] text-white sm:h-9 sm:w-9">
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="font-serif text-2xl font-bold leading-none tracking-tight sm:text-[26px]">
              {site.logoText}
              <span className="text-[var(--brand-orange)]">{site.logoAccent}</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setCountryModalOpen(true)}
            className="hidden shrink-0 items-center gap-1.5 rounded border border-transparent px-2 py-1.5 text-left hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)] xl:flex"
          >
            <MapPin className="h-4 w-4 text-[var(--brand-yellow)]" aria-hidden="true" />
            <span className="flex flex-col leading-tight">
              <span className="text-[11px] text-white/70">{t('deliverTo')}</span>
              <span className="text-xs font-bold">
                {city}, {country.name}
              </span>
            </span>
          </button>

          <div className="hidden min-w-0 flex-1 md:block">
            <SearchBox />
          </div>

          <div className="hidden xl:block">
            <LanguageCurrencyMenu />
          </div>

          <div className="hidden lg:block">
            <AccountMenu />
          </div>

          <Link
            to="/orders"
            className="hidden shrink-0 flex-col rounded border border-transparent px-2 py-1 text-left text-white hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)] xl:flex"
          >
            <span className="text-[11px] leading-4 text-white/80">{t('returnsOrders')}</span>
            <span className="text-sm font-bold leading-4">Orders</span>
          </Link>

          <Link
            to="/cart"
            className="relative flex shrink-0 items-end gap-1 rounded border border-transparent px-2 py-1.5 hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)]"
            aria-label={`${cartCount} ${t('cart')}, ${cartCount} items`}
          >
            <span className="relative">
              <ShoppingCart className="h-7 w-7" aria-hidden="true" />
              <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-[var(--brand-orange)] px-1 text-[11px] font-bold text-white">
                {cartCount}
              </span>
            </span>
            {' '}
            <span className="hidden text-sm font-bold sm:block">{t('cart')}</span>
          </Link>
        </div>

        <div className="px-3 pb-2 md:hidden">
          <SearchBox />
        </div>

        <div className="flex items-center justify-between gap-2 px-3 pb-2 md:hidden">
          <button
            type="button"
            onClick={() => setCountryModalOpen(true)}
            className="flex items-center gap-1.5 rounded px-1 py-1 text-xs text-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)]"
          >
            <MapPin className="h-3.5 w-3.5 text-[var(--brand-yellow)]" aria-hidden="true" />
            {t('deliverTo')} <span className="font-bold">{city}, {country.name}</span>
          </button>
          <LanguageCurrencyMenu />
        </div>
      </div>

      <TopNav onOpenAll={onOpenAll} />
    </header>
  );
}

function TopNav({ onOpenAll }: { onOpenAll: () => void }) {
  const { t, money } = useSite();
  const links = [
    { to: '/deals', label: t('todaysDeals') },
    { to: '/best-sellers', label: t('bestSellers') },
    { to: '/new-arrivals', label: t('newArrivals') },
    { to: '/customer-service', label: 'Customer Service' },
    { to: '/sell', label: t('sell') },
  ];

  return (
    <nav aria-label="Primary" className="hidden bg-[var(--brand-navy-soft)] text-white md:block">
      <div className="no-scrollbar mx-auto flex max-w-7xl items-center gap-1 overflow-x-auto px-2 py-1">
        <button
          type="button"
          onClick={onOpenAll}
          className="flex shrink-0 items-center gap-1.5 rounded border border-transparent px-2 py-1.5 text-sm font-bold hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)]"
        >
          <Menu className="h-4 w-4" aria-hidden="true" /> {t('all')}
        </button>
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className="shrink-0 rounded border border-transparent px-2 py-1.5 text-sm hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)]"
          >
            {link.label}
          </Link>
        ))}
        <span className="ml-auto hidden shrink-0 items-center gap-1.5 px-2 text-xs text-white/75 lg:flex">
          <Sparkles className="h-3.5 w-3.5 text-[var(--brand-yellow)]" aria-hidden="true" />
          Free delivery on orders over {money(site.freeDeliveryThresholdRwf)}
        </span>
      </div>
    </nav>
  );
}

export function ShipToBanner() {
  const { country, shipBannerDismissed, dismissShipBanner, setCountryModalOpen, t } = useSite();
  if (shipBannerDismissed) return null;

  return (
    <div className="border-b border-[var(--brand-yellow-dark)]/40 bg-[#FFF8E1] text-[var(--brand-navy-deep)]">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2">
        <p className="flex items-center gap-2 text-xs sm:text-sm">
          <MapPin className="h-4 w-4 shrink-0 text-[var(--brand-orange)]" aria-hidden="true" />
          {t('shipTo')} <strong>{country.name}</strong>. Prices and delivery are shown for this location.
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setCountryModalOpen(true)}
            className="text-xs font-bold text-[var(--brand-navy)] underline underline-offset-2 hover:text-[var(--brand-orange)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)] sm:text-sm"
          >
            {t('changeAddress')}
          </button>
          <button
            type="button"
            onClick={dismissShipBanner}
            aria-label={t('dismiss')}
            className="rounded p-1 text-[var(--brand-navy)]/60 hover:bg-black/5 hover:text-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
