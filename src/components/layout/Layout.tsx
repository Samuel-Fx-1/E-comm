import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Header, ShipToBanner } from './Header';
import { Footer } from './Footer';
import { MobileTabBar } from './MobileTabBar';
import { AllMenu } from './AllMenu';
import { CountryModal } from './CountryModal';
import { CartDrawer } from './CartDrawer';
import { CompareBar } from '../product/CompareBar';
import { ScrollToTop } from '../ui/ScrollToTop';

export function Layout() {
  const [allMenuOpen, setAllMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--brand-cream)]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[var(--brand-navy)] focus:shadow-lg"
      >
        Skip to main content
      </a>
      <ScrollToTop />
      <Header onOpenAll={() => setAllMenuOpen(true)} />
      <ShipToBanner />
      <main id="main-content" className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <MobileTabBar onOpenAll={() => setAllMenuOpen(true)} />
      <CompareBar />
      <CartDrawer />
      <CountryModal />
      <AllMenu open={allMenuOpen} onClose={() => setAllMenuOpen(false)} />
    </div>
  );
}
