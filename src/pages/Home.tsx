import { Link } from 'react-router-dom';
import { ArrowRight, Clock3, Flame, Sparkles } from 'lucide-react';
import { categories } from '../data/categories';
import { products, bestSellers, deals } from '../data/products';
import { getProductById } from '../data/products';
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

export default function HomePage() {
  const { t, money } = useSite();
  const { wishlist, recent } = useStore();

  const dealOfDay =
    deals.filter((product) => product.isDeal).sort((a, b) => b.discount - a.discount)[0] ?? products[0];
  const moreDeals = deals.filter((product) => product.id !== dealOfDay.id).slice(0, 4);

  const affinity = new Set(
    [...wishlist, ...recent]
      .map((id) => getProductById(id)?.category)
      .filter((value): value is NonNullable<typeof value> => Boolean(value))
  );
  const recommended = (
    affinity.size > 0
      ? products.filter((product) => affinity.has(product.category) && !wishlist.includes(product.id))
      : [...products].sort((a, b) => b.rating - a.rating)
  ).slice(0, 8);

  const recentlyViewed = recent
    .map((id) => getProductById(id))
    .filter((product): product is NonNullable<ReturnType<typeof getProductById>> => Boolean(product))
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
        title="Best sellers"
        subtitle="What everyone in your area is buying"
        products={bestSellers.slice(0, 8)}
        href="/best-sellers"
      />

      <ProductRow
        title="Recommended for you"
        subtitle={affinity.size > 0 ? 'Based on your wishlist and browsing' : 'Top-rated picks across the store'}
        products={recommended}
        href="/search?sort=rating"
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
              Up to 60% off electronics, home, fashion and more. New deals land every morning — grab them before the
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
