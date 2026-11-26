import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  BadgeCheck, Check, ChevronRight, GitCompareArrows, Heart, MapPin, RotateCcw, ShieldCheck, ShoppingCart, Sparkles,
  TrendingUp, Truck,
} from 'lucide-react';
import type { Product } from '../types';
import { getProduct, products } from '../data/products';
import { apiAvailable, fetchProductBySlug, fetchRelated } from '../data/api';
import { useApiData } from '../hooks/useApiData';
import { getCategory } from '../data/categories';
import { creditFor, resolveImages } from '../data/imageMap';
import { relatedProducts } from '../lib/search';
import { deliveryDateRange, classNames } from '../lib/format';
import { useStore } from '../context/StoreContext';
import { useSite } from '../context/SiteContext';
import { ProductGallery } from '../components/product/ProductGallery';
import { Reviews } from '../components/product/Reviews';
import { FrequentlyBoughtTogether } from '../components/product/FrequentlyBoughtTogether';
import { ProductRow } from '../components/product/ProductRow';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { Price } from '../components/ui/Price';
import { Rating } from '../components/ui/Rating';
import { QuantitySelect } from '../components/ui/QuantitySelect';
import { EmptyState } from '../components/ui/EmptyState';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { Seo } from '../components/ui/Seo';
import { Button } from '../components/ui/Button';

interface BuyBoxProps {
  product: Product;
}

function BuyBox({ product }: BuyBoxProps) {
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, wishlist, toggleCompare, compare } = useStore();
  const { country, city, countryCode, language, setCountryModalOpen, money, t } = useSite();
  const [qty, setQty] = useState(1);

  const saved = wishlist.includes(product.id);
  const comparing = compare.includes(product.id);
  const outOfStock = product.stock <= 0;

  return (
    <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-4 shadow-sm">
      <Price price={product.price} listPrice={product.listPrice} size="lg" />
      <p className="mt-1 text-xs text-[var(--brand-muted)]">
        {money(product.price)} · Import fees and taxes calculated at checkout
      </p>

      <button
        type="button"
        onClick={() => setCountryModalOpen(true)}
        className="mt-3 flex w-full items-center gap-1.5 rounded-lg bg-[var(--brand-cream)] px-2.5 py-2 text-left text-xs text-[var(--brand-ink)] hover:bg-[var(--brand-line)]/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
      >
        <MapPin className="h-3.5 w-3.5 shrink-0 text-[var(--brand-orange)]" aria-hidden="true" />
        <span>
          Deliver to <strong>{city}, {country.name}</strong> — change
        </span>
      </button>

      <p className="mt-3 text-lg font-bold text-[var(--brand-success)]">
        {product.price >= 35 ? 'FREE delivery' : 'Delivery from ' + money(4.99)}
      </p>
      <p className="text-sm text-[var(--brand-ink)]">
        Arrives <strong>{deliveryDateRange(product.deliveryDays, countryCode, false, language)}</strong>
      </p>
      <p className="mt-1 flex items-center gap-1 text-xs text-[var(--brand-muted)]">
        <Truck className="h-3.5 w-3.5" aria-hidden="true" /> Express available at checkout
      </p>

      <p className={classNames('mt-3 text-lg font-bold', outOfStock ? 'text-[var(--brand-danger)]' : 'text-[var(--brand-success)]')}>
        {outOfStock ? 'Currently unavailable' : product.stock < 10 ? `Only ${product.stock} left in stock` : 'In stock'}
      </p>

      <div className="mt-3">
        <QuantitySelect value={qty} onChange={setQty} max={Math.max(1, Math.min(10, product.stock))} label="Quantity" />
      </div>

      <div className="mt-3 space-y-2">
        <Button
          variant="accent"
          fullWidth
          disabled={outOfStock}
          onClick={() => addToCart(product.id, qty, { snapshot: product })}
        >
          <ShoppingCart className="h-4 w-4" aria-hidden="true" /> {t('addToCart')}
        </Button>
        <Button
          variant="primary"
          fullWidth
          disabled={outOfStock}
          onClick={() => {
            addToCart(product.id, qty, { snapshot: product, openDrawer: false, silent: true });
            navigate('/checkout');
          }}
        >
          {t('buyNow')}
        </Button>
      </div>

      <div className="mt-3 flex flex-col gap-1.5 text-xs">
        <button
          type="button"
          onClick={() => toggleWishlist(product.id, product)}
          aria-pressed={saved}
          className="flex items-center gap-1.5 text-left text-[var(--brand-navy)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
        >
          <Heart className={classNames('h-3.5 w-3.5', saved && 'fill-[var(--brand-danger)] text-[var(--brand-danger)]')} aria-hidden="true" />
          {saved ? 'Saved to your wishlist' : 'Add to wishlist'}
        </button>
        <button
          type="button"
          onClick={() => toggleCompare(product.id, product)}
          aria-pressed={comparing}
          className="flex items-center gap-1.5 text-left text-[var(--brand-navy)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
        >
          <GitCompareArrows className="h-3.5 w-3.5" aria-hidden="true" />
          {comparing ? 'Added to compare' : 'Add to compare'}
        </button>
      </div>

      <dl className="mt-4 space-y-1.5 border-t border-[var(--brand-line)] pt-3 text-xs">
        <div className="flex justify-between gap-2">
          <dt className="text-[var(--brand-muted)]">Ships from</dt>
          <dd className="font-semibold text-[var(--brand-ink)]">Soko Fulfilment</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-[var(--brand-muted)]">Sold by</dt>
          <dd className="text-right font-semibold text-[var(--brand-ink)]">{product.seller}</dd>
        </div>
        <div className="flex justify-between gap-2">
          <dt className="text-[var(--brand-muted)]">Returns</dt>
          <dd className="font-semibold text-[var(--brand-ink)]">30-day returns</dd>
        </div>
      </dl>

      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <span className="flex items-center gap-1 rounded-lg bg-[var(--brand-cream)] p-2 font-medium text-[var(--brand-ink)]">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[var(--brand-success)]" aria-hidden="true" /> Secure transaction
        </span>
        <span className="flex items-center gap-1 rounded-lg bg-[var(--brand-cream)] p-2 font-medium text-[var(--brand-ink)]">
          <RotateCcw className="h-4 w-4 shrink-0 text-[var(--brand-success)]" aria-hidden="true" /> Easy returns
        </span>
      </div>
    </div>
  );
}

export default function ProductPage() {
  const { slug = '' } = useParams<{ slug: string }>();
  const { addRecent, recent } = useStore();
  const { countryCode, language, t } = useSite();

  const productState = useApiData(
    async (signal) => {
      if (!(await apiAvailable())) throw new Error('API unavailable');
      return fetchProductBySlug(slug, signal);
    },
    [slug],
    () => getProduct(slug)
  );
  const product = productState.data;

  const relatedFallback = useCallback(
    () => (product ? relatedProducts(products, product, 8) : []),
    [product]
  );
  const relatedState = useApiData(
    async (signal) => {
      if (!(await apiAvailable())) throw new Error('API unavailable');
      return fetchRelated(slug, 8, signal);
    },
    [slug],
    relatedFallback
  );

  useEffect(() => {
    if (product) addRecent(product.id, product);
  }, [product, addRecent]);

  if (!product) {
    if (productState.loading) {
      return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
          <ProductGridSkeleton count={1} />
        </div>
      );
    }
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Product not found"
          description="The listing may have moved or sold out. Browse the store to find something similar."
          action={
            <Link
              to="/search"
              className="inline-flex rounded-lg bg-[var(--brand-orange)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-orange-dark)]"
            >
              Browse all products
            </Link>
          }
        />
      </div>
    );
  }

  const category = getCategory(product.category);
  const alsoViewed = relatedState.data.filter((entry) => !recent.includes(entry.id)).slice(0, 8);
  const images = resolveImages(product);
  const delivery = deliveryDateRange(product.deliveryDays, countryCode, false, language);

  return (
    <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6">
      <Seo
        title={product.title}
        description={`${product.bullets[0]} — ${product.brand}. ${product.rating} out of 5 from ${product.reviewCount} reviews.`}
        path={`/product/${product.slug}`}
        image={images[0].src}
      />

      <Breadcrumbs
        items={[
          { label: t('home'), to: '/' },
          { label: category?.name ?? 'Products', to: `/category/${product.category}` },
          { label: product.title },
        ]}
      />

      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-6">
          <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <ProductGallery
              images={images}
              title={product.name}
              discount={product.discount}
              credit={creditFor(product)}
            />
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-muted)]">
                <Link to={`/search?q=${encodeURIComponent(product.brand)}`} className="hover:text-[var(--brand-orange)] hover:underline">
                  {product.brand}
                </Link>
              </p>
              <h1 className="mt-1 font-serif text-2xl font-bold leading-tight text-[var(--brand-ink)] sm:text-3xl">
                {product.title}
              </h1>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {product.isBestSeller && (
                  <span className="inline-flex items-center gap-1 rounded bg-[var(--brand-yellow)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[var(--brand-navy-deep)]">
                    <BadgeCheck className="h-3 w-3" aria-hidden="true" /> Best seller
                  </span>
                )}
                {product.isTrending && (
                  <span className="inline-flex items-center gap-1 rounded bg-[var(--brand-orange)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    <TrendingUp className="h-3 w-3" aria-hidden="true" /> Trending
                  </span>
                )}
                {product.isGenZPick && (
                  <span className="inline-flex items-center gap-1 rounded bg-[var(--brand-navy-deep)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    <Sparkles className="h-3 w-3" aria-hidden="true" /> Gen Z Pick
                  </span>
                )}
                {product.isViral && (
                  <span className="inline-flex items-center gap-1 rounded bg-fuchsia-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                    <Sparkles className="h-3 w-3" aria-hidden="true" /> Viral
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">{product.shortDescription}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Rating rating={product.rating} size="md" showNumber />
                <a
                  href="#reviews"
                  className="text-sm font-semibold text-[var(--brand-navy)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                >
                  {product.reviewCount.toLocaleString()} ratings
                </a>
              </div>

              <div className="mt-3 lg:hidden">
                <BuyBox product={product} />
              </div>

              <div className="mt-4 hidden lg:block">
                <Price price={product.price} listPrice={product.listPrice} size="lg" />
                <p className="mt-1 text-xs text-[var(--brand-muted)]">Price excludes delivery and taxes.</p>
              </div>

              <ul className="mt-4 space-y-1.5 border-t border-[var(--brand-line)] pt-4">
                {product.bullets.map((bullet) => (
                  <li key={bullet} className="flex gap-2 text-sm leading-6 text-[var(--brand-ink)]">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-[var(--brand-success)]" aria-hidden="true" />
                    {bullet}
                  </li>
                ))}
              </ul>

              <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-[var(--brand-success)]">
                <Truck className="h-4 w-4" aria-hidden="true" /> Delivery {delivery} to your location
              </p>
            </div>
          </div>

          <section aria-labelledby="specs-heading" className="rounded-2xl border border-[var(--brand-line)] bg-white p-4 sm:p-5">
            <h2 id="specs-heading" className="font-serif text-xl font-bold text-[var(--brand-ink)]">
              Product details
            </h2>
            <dl className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className="flex justify-between gap-3 border-b border-[var(--brand-line)] py-1.5">
                  <dt className="text-[var(--brand-muted)]">{key}</dt>
                  <dd className="text-right font-medium text-[var(--brand-ink)]">{value}</dd>
                </div>
              ))}
              <div className="flex justify-between gap-3 border-b border-[var(--brand-line)] py-1.5">
                <dt className="text-[var(--brand-muted)]">Brand</dt>
                <dd className="text-right font-medium text-[var(--brand-ink)]">{product.brand}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-[var(--brand-line)] py-1.5">
                <dt className="text-[var(--brand-muted)]">Department</dt>
                <dd className="text-right font-medium text-[var(--brand-ink)]">{category?.name}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-[var(--brand-line)] py-1.5">
                <dt className="text-[var(--brand-muted)]">Seller</dt>
                <dd className="text-right font-medium text-[var(--brand-ink)]">{product.seller}</dd>
              </div>
              <div className="flex justify-between gap-3 border-b border-[var(--brand-line)] py-1.5">
                <dt className="text-[var(--brand-muted)]">Item ID</dt>
                <dd className="text-right font-mono text-xs font-medium text-[var(--brand-ink)]">{product.id}</dd>
              </div>
            </dl>
            <p className="mt-3 flex items-center gap-1.5 text-xs text-[var(--brand-success)]">
              <BadgeCheck className="h-4 w-4" aria-hidden="true" /> Backed by the Soko 30-day return promise
            </p>
          </section>

          <FrequentlyBoughtTogether product={product} />

          <Reviews product={product} />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-36">
            <BuyBox product={product} />
          </div>
        </aside>
      </div>

      {alsoViewed.length > 0 && (
        <div className="mt-10">
          <ProductRow
            title="Customers also viewed"
            subtitle="More picks from this department"
            products={alsoViewed}
            href={`/category/${product.category}`}
            linkLabel="See the department"
          />
        </div>
      )}

      <nav aria-label="Continue browsing" className="mt-8 flex flex-wrap gap-2">
        <Link
          to="/deals"
          className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--brand-ink)] hover:border-[var(--brand-navy)]"
        >
          Today&apos;s deals <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </Link>
        <Link
          to="/best-sellers"
          className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--brand-ink)] hover:border-[var(--brand-navy)]"
        >
          Best sellers <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </Link>
        <Link
          to="/new-arrivals"
          className="inline-flex items-center gap-1 rounded-full border border-[var(--brand-line)] bg-white px-3 py-1.5 text-xs font-semibold text-[var(--brand-ink)] hover:border-[var(--brand-navy)]"
        >
          New arrivals <ChevronRight className="h-3 w-3" aria-hidden="true" />
        </Link>
      </nav>
    </div>
  );
}
