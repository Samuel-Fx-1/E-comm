import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { GitCompareArrows, ShoppingCart, Trash2, X } from 'lucide-react';
import { getProductById } from '../data/products';
import { getCategory } from '../data/categories';
import { imagesFor } from '../data/imageMap';
import { deliveryDateRange, classNames } from '../lib/format';
import { useStore } from '../context/StoreContext';
import { useSite } from '../context/SiteContext';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { Price } from '../components/ui/Price';
import { Rating } from '../components/ui/Rating';
import { EmptyState } from '../components/ui/EmptyState';
import { Seo } from '../components/ui/Seo';

export default function ComparePage() {
  const { compare, toggleCompare, clearCompare, addToCart } = useStore();
  const { countryCode, language, money } = useSite();

  const products = compare
    .map((id) => getProductById(id))
    .filter((product): product is NonNullable<ReturnType<typeof getProductById>> => Boolean(product));

  if (products.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <Seo title="Compare products" path="/compare" noIndex />
        <EmptyState
          icon={<GitCompareArrows className="h-7 w-7" aria-hidden="true" />}
          title="No products to compare yet"
          description="Add up to three products from any listing or product page, then compare specs side by side."
          action={
            <Link to="/search" className="rounded-lg bg-[var(--brand-orange)] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[var(--brand-orange-dark)]">
              Find products
            </Link>
          }
        />
      </div>
    );
  }

  const specKeys = [...new Set(products.flatMap((product) => Object.keys(product.specs)))];
  const rows: Array<{ label: string; render: (product: NonNullable<ReturnType<typeof getProductById>>) => ReactNode }> = [
    { label: 'Price', render: (product) => <Price price={product.price} listPrice={product.listPrice} size="sm" /> },
    { label: 'Rating', render: (product) => <Rating rating={product.rating} count={product.reviewCount} showNumber /> },
    { label: 'Brand', render: (product) => <span className="text-sm text-[var(--brand-ink)]">{product.brand}</span> },
    { label: 'Department', render: (product) => <span className="text-sm text-[var(--brand-ink)]">{getCategory(product.category)?.name}</span> },
    { label: 'Seller', render: (product) => <span className="text-sm text-[var(--brand-ink)]">{product.seller}</span> },
    {
      label: 'Availability',
      render: (product) => (
        <span className={classNames('text-sm font-semibold', product.stock > 0 ? 'text-[var(--brand-success)]' : 'text-[var(--brand-danger)]')}>
          {product.stock > 0 ? `In stock (${product.stock})` : 'Out of stock'}
        </span>
      ),
    },
    {
      label: 'Delivery',
      render: (product) => (
        <span className="text-sm text-[var(--brand-ink)]">{deliveryDateRange(product.deliveryDays, countryCode, false, language)}</span>
      ),
    },
    ...specKeys.map((key) => ({
      label: key,
      render: (product: NonNullable<ReturnType<typeof getProductById>>) => (
        <span className="text-sm text-[var(--brand-ink)]">{product.specs[key] ?? '—'}</span>
      ),
    })),
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
      <Seo title="Compare products" path="/compare" noIndex />

      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--brand-orange)]">Side by side</p>
          <h1 className="font-serif text-3xl font-bold text-[var(--brand-ink)] sm:text-4xl">Compare products</h1>
          <p className="mt-1 text-sm text-[var(--brand-muted)]">
            {products.length} of 3 slots used · add another from any product card.
          </p>
        </div>
        <button
          type="button"
          onClick={clearCompare}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--brand-line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--brand-muted)] hover:border-[var(--brand-danger)] hover:text-[var(--brand-danger)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> Clear all
        </button>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-[var(--brand-line)] bg-white">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <caption className="sr-only">Product comparison</caption>
          <thead>
            <tr>
              <th scope="col" className="w-40 border-b border-[var(--brand-line)] bg-[var(--brand-cream)] p-3 text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">
                Product
              </th>
              {products.map((product) => (
                <th key={product.id} scope="col" className="border-b border-l border-[var(--brand-line)] p-3 align-top">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => toggleCompare(product.id)}
                      aria-label={`Remove ${product.title} from compare`}
                      className="absolute right-0 top-0 rounded-full bg-white p-1 text-[var(--brand-muted)] shadow-sm hover:text-[var(--brand-danger)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <Link to={`/product/${product.slug}`} className="block">
                      <ImageWithFallback src={imagesFor(product)[0]} alt={product.title} className="h-32 w-full rounded-lg object-cover" />
                      <span className="mt-2 block text-sm font-bold leading-snug text-[var(--brand-ink)] hover:text-[var(--brand-orange)]">
                        {product.title}
                      </span>
                    </Link>
                    <button
                      type="button"
                      onClick={() => addToCart(product.id)}
                      disabled={product.stock <= 0}
                      className="mt-2 inline-flex w-full items-center justify-center gap-1.5 rounded-full bg-[var(--brand-yellow)] px-3 py-1.5 text-xs font-bold text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] disabled:cursor-not-allowed disabled:bg-[var(--brand-line)] disabled:text-[var(--brand-muted)]"
                    >
                      <ShoppingCart className="h-3.5 w-3.5" aria-hidden="true" /> Add to cart
                    </button>
                    <p className="mt-1 text-center text-[10px] text-[var(--brand-muted)]">{money(product.price)}</p>
                  </div>
                </th>
              ))}
              {products.length < 3 && (
                <th scope="col" className="border-b border-l border-[var(--brand-line)] p-3 align-middle">
                  <Link
                    to="/search"
                    className="flex h-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-[var(--brand-line)] text-xs font-semibold text-[var(--brand-muted)] hover:border-[var(--brand-navy)] hover:text-[var(--brand-navy)]"
                  >
                    <GitCompareArrows className="h-6 w-6" aria-hidden="true" />
                    Add another product
                  </Link>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.label}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-[var(--brand-cream)]/40'}>
                <th scope="row" className="border-b border-[var(--brand-line)] p-3 text-xs font-bold text-[var(--brand-muted)]">
                  {row.label}
                </th>
                {products.map((product) => (
                  <td key={product.id} className="border-b border-l border-[var(--brand-line)] p-3 align-top">
                    {row.render(product)}
                  </td>
                ))}
                {products.length < 3 && <td className="border-b border-l border-[var(--brand-line)] p-3" />}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-[var(--brand-muted)]">
        Tip: compare up to 3 items. Specs that only apply to some products show a dash.
      </p>
    </div>
  );
}
