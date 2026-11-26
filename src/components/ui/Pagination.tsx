import { ChevronLeft, ChevronRight } from 'lucide-react';
import { classNames } from '../../lib/format';

interface PaginationProps {
  page: number;
  pageCount: number;
  onChange: (page: number) => void;
  label?: string;
}

function pageWindow(page: number, pageCount: number): number[] {
  const size = Math.min(5, pageCount);
  let start = Math.max(1, page - 2);
  if (start + size - 1 > pageCount) start = pageCount - size + 1;
  return Array.from({ length: size }, (_, index) => start + index);
}

export function Pagination({ page, pageCount, onChange, label = 'Pagination' }: PaginationProps) {
  if (pageCount <= 1) return null;

  return (
    <nav aria-label={label} className="flex flex-wrap items-center justify-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="inline-flex items-center gap-1 rounded-lg border border-[var(--brand-line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--brand-ink)] hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        <ChevronLeft className="h-3.5 w-3.5" aria-hidden="true" /> Previous
      </button>
      {pageWindow(page, pageCount).map((entry) => (
        <button
          key={entry}
          type="button"
          onClick={() => onChange(entry)}
          aria-current={entry === page ? 'page' : undefined}
          className={classNames(
            'min-w-9 rounded-lg border px-3 py-2 text-xs font-bold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]',
            entry === page
              ? 'border-[var(--brand-navy)] bg-[var(--brand-navy)] text-white'
              : 'border-[var(--brand-line)] bg-white text-[var(--brand-ink)] hover:border-[var(--brand-navy)]'
          )}
        >
          {entry}
        </button>
      ))}
      <button
        type="button"
        onClick={() => onChange(page + 1)}
        disabled={page >= pageCount}
        className="inline-flex items-center gap-1 rounded-lg border border-[var(--brand-line)] bg-white px-3 py-2 text-xs font-semibold text-[var(--brand-ink)] hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)] disabled:cursor-not-allowed disabled:opacity-40"
      >
        Next <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </nav>
  );
}
