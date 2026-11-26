import { Link } from 'react-router-dom';
import { ArrowRight, Flame, Sparkles, TrendingUp } from 'lucide-react';
import type { Product } from '../types';
import { products } from '../data/products';
import { apiAvailable, fetchCollection } from '../data/api';
import { useApiData } from '../hooks/useApiData';
import { ProductCard } from '../components/product/ProductCard';
import { Countdown } from '../components/ui/Countdown';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { Seo } from '../components/ui/Seo';

export type CollectionKind =
  | 'deals'
  | 'best-sellers'
  | 'new-arrivals'
  | 'trending'
  | 'gen-z-picks'
  | 'viral';

const config = {
  deals: {
    eyebrow: 'Limited-time offers',
    title: "Today's Deals",
    description: 'Fresh markdowns across every department. Prices reset when the timer does.',
    path: '/deals',
    icon: Flame,
    gradient: 'from-[#7C2D12] via-[var(--brand-navy)] to-[var(--brand-navy-deep)]',
    cta: { label: 'Shop best sellers', to: '/best-sellers' },
  },
  'best-sellers': {
    eyebrow: 'Most loved',
    title: 'Best Sellers',
    description: 'The products shoppers keep coming back for, ranked by reviews and repeat orders.',
    path: '/best-sellers',
    icon: TrendingUp,
    gradient: 'from-[#134E4A] via-[var(--brand-navy)] to-[var(--brand-navy-deep)]',
    cta: { label: 'See new arrivals', to: '/new-arrivals' },
  },
  'new-arrivals': {
    eyebrow: 'Just landed',
    title: 'New Arrivals',
    description: 'New brands, new colours and new reasons to upgrade. Updated every week.',
    path: '/new-arrivals',
    icon: Sparkles,
    gradient: 'from-[#4C1D95] via-[var(--brand-navy)] to-[var(--brand-navy-deep)]',
    cta: { label: 'Browse all products', to: '/search' },
  },
  trending: {
    eyebrow: 'Picking up pace',
    title: 'Trending Now',
    description: 'The products gaining momentum this week across tech, style, beauty and home.',
    path: '/trending',
    icon: TrendingUp,
    gradient: 'from-[#9A3412] via-[var(--brand-navy)] to-[var(--brand-navy-deep)]',
    cta: { label: 'Shop best sellers', to: '/best-sellers' },
  },
  'gen-z-picks': {
    eyebrow: 'Curated for you',
    title: 'Gen Z Picks',
    description: 'The gadgets, fits and accessories on our Gen Z shortlist this season.',
    path: '/gen-z-picks',
    icon: Sparkles,
    gradient: 'from-[#1D4ED8] via-[var(--brand-navy)] to-[var(--brand-navy-deep)]',
    cta: { label: 'See what is viral', to: '/viral' },
  },
  viral: {
    eyebrow: 'Scroll-stopping finds',
    title: 'Viral Now',
    description: 'The shared, saved and talked-about picks making the rounds right now.',
    path: '/viral',
    icon: Flame,
    gradient: 'from-[#86198F] via-[var(--brand-navy)] to-[var(--brand-navy-deep)]',
    cta: { label: 'Shop Gen Z picks', to: '/gen-z-picks' },
  },
} satisfies Record<CollectionKind, {
  eyebrow: string;
  title: string;
  description: string;
  path: string;
  icon: typeof Flame;
  gradient: string;
  cta: { label: string; to: string };
}>;

/** Bounded local fallback — scans only the 20 bundled products. */
function localCollectionProducts(kind: CollectionKind): Product[] {
  if (kind === 'deals') {
    return products
      .filter((product) => product.isDeal || product.discount > 0)
      .sort((a, b) => b.discount - a.discount);
  }
  if (kind === 'best-sellers') {
    return products
      .filter((product) => product.isBestSeller)
      .sort((a, b) => b.reviewCount - a.reviewCount);
  }
  if (kind === 'trending') {
    return products
      .filter((product) => product.isTrending)
      .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  }
  if (kind === 'gen-z-picks') {
    return products
      .filter((product) => product.isGenZPick)
      .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  }
  if (kind === 'viral') {
    return products
      .filter((product) => product.isViral)
      .sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
  }
  return [...products].sort((a, b) => b.addedAt.localeCompare(a.addedAt));
}

export default function CollectionPage({ kind }: { kind: CollectionKind }) {
  const meta = config[kind];
  const Icon = meta.icon;
  const state = useApiData(
    async (signal) => {
      if (!(await apiAvailable())) throw new Error('API unavailable');
      return fetchCollection(kind, 48, signal);
    },
    [kind],
    () => localCollectionProducts(kind)
  );
  const list = state.data;
  const maxDiscount = Math.max(...list.map((product) => product.discount), 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Seo title={meta.title} description={meta.description} path={meta.path} />

      <header className={`overflow-hidden rounded-2xl bg-gradient-to-br ${meta.gradient} px-6 py-8 text-white shadow-xl sm:px-10 sm:py-10`}>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-yellow)]">
              <Icon className="h-4 w-4" aria-hidden="true" /> {meta.eyebrow}
            </p>
            <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">{meta.title}</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">{meta.description}</p>
            <p className="mt-3 text-xs font-semibold text-white/60">
              {list.length} products{kind === 'deals' ? ` · up to ${maxDiscount}% off` : ''}
            </p>
          </div>
          <div className="flex flex-col items-start gap-3">
            {kind === 'deals' && <Countdown label="Deals end in" />}
            <Link
              to={meta.cta.to}
              className="inline-flex items-center gap-2 rounded-full bg-[var(--brand-yellow)] px-5 py-2.5 text-sm font-bold text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              {meta.cta.label} <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      {state.loading ? (
        <div className="mt-6">
          <ProductGridSkeleton count={12} />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-[var(--brand-line)] bg-white p-5 text-center">
        <h2 className="font-serif text-xl font-bold text-[var(--brand-ink)]">Looking for something else?</h2>
        <p className="mt-1 text-sm text-[var(--brand-muted)]">Search the full catalogue or browse by department.</p>
        <div className="mt-3 flex flex-wrap justify-center gap-2">
          <Link
            to="/search"
            className="rounded-lg bg-[var(--brand-orange)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--brand-orange-dark)]"
          >
            Browse all products
          </Link>
          <Link
            to="/customer-service"
            className="rounded-lg border border-[var(--brand-line)] px-4 py-2 text-sm font-semibold text-[var(--brand-ink)] hover:border-[var(--brand-navy)]"
          >
            Get help
          </Link>
        </div>
      </div>
    </div>
  );
}
