import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ToastProvider } from './context/ToastContext';
import { SiteProvider } from './context/SiteContext';
import { AuthProvider } from './context/AuthContext';
import { OrdersProvider } from './context/OrdersContext';
import { StoreProvider } from './context/StoreContext';
import { ProductGridSkeleton } from './components/ui/Skeleton';

const HomePage = lazy(() => import('./pages/Home'));
const CatalogPage = lazy(() => import('./pages/Catalog'));
const ProductPage = lazy(() => import('./pages/Product'));
const CartPage = lazy(() => import('./pages/Cart'));
const CheckoutPage = lazy(() => import('./pages/Checkout'));
const ConfirmationPage = lazy(() => import('./pages/Confirmation'));
const OrdersPage = lazy(() => import('./pages/Orders'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetail'));
const AccountPage = lazy(() => import('./pages/Account'));
const SignInPage = lazy(() => import('./pages/SignIn'));
const RegisterPage = lazy(() => import('./pages/Register'));
const WishlistPage = lazy(() => import('./pages/Wishlist'));
const ComparePage = lazy(() => import('./pages/Compare'));
const CollectionPage = lazy(() => import('./pages/Collection'));
const CustomerServicePage = lazy(() => import('./pages/CustomerService'));
const SellPage = lazy(() => import('./pages/Sell'));
const CreditsPage = lazy(() => import('./pages/Credits'));
const NotFoundPage = lazy(() => import('./pages/NotFound'));

function RouteFallback() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6" role="status" aria-label="Loading page">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-[var(--brand-line)]" />
      <div className="mt-6">
        <ProductGridSkeleton count={8} />
      </div>
      <span className="sr-only">Loading…</span>
    </div>
  );
}

/** All app-wide providers live here so every route sees the same client-side state. */
function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <SiteProvider>
        <AuthProvider>
          <OrdersProvider>
            <StoreProvider>{children}</StoreProvider>
          </OrdersProvider>
        </AuthProvider>
      </SiteProvider>
    </ToastProvider>
  );
}

export default function App() {
  return (
    <Providers>
      <Routes>
        <Route element={<Layout />}>
          <Route
            index
            element={
              <Suspense fallback={<RouteFallback />}>
                <HomePage />
              </Suspense>
            }
          />
          <Route
            path="search"
            element={
              <Suspense fallback={<RouteFallback />}>
                <CatalogPage />
              </Suspense>
            }
          />
          <Route
            path="category/:slug"
            element={
              <Suspense fallback={<RouteFallback />}>
                <CatalogPage />
              </Suspense>
            }
          />
          <Route
            path="product/:slug"
            element={
              <Suspense fallback={<RouteFallback />}>
                <ProductPage />
              </Suspense>
            }
          />
          <Route
            path="cart"
            element={
              <Suspense fallback={<RouteFallback />}>
                <CartPage />
              </Suspense>
            }
          />
          <Route
            path="checkout"
            element={
              <Suspense fallback={<RouteFallback />}>
                <CheckoutPage />
              </Suspense>
            }
          />
          <Route
            path="order-confirmation/:id"
            element={
              <Suspense fallback={<RouteFallback />}>
                <ConfirmationPage />
              </Suspense>
            }
          />
          <Route
            path="orders"
            element={
              <Suspense fallback={<RouteFallback />}>
                <OrdersPage />
              </Suspense>
            }
          />
          <Route
            path="orders/:id"
            element={
              <Suspense fallback={<RouteFallback />}>
                <OrderDetailPage />
              </Suspense>
            }
          />
          <Route
            path="account"
            element={
              <Suspense fallback={<RouteFallback />}>
                <AccountPage />
              </Suspense>
            }
          />
          <Route
            path="signin"
            element={
              <Suspense fallback={<RouteFallback />}>
                <SignInPage />
              </Suspense>
            }
          />
          <Route
            path="register"
            element={
              <Suspense fallback={<RouteFallback />}>
                <RegisterPage />
              </Suspense>
            }
          />
          <Route
            path="wishlist"
            element={
              <Suspense fallback={<RouteFallback />}>
                <WishlistPage />
              </Suspense>
            }
          />
          <Route
            path="compare"
            element={
              <Suspense fallback={<RouteFallback />}>
                <ComparePage />
              </Suspense>
            }
          />
          <Route
            path="deals"
            element={
              <Suspense fallback={<RouteFallback />}>
                <CollectionPage kind="deals" />
              </Suspense>
            }
          />
          <Route
            path="best-sellers"
            element={
              <Suspense fallback={<RouteFallback />}>
                <CollectionPage kind="best-sellers" />
              </Suspense>
            }
          />
          <Route
            path="new-arrivals"
            element={
              <Suspense fallback={<RouteFallback />}>
                <CollectionPage kind="new-arrivals" />
              </Suspense>
            }
          />
          <Route
            path="trending"
            element={
              <Suspense fallback={<RouteFallback />}>
                <CollectionPage kind="trending" />
              </Suspense>
            }
          />
          <Route
            path="customer-service"
            element={
              <Suspense fallback={<RouteFallback />}>
                <CustomerServicePage />
              </Suspense>
            }
          />
          <Route
            path="sell"
            element={
              <Suspense fallback={<RouteFallback />}>
                <SellPage />
              </Suspense>
            }
          />
          <Route
            path="credits"
            element={
              <Suspense fallback={<RouteFallback />}>
                <CreditsPage />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<RouteFallback />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Route>
      </Routes>
    </Providers>
  );
}
