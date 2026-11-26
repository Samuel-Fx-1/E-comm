import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Heart, LogOut, Package, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useSite } from '../../context/SiteContext';
import { useOnClickOutside } from '../../lib/hooks';

export function AccountMenu() {
  const { user, signOut } = useAuth();
  const { t } = useSite();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false), open);

  return (
    <div
      ref={ref}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex flex-col items-start rounded border border-transparent px-2 py-1 text-left text-white hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)]"
      >
        <span className="text-[11px] leading-4 text-white/80">
          {user ? `${t('helloUser')} ${user.name.split(' ')[0]}` : t('helloSignIn')}
        </span>
        <span className="flex items-center gap-0.5 text-sm font-bold leading-4">
          {t('accountLists')}
          <ChevronDown className="h-3 w-3" aria-hidden="true" />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[75] mt-2 w-72 rounded-xl border border-[var(--brand-line)] bg-white p-4 text-[var(--brand-ink)] shadow-2xl"
        >
          {user ? (
            <p className="text-sm text-[var(--brand-muted)]">
              Signed in as <span className="font-semibold text-[var(--brand-ink)]">{user.email}</span>
            </p>
          ) : (
            <Link
              to="/signin"
              onClick={() => setOpen(false)}
              className="flex w-full items-center justify-center rounded-lg bg-[var(--brand-yellow)] px-4 py-2 text-sm font-bold text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
            >
              {t('signIn')}
            </Link>
          )}

          <div className="mt-3 border-t border-[var(--brand-line)] pt-2">
            <p className="px-2 pb-1 text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">
              {t('accountLists')}
            </p>
            <Link role="menuitem" to="/account" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]">
              <User className="h-4 w-4 text-[var(--brand-muted)]" aria-hidden="true" /> {t('account')}
            </Link>
            <Link role="menuitem" to="/orders" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]">
              <Package className="h-4 w-4 text-[var(--brand-muted)]" aria-hidden="true" /> {t('orders')}
            </Link>
            <Link role="menuitem" to="/wishlist" onClick={() => setOpen(false)} className="flex items-center gap-2 rounded-lg px-2 py-2 text-sm hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]">
              <Heart className="h-4 w-4 text-[var(--brand-muted)]" aria-hidden="true" /> {t('wishlist')}
            </Link>
            {user ? (
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  signOut();
                  setOpen(false);
                }}
                className="mt-1 flex w-full items-center gap-2 rounded-lg border-t border-[var(--brand-line)] px-2 py-2 text-left text-sm text-[var(--brand-danger)] hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
              >
                <LogOut className="h-4 w-4" aria-hidden="true" /> {t('signOut')}
              </button>
            ) : (
              <Link
                role="menuitem"
                to="/register"
                onClick={() => setOpen(false)}
                className="mt-1 flex items-center gap-2 rounded-lg border-t border-[var(--brand-line)] px-2 py-2 text-sm font-semibold text-[var(--brand-navy)] hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
              >
                New customer? Create an account
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
