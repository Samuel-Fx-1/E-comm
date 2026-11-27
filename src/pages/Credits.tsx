import { Link } from 'react-router-dom';
import { allCreditedPhotos, fallbackProducts } from '../data/imageMap';
import { Seo } from '../components/ui/Seo';
import { Breadcrumbs } from '../components/ui/Breadcrumbs';
import { EmptyState } from '../components/ui/EmptyState';

export default function CreditsPage() {
  const credited = allCreditedPhotos();
  const fallbacks = fallbackProducts();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Seo
        title="Image credits"
        description="Photographers, sources and licences for product images shown on Soko."
        path="/credits"
      />
      <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Image credits' }]} />

      <h1 className="mt-4 font-serif text-3xl font-bold text-[var(--brand-ink)]">Image credits</h1>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-[var(--brand-muted)]">
        Product photos are declared in{' '}
        <code className="rounded bg-[var(--brand-cream)] px-1">data/catalog/*.json</code> and hotlinked from{' '}
        <code className="rounded bg-[var(--brand-cream)] px-1">images.pexels.com</code>; they are never downloaded or
        rehosted. Your own overrides can be stored locally. Every photo keeps its photographer and licence link below.
      </p>

      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <a href="https://www.pexels.com/api/documentation/" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-navy)] underline">
          Pexels API
        </a>
        <a href="https://www.pexels.com/license/" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-navy)] underline">
          Pexels License
        </a>
        <a href="https://unsplash.com/license" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-navy)] underline">
          Unsplash License
        </a>
        <a href="https://pixabay.com/service/license/" target="_blank" rel="noopener noreferrer" className="text-[var(--brand-navy)] underline">
          Pixabay Content License
        </a>
      </div>

      {credited.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No stock photos resolved yet"
            description="No licensed gallery photos have been added yet. Add Pexels photos to the catalog JSON and credits will appear here."
            action={
              <Link to="/search" className="inline-flex rounded-lg bg-[var(--brand-orange)] px-4 py-2.5 text-sm font-semibold text-white">
                Browse products
              </Link>
            }
          />
        </div>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {credited.map(({ product, image, credit }, index) => (
            <li key={`${product.id}-${index}`} className="rounded-xl border border-[var(--brand-line)] bg-white p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">{product.brand}</p>
              <Link to={`/product/${product.slug}`} className="mt-1 block text-sm font-bold text-[var(--brand-ink)] hover:underline">
                {product.name}
              </Link>
              <p className="mt-2 text-xs text-[var(--brand-muted)]">
                Photo by{' '}
                <a href={credit.photographerUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  {credit.photographer}
                </a>{' '}
                via{' '}
                <a href={credit.photoUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  {image.source === 'unsplash' ? 'Unsplash' : image.source === 'pixabay' ? 'Pixabay' : 'Pexels'}
                </a>
              </p>
              <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="mt-1 inline-block text-[11px] text-[var(--brand-muted)] underline">
                {credit.license}
              </a>
            </li>
          ))}
        </ul>
      )}

      <section className="mt-10 rounded-2xl border border-[var(--brand-line)] bg-white p-5">
        <h2 className="font-serif text-xl font-bold text-[var(--brand-ink)]">Photos needed</h2>
        <p className="mt-2 text-sm leading-6 text-[var(--brand-muted)]">
          Products with no usable gallery photo are listed here instead of being filled with generated artwork.{' '}
          {fallbacks.length} product(s) currently need manual photo replacement.
        </p>
        {fallbacks.length > 0 && (
          <details className="mt-3">
            <summary className="cursor-pointer text-sm font-semibold text-[var(--brand-navy)]">
              Show products needing photos ({fallbacks.length})
            </summary>
            <ul className="mt-3 grid gap-1 text-xs text-[var(--brand-muted)] sm:grid-cols-2">
              {fallbacks.map((product) => (
                <li key={product.id}>
                  <Link to={`/product/${product.slug}`} className="hover:underline">
                    {product.name}
                  </Link>
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>
    </div>
  );
}
