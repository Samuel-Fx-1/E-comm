import type { ReactNode } from 'react';
import { SearchX } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--brand-line)] bg-white px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--brand-cream)] text-[var(--brand-muted)]">
        {icon ?? <SearchX className="h-7 w-7" aria-hidden="true" />}
      </div>
      <h2 className="text-lg font-bold text-[var(--brand-ink)]">{title}</h2>
      {description && <p className="mt-2 max-w-md text-sm text-[var(--brand-muted)]">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
