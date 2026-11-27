import { catalogEntries } from '../data/catalog';
import { creditsFor, resolveImages } from '../data/imageMap';
import { products } from '../data/products';

const productBySlug = new Map(products.map((product) => [product.slug, product]));

export default function DevImageReviewPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-3xl font-bold text-[var(--brand-ink)]">Image review</h1>
      <p className="mt-2 max-w-3xl text-sm text-[var(--brand-muted)]">
        Development-only gallery audit. Each product shows four slots, its Pexels search queries and the photographer
        credited for every photo. Empty slots need a real photo; no generated artwork is substituted.
      </p>

      <div className="mt-8 space-y-10">
        {catalogEntries.map((entry) => {
          const product = productBySlug.get(entry.slug);
          const images = product ? resolveImages(product) : [];
          const credits = product ? creditsFor(product) : [];
          return (
            <section key={entry.slug} className="rounded-2xl border border-[var(--brand-line)] bg-white p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-lg font-bold text-[var(--brand-ink)]">{entry.name}</h2>
                <span className="text-xs uppercase tracking-wide text-[var(--brand-muted)]">{entry.category}</span>
              </div>
              <p className="mt-1 text-xs text-[var(--brand-muted)]">
                Queries: {entry.imageQueries.join(' · ')}
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[0, 1, 2, 3].map((index) => {
                  const image = images[index];
                  const credit = credits[index];
                  if (!image) {
                    return (
                      <div
                        key={index}
                        className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-[var(--brand-line)] bg-[var(--brand-cream)] px-3 text-center text-[11px] text-[var(--brand-muted)]"
                      >
                        Missing photo {index + 1}
                      </div>
                    );
                  }
                  return (
                    <figure key={image.src} className="m-0">
                      <img
                        src={image.src}
                        alt={image.alt}
                        loading="lazy"
                        className="aspect-square w-full rounded-lg border border-[var(--brand-line)] object-cover"
                      />
                      <figcaption className="mt-1 text-[10px] leading-4 text-[var(--brand-muted)]">
                        {index + 1}. {image.alt}
                        {credit && (
                          <>
                            {' · '}
                            <a href={credit.photoUrl} target="_blank" rel="noopener noreferrer" className="underline">
                              {credit.photographer}
                            </a>
                          </>
                        )}
                      </figcaption>
                    </figure>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
