import { useEffect, useMemo, useState } from 'react';
import { catalogEntries } from '../data/catalog';
import { getCategory } from '../data/categories';
import { creditsFor, resolveImages } from '../data/imageMap';
import { products } from '../data/products';

const productBySlug = new Map(products.map((product) => [product.slug, product]));
const categories = [...new Set(catalogEntries.map((entry) => entry.category))];

interface RejectResponse {
  photoIds?: string[];
  error?: string;
}

export default function DevImageReviewPage() {
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [rejectedIds, setRejectedIds] = useState<string[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetch('/dev-api/image-rejects')
      .then((response) => response.json() as Promise<RejectResponse>)
      .then((data) => setRejectedIds(data.photoIds ?? []))
      .catch(() => setMessage('Reject endpoint unavailable; run `npm run dev` to enable it.'));
  }, []);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    return catalogEntries.filter((entry) => {
      if (category !== 'all' && entry.category !== category) return false;
      if (!term) return true;
      return [entry.name, entry.brand, entry.slug, ...entry.imageQueries]
        .join(' ')
        .toLowerCase()
        .includes(term);
    });
  }, [category, search]);

  const reject = async (photoId: string) => {
    setBusyId(photoId);
    setMessage('');
    try {
      const response = await fetch('/dev-api/image-rejects', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ photoId }),
      });
      const data = (await response.json()) as RejectResponse;
      if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
      setRejectedIds(data.photoIds ?? []);
      setMessage(`Rejected photo ${photoId}. Run \`npm run images:repick\` when the API key is available.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    } finally {
      setBusyId(null);
    }
  };

  const exportRejected = async () => {
    setMessage('');
    try {
      const response = await fetch('/dev-api/image-rejects');
      const data = (await response.json()) as RejectResponse;
      if (!response.ok) throw new Error(data.error ?? `HTTP ${response.status}`);
      const blob = new Blob([JSON.stringify({ photoIds: data.photoIds ?? [] }, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'image-rejects.json';
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 0);
      setMessage(`Exported ${data.photoIds?.length ?? 0} rejected id(s).`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : String(error));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[var(--brand-ink)]">Image review</h1>
          <p className="mt-2 max-w-3xl text-sm text-[var(--brand-muted)]">
            Development-only gallery audit. Filter or search, then reject any mismatched slot. Rejected photo ids are
            stored in <code>data/image-rejects.json</code> by a development-only endpoint; production builds have no
            such endpoint.
          </p>
        </div>
        <button
          type="button"
          onClick={exportRejected}
          className="rounded-lg border border-[var(--brand-line)] px-3 py-2 text-sm font-semibold text-[var(--brand-ink)] hover:bg-[var(--brand-cream)]"
        >
          Export rejected ids ({rejectedIds.length})
        </button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 rounded-xl border border-[var(--brand-line)] bg-white p-4">
        <label className="flex flex-col gap-1 text-xs font-semibold text-[var(--brand-muted)]">
          Category
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="rounded-lg border border-[var(--brand-line)] px-3 py-2 text-sm text-[var(--brand-ink)]"
          >
            <option value="all">All categories</option>
            {categories.map((slug) => (
              <option key={slug} value={slug}>
                {getCategory(slug)?.name ?? slug}
              </option>
            ))}
          </select>
        </label>
        <label className="flex min-w-64 flex-1 flex-col gap-1 text-xs font-semibold text-[var(--brand-muted)]">
          Search product, brand, slug or query
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="e.g. webcam, Rift, ages 8"
            className="rounded-lg border border-[var(--brand-line)] px-3 py-2 text-sm text-[var(--brand-ink)]"
          />
        </label>
        <p className="self-end text-sm text-[var(--brand-muted)]">
          Showing <strong>{visible.length}</strong> of {catalogEntries.length} products · {visible.length * 4} slots
        </p>
      </div>

      {message && (
        <p role="status" className="mt-3 rounded-lg bg-[var(--brand-cream)] px-3 py-2 text-sm text-[var(--brand-ink)]">
          {message}
        </p>
      )}

      <div className="mt-8 space-y-10">
        {visible.map((entry) => {
          const product = productBySlug.get(entry.slug);
          const images = product ? resolveImages(product) : [];
          const credits = product ? creditsFor(product) : [];
          return (
            <section key={entry.slug} className="rounded-2xl border border-[var(--brand-line)] bg-white p-5">
              <div className="flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-lg font-bold text-[var(--brand-ink)]">{entry.name}</h2>
                <span className="text-xs uppercase tracking-wide text-[var(--brand-muted)]">
                  {getCategory(entry.category)?.name ?? entry.category} · {entry.brand}
                </span>
              </div>
              <p className="mt-1 text-xs text-[var(--brand-muted)]">Queries: {entry.imageQueries.join(' · ')}</p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[0, 1, 2, 3].map((index) => {
                  const image = images[index];
                  const credit = credits[index];
                  const photoId = image?.creditId ?? entry.images[index]?.photoId;
                  const rejected = Boolean(photoId && rejectedIds.includes(photoId));
                  if (!image) {
                    return (
                      <div
                        key={`${entry.slug}-${index}`}
                        className="flex aspect-square items-center justify-center rounded-lg border border-dashed border-[var(--brand-line)] bg-[var(--brand-cream)] px-3 text-center text-[11px] text-[var(--brand-muted)]"
                      >
                        Missing photo {index + 1}
                      </div>
                    );
                  }
                  return (
                    <figure key={`${entry.slug}-${photoId ?? index}`} className="m-0">
                      <img
                        src={image.src}
                        alt={image.alt}
                        loading="lazy"
                        className={`aspect-square w-full rounded-lg border object-cover ${
                          rejected ? 'border-red-500 opacity-40' : 'border-[var(--brand-line)]'
                        }`}
                      />
                      <figcaption className="mt-1 text-[10px] leading-4 text-[var(--brand-muted)]">
                        <span className="font-semibold text-[var(--brand-ink)]">Slot {index + 1}</span> · ID {photoId ?? 'n/a'}
                        <br />
                        {image.alt}
                        {credit && (
                          <>
                            {' · '}
                            <a href={credit.photoUrl} target="_blank" rel="noopener noreferrer" className="underline">
                              {credit.photographer}
                            </a>
                          </>
                        )}
                      </figcaption>
                      <button
                        type="button"
                        disabled={!photoId || rejected || busyId === photoId}
                        onClick={() => photoId && reject(photoId)}
                        className="mt-2 w-full rounded border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {rejected ? 'Rejected' : busyId === photoId ? 'Saving…' : `Reject slot ${index + 1}`}
                      </button>
                    </figure>
                  );
                })}
              </div>
            </section>
          );
        })}
        {visible.length === 0 && (
          <p className="rounded-xl border border-dashed border-[var(--brand-line)] p-8 text-center text-sm text-[var(--brand-muted)]">
            No products match that filter.
          </p>
        )}
      </div>
    </div>
  );
}
