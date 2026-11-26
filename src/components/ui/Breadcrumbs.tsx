import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export interface Crumb {
  label: string;
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1 text-xs text-[var(--brand-muted)]">
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="flex items-center gap-1">
            {item.to ? (
              <Link
                to={item.to}
                className="hover:text-[var(--brand-orange)] hover:underline underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
              >
                {item.label}
              </Link>
            ) : (
              <span aria-current="page" className="font-semibold text-[var(--brand-ink)]">
                {item.label}
              </span>
            )}
            {index < items.length - 1 && <ChevronRight className="h-3 w-3" aria-hidden="true" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}
