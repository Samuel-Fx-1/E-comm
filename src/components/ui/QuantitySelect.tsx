import { ChevronDown } from 'lucide-react';

interface QuantitySelectProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  label?: string;
  compact?: boolean;
}

export function QuantitySelect({ value, onChange, max = 10, label = 'Quantity', compact = false }: QuantitySelectProps) {
  const limit = Math.max(1, Math.min(max, 30));
  return (
    <label className={compact ? 'relative inline-flex items-center' : 'flex flex-col gap-1'}>
      <span className={compact ? 'sr-only' : 'text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]'}>
        {label}
      </span>
      <span className="relative inline-flex items-center">
        <select
          value={value}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label={label}
          className="appearance-none rounded-lg border border-[var(--brand-line)] bg-white py-2 pl-3 pr-8 text-sm font-medium text-[var(--brand-ink)] shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
        >
          {Array.from({ length: limit }).map((_, index) => (
            <option key={index + 1} value={index + 1}>
              {index + 1}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2 h-4 w-4 text-[var(--brand-muted)]" aria-hidden="true" />
      </span>
    </label>
  );
}
