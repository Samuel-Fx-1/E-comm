import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft, Compass, Search } from 'lucide-react';
import { Seo } from '../components/ui/Seo';

export default function NotFoundPage() {
  const location = useLocation();

  return (
    <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center sm:px-6">
      <Seo title="Page not found" path={location.pathname} noIndex />
      <span className="grid h-20 w-20 place-items-center rounded-full bg-[var(--brand-cream)] text-[var(--brand-orange)]">
        <Compass className="h-10 w-10" aria-hidden="true" />
      </span>
      <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-orange)]">404 · Lost in the aisles</p>
      <h1 className="mt-2 font-serif text-4xl font-bold text-[var(--brand-ink)] sm:text-5xl">We couldn't find that page</h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-[var(--brand-muted)]">
        The address <code className="rounded bg-white px-1.5 py-0.5 font-mono text-xs">{location.pathname}</code> does not
        match any route in this storefront. Try searching the catalogue or head back home.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--brand-yellow)] px-5 py-2.5 text-sm font-bold text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Back to home
        </Link>
        <Link
          to="/search"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--brand-line)] bg-white px-5 py-2.5 text-sm font-semibold text-[var(--brand-ink)] hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
        >
          <Search className="h-4 w-4" aria-hidden="true" /> Search products
        </Link>
      </div>
    </div>
  );
}
