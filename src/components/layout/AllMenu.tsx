import { Link } from 'react-router-dom';
import { ChevronRight, Heart, LogOut, Package, Settings, User } from 'lucide-react';
import { categories } from '../../data/categories';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { Drawer } from '../ui/Modal';
import { CategoryIcon } from '../ui/CategoryIcon';

interface AllMenuProps {
  open: boolean;
  onClose: () => void;
}

export function AllMenu({ open, onClose }: AllMenuProps) {
  const { t, language, setLanguage } = useSite();
  const { user, signOut } = useAuth();

  const quickLinks = [
    { to: '/deals', label: t('todaysDeals') },
    { to: '/best-sellers', label: t('bestSellers') },
    { to: '/new-arrivals', label: t('newArrivals') },
    { to: '/wishlist', label: t('wishlist') },
    { to: '/compare', label: t('compare') },
    { to: '/orders', label: t('orders') },
    { to: '/account', label: t('account') },
    { to: '/customer-service', label: 'Customer Service' },
    { to: '/sell', label: t('sell') },
  ];

  return (
    <Drawer open={open} onClose={onClose} title="Browse Soko" side="left">
      <div className="space-y-6">
        <div className="rounded-xl bg-[var(--brand-navy)] p-4 text-white">
          {user ? (
            <>
              <p className="text-sm text-white/70">Signed in as</p>
              <p className="text-lg font-bold">{user.name}</p>
              <p className="truncate text-xs text-white/60">{user.email}</p>
            </>
          ) : (
            <>
              <p className="text-sm text-white/70">Hello, sign in</p>
              <Link
                to="/signin"
                onClick={onClose}
                className="mt-2 inline-flex rounded-lg bg-[var(--brand-yellow)] px-4 py-2 text-sm font-bold text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                {t('signIn')}
              </Link>
            </>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-muted)]">
            Shop by department
          </p>
          <ul className="space-y-0.5">
            {categories.map((category) => (
              <li key={category.slug}>
                <Link
                  to={`/category/${category.slug}`}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-2 py-2.5 text-sm font-medium text-[var(--brand-ink)] hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                >
                  <CategoryIcon name={category.icon} className="h-4 w-4 text-[var(--brand-orange)]" />
                  {category.name}
                  <ChevronRight className="ml-auto h-4 w-4 text-[var(--brand-muted)]" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-muted)]">
            Help & settings
          </p>
          <ul className="space-y-0.5">
            {quickLinks.map((link) => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 text-sm text-[var(--brand-ink)] hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-[var(--brand-line)] p-3">
          <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">
            <Settings className="h-3.5 w-3.5" aria-hidden="true" /> {t('languageCurrency')}
          </p>
          <div className="mt-2 flex gap-2">
            {(['en', 'fr'] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLanguage(code)}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)] ${
                  language === code
                    ? 'bg-[var(--brand-navy)] text-white'
                    : 'border border-[var(--brand-line)] bg-white text-[var(--brand-ink)]'
                }`}
              >
                {code === 'en' ? 'English' : 'Français'}
              </button>
            ))}
          </div>
        </div>

        {user && (
          <button
            type="button"
            onClick={() => {
              signOut();
              onClose();
            }}
            className="flex w-full items-center gap-2 rounded-lg border border-[var(--brand-line)] px-3 py-2 text-sm font-semibold text-[var(--brand-danger)] hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            <LogOut className="h-4 w-4" aria-hidden="true" /> {t('signOut')}
          </button>
        )}
      </div>
    </Drawer>
  );
}
