import { NavLink } from 'react-router-dom';
import { Home, LayoutGrid, Package, ShoppingCart, User } from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface MobileTabBarProps {
  onOpenAll: () => void;
}

export function MobileTabBar({ onOpenAll }: MobileTabBarProps) {
  const { cartCount } = useStore();

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--brand-orange)] ${
      isActive ? 'text-[var(--brand-orange)]' : 'text-[var(--brand-muted)]'
    }`;

  return (
    <nav
      aria-label="Mobile"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[var(--brand-line)] bg-white shadow-[0_-4px_16px_rgba(15,23,42,0.06)] lg:hidden"
    >
      <div className="flex items-stretch">
        <NavLink to="/" end className={linkClass}>
          <Home className="h-5 w-5" aria-hidden="true" />
          Home
        </NavLink>
        <button
          type="button"
          onClick={onOpenAll}
          className="flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-semibold text-[var(--brand-muted)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--brand-orange)]"
        >
          <LayoutGrid className="h-5 w-5" aria-hidden="true" />
          Categories
        </button>
        <NavLink to="/cart" className={linkClass}>
          <span className="relative">
            <ShoppingCart className="h-5 w-5" aria-hidden="true" />
            {cartCount > 0 && (
              <span className="absolute -right-2.5 -top-2 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--brand-orange)] px-1 text-[9px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </span>
          Cart
        </NavLink>
        <NavLink to="/orders" className={linkClass}>
          <Package className="h-5 w-5" aria-hidden="true" />
          Orders
        </NavLink>
        <NavLink to="/account" className={linkClass}>
          <User className="h-5 w-5" aria-hidden="true" />
          Account
        </NavLink>
      </div>
    </nav>
  );
}
