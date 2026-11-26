import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { getProductById } from '../data/products';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/product/ProductCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Seo } from '../components/ui/Seo';

export default function WishlistPage() {
  const { wishlist, addToCart } = useStore();
  const products = wishlist
    .map((id) => getProductById(id))
    .filter((product): product is NonNullable<ReturnType<typeof getProductById>> => Boolean(product));

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Seo title="Wishlist" path="/wishlist" noIndex />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-orange)]">Saved for later</p>
          <h1 className="font-serif text-3xl font-bold text-[var(--brand-ink)] sm:text-4xl">Your wishlist</h1>
          <p className="mt-1 text-sm text-[var(--brand-muted)]">
            {products.length} saved item{products.length === 1 ? '' : 's'}. Wishlists stay in this browser.
          </p>
        </div>
        {products.length > 0 && (
          <button
            type="button"
            onClick={() => products.forEach((product) => addToCart(product.id, 1, { silent: true, openDrawer: false }))}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-yellow)] px-4 py-2.5 text-sm font-bold text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
          >
            <ShoppingCart className="h-4 w-4" aria-hidden="true" /> Add all to cart
          </button>
        )}
      </div>

      {products.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={<Heart className="h-7 w-7" aria-hidden="true" />}
            title="Your wishlist is empty"
            description="Tap the heart on any product to keep it here for later. Your list is saved on this device."
            action={
              <Link to="/search" className="rounded-lg bg-[var(--brand-orange)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-orange-dark)]">
                Discover products
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
