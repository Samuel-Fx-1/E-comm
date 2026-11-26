import { useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, Flame, Sparkles } from 'lucide-react';
import { categories } from '../data/categories';
import { products, bestSellers, deals, newArrivals, trending, genZPicks, viral } from '../data/products';
import { apiAvailable, fetchCollection, fetchProducts } from '../data/api';
import { resolveProduct } from '../data/productLookup';
import { useApiData } from '../hooks/useApiData';
import { imagesFor } from '../data/imageMap';
import { useSite } from '../context/SiteContext';
import { useStore } from '../context/StoreContext';
import { PromoCarousel } from '../components/home/PromoCarousel';
import { ProductRow } from '../components/product/ProductRow';
import { Seo } from '../components/ui/Seo';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { Rating } from '../components/ui/Rating';
import { Price } from '../components/ui/Price';
import { Countdown } from '../components/ui/Countdown';
import { CategoryIcon } from '../components/ui/CategoryIcon';

/** All local fallbacks are bounded to the 20 curated products. */
export default function HomePage() {
  const { t, money } = useSite();
  const { wishlist, recent } = useStore();

  const dealState = useApiData(
    async (signal) => {
      if (!(await apiAvailable())) throw new Error('API unavailable');
      return fetchCollection('deals', 12, signal);
    },
    [],
    () => [...deals].sort((a, b) => b.discount - a.discount).slice(0, 12)
  );
  const bestSellerState = useApiData(
    async (signal) => {
      if (!(await apiAvailable())) throw new Error('API unavailable');
      return fetchCollection('best-sellers', 8, signal);
    },
    [],
    () => [...bestSellers].sort((a, b) => b.reviewCount - a.reviewCount).slice(0, 8)
  );
  const newArrivalState = useApiData(
    async (signal) => {
      if (!(await apiAvailable())) throw new Error('API unavailable');
      return fetchCollection('new-arrivals', 8, signal);
    },
    [],
    () => newArrivals.slice(0, 8)
  );
  const trendingState = useApiData(
    async (signal) => {
      if (!(await apiAvailable())) throw new Error('API unavailable');
      return fetchCollection('trending', 8, signal);
    },
    [],
    () => trending.slice(0, 8)
  );
  const featuredState = useApiData(
    async (signal) => {
      if (!(await apiAvailable())) throw new Error('API unavailable');
      return fetchCollection('featured', 8, signal);
    },
    [],
    () =>
      [...products]
        .sort((a, b) =>
          Number(b.isGenZPick) - Number(a.isGenZPick) ||
          Number(b.isViral) - Number(a.isViral) ||
          Number(b.isTrending) - Number(a.isTrending) ||
          Number(b.isBestSeller) - Number(a.isBestSeller) ||
          b.rating - a.rating
        )
        .slice(0, 8)
  );
  const genZPickState = useApiData(
    async (signal) => {
      if (!(await apiAvailable())) throw new Error('API unavailable');
      return fetchCollection('gen-z-picks', 8, signal);
    },
    [],
    () => genZPicks.slice(0, 8)
  );
  const viralState = useApiData(
    async (signal) => {
      if (!(await apiAvailable())) throw new Error('API unavailable');
      return fetchCollection('viral', 8, signal);
    },
    [],
    () => viral.slice(0, 8)
  );

  const wishlistKey = wishlist.join(',');
  const affinityCategory = useMemo(() => {
    const ids = wishlistKey ? wishlistKey.split(',') : [];
    return [...ids, ...recent].map((id) => resolveProduct(id)?.category).find(Boolean);
  }, [wishlistKey, recent]);

  const recommendLoader = useCallback(
    async (signal: AbortSignal) => {
      if (!(await apiAvailable())) throw new Error('API unavailable');
      const page = await fetchProducts(
        { category: affinityCategory, sort: 'rating', pageSize: 8 },
        signal
      );
      return page.items.filter((product) => !wishlist.includes(product.id)).slice(0, 8);
    },
    // `wishlist` is represented by `wishlistKey` for stable dependencies.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [affinityCategory, wishlistKey]
  );
  const recommendedState = useApiData(recommendLoader, [affinityCategory, wishlistKey], () => {
    const source =
      affinityCategory
        ? products.filter((product) => product.category === affinityCategory)
        : [...products].sort((a, b) => b.rating - a.rating);
    return source.filter((product) => !wishlist.includes(product.id)).slice(0, 8);
  });

  const dealProducts = dealState.data;
  const dealOfDay = dealProducts.find((product) => product.isDeal) ?? dealProducts[0] ?? products[0];
  const moreDeals = dealProducts.filter((product) => product.id !== dealOfDay.id).slice(0, 4);
  const recommended = recommendedState.data;
  const recentlyViewed = recent
    .map((id) => resolveProduct(id))
    .filter((product): product is NonNullable<typeof product> => Boolean(product))
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-6 sm:px-6">
      <Seo path="/" />

      <PromoCarousel />

      <section aria-labelledby="categories-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-orange)]">Browse the aisles</p>
            <h2 id="categories-heading" className="font-serif text-2xl font-bold text-[var(--brand-ink)] sm:text-3xl">
              Shop by category
            </h2>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              to={`/category/${category.slug}`}
              className={`group relative flex min-h-[150px] flex-col justify-between overflow-hidden rounded-xl bg-gradient-to-br ${category.gradient} p-4 text-white shadow-md transition-transform hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]`}
            >
              <CategoryIcon
                name={category.icon}
                className="absolute -bottom-4 -right-4 h-24 w-24 text-white/10 transition-transform duration-300 group-hover:scale-110"
              />
              <CategoryIcon name={category.icon} className="h-6 w-6 text-[var(--brand-yellow)]" />
              <div>
                <h3 className="text-base font-bold leading-tight">{category.name}</h3>
                <p className="mt-1 line-clamp-2 text-[11px] leading-4 text-white/70">{category.blurb}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--brand-yellow)]">
                  Shop now <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="deal-heading" className="rounded-2xl border border-[var(--brand-line)] bg-white p-4 shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 rounded-full bg-[var(--brand-danger)] px-3 py-1 text-xs font-bold uppercase tracking-wide text-white">
              <Flame className="h-3.5 w-3.5" aria-hidden="true" /> Deal of the day
            </span>
            <span className="hidden items-center gap-1 text-xs text-[var(--brand-muted)] sm:flex">
              <Clock3 className="h-3.5 w-3.5" aria-hidden="true" /> Limited stock
            </span>
          </div>
          <Countdown />
        </div>

        <div className="mt-5 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <div className="flex flex-col gap-5 sm:flex-row">
            <Link
              to={`/product/${dealOfDay.slug}`}
              className="shrink-0 overflow-hidden rounded-xl bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
            >
              <ImageWithFallback
                src={imagesFor(dealOfDay)[0]}
                alt={dealOfDay.title}
                priority
                className="h-56 w-full object-cover transition-transform duration-300 hover:scale-105 sm:h-64 sm:w-64"
              />
            </Link>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">{dealOfDay.brand}</p>
              <h2 id="deal-heading" className="text-2xl font-bold leading-tight text-[var(--brand-ink)]">
                {dealOfDay.title}
              </h2>
              <Rating rating={dealOfDay.rating} count={dealOfDay.reviewCount} showNumber />
              <Price price={dealOfDay.price} listPrice={dealOfDay.listPrice} size="lg" />
              <p className="text-sm text-[var(--brand-muted)]">{dealOfDay.bullets[0]}</p>
              <p className="text-xs font-semibold text-[var(--brand-danger)]">
                Save {money(dealOfDay.listPrice - dealOfDay.price)} today
              </p>
              <Link
                to={`/product/${dealOfDay.slug}`}
                className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-[var(--brand-yellow)] px-5 py-2.5 text-sm font-bold text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
              >
                Shop the deal <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>

          <div className="border-t border-[var(--brand-line)] pt-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--brand-muted)]">More deals today</h3>
            <ul className="mt-3 divide-y divide-[var(--brand-line)]">
              {moreDeals.map((product) => (
                <li key={product.id}>
                  <Link
                    to={`/product/${product.slug}`}
                    className="flex items-center gap-3 py-2.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                  >
                    <ImageWithFallback
                      src={imagesFor(product)[0]}
                      alt={product.title}
                      className="h-14 w-14 shrink-0 rounded-lg object-cover"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="line-clamp-2 text-xs font-semibold leading-4 text-[var(--brand-ink)]">
                        {product.title}
                      </span>
                      <span className="mt-1 flex items-center gap-2 text-xs">
                        <span className="font-bold text-[var(--brand-ink)]">{money(product.price)}</span>
                        <span className="text-[var(--brand-danger)]">-{product.discount}%</span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <ProductRow
        title="Trending now"
        subtitle="The picks picking up pace this week"
        products={trendingState.data}
        href="/trending"
      />

      <ProductRow
        title="Best sellers"
        subtitle="What everyone in your area is buying"
        products={bestSellerState.data}
        href="/best-sellers"
      />

      <ProductRow
        title="Featured now"
        subtitle="Flagged first: our picks, viral finds and best sellers"
        products={featuredState.data}
        href="/gen-z-picks"
      />

      <ProductRow
        title="Gen Z picks"
        subtitle="The shortlist your feed keeps coming back to"
        products={genZPickState.data}
        href="/gen-z-picks"
      />

      <ProductRow
        title="Viral now"
        subtitle="Saved, shared and showing up everywhere"
        products={viralState.data}
        href="/viral"
      />

      <ProductRow
        title="Recommended for you"
        subtitle={affinityCategory ? 'Based on your wishlist and browsing' : 'Top-rated picks across the store'}
        products={recommended}
        href="/search?sort=rating"
      />

      <ProductRow
        title="New arrivals"
        subtitle="The latest picks, fresh off the shelf"
        products={newArrivalState.data}
        href="/new-arrivals"
      />

      <section
        aria-labelledby="seasonal-heading"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-navy-deep)] via-[var(--brand-navy)] to-[var(--brand-navy-soft)] px-6 py-10 text-white shadow-xl sm:px-10"
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[var(--brand-orange)]/20 blur-2xl" aria-hidden="true" />
        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-[var(--brand-yellow)]/10 blur-2xl" aria-hidden="true" />
        <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-yellow)]">
              <Sparkles className="h-4 w-4" aria-hidden="true" /> Black Friday week
            </p>
            <h2 id="seasonal-heading" className="mt-2 font-serif text-4xl font-bold leading-tight sm:text-5xl">
              Big savings. <span className="text-[var(--brand-orange)]">All week.</span>
            </h2>
            <p className="mt-2 max-w-lg text-sm text-white/75">
              Up to 60% off tech, apparel, skincare, home and more. New deals land every morning — grab them before the
              timer resets.
            </p>
          </div>
          <div className="flex flex-col items-start gap-4">
            <Countdown label="Sale ends in" />
            <Link
              to="/deals"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-orange)] px-6 py-3 text-sm font-bold text-white hover:bg-[var(--brand-orange-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)]"
            >
              Shop all deals <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {recentlyViewed.length > 0 && (
        <ProductRow
          title="Recently viewed"
          subtitle="Pick up where you left off"
          products={recentlyViewed}
          href="/search"
          linkLabel="Browse all"
        />
      )}

      <section className="rounded-2xl border border-[var(--brand-line)] bg-white p-6 text-center">
        <h2 className="font-serif text-2xl font-bold text-[var(--brand-ink)]">New here? Start with the essentials.</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-[var(--brand-muted)]">
          {t('freeDelivery')} on orders over {money(35)}. Standard delivery is available across Rwanda and 13 more
          countries.
        </p>
        <Link
          to="/new-arrivals"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--brand-navy)] px-5 py-2.5 text-sm font-bold text-[var(--brand-navy)] hover:bg-[var(--brand-navy)] hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
        >
          See what just landed <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
