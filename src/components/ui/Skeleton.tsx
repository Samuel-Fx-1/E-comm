import { classNames } from '../../lib/format';

export function Skeleton({ className }: { className?: string }) {
  return <div className={classNames('animate-pulse rounded-md bg-[var(--brand-line)]/70', className)} aria-hidden="true" />;
}

export function ProductCardSkeleton({ layout = 'grid' }: { layout?: 'grid' | 'list' }) {
  if (layout === 'list') {
    return (
      <div className="flex gap-4 rounded-xl border border-[var(--brand-line)] bg-white p-4">
        <Skeleton className="h-40 w-40 shrink-0" />
        <div className="flex-1 space-y-3 py-2">
          <Skeleton className="h-5 w-2/3" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-6 w-1/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-9 w-40" />
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-3 rounded-xl border border-[var(--brand-line)] bg-white p-4">
      <Skeleton className="aspect-square w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-9 w-full" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8, layout = 'grid' }: { count?: number; layout?: 'grid' | 'list' }) {
  return (
    <div
      className={classNames(
        layout === 'grid' ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4' : 'space-y-4'
      )}
      aria-busy="true"
      aria-label="Loading products"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} layout={layout} />
      ))}
    </div>
  );
}

export function RowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4" aria-busy="true" aria-label="Loading products">
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  );
}
