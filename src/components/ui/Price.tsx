import { useSite } from '../../context/SiteContext';
import { discountPercent } from '../../lib/format';

interface PriceProps {
  price: number;
  listPrice?: number;
  size?: 'sm' | 'md' | 'lg';
  showDiscount?: boolean;
}

export function Price({ price, listPrice, size = 'md', showDiscount = true }: PriceProps) {
  const { money } = useSite();
  const discount = listPrice ? discountPercent(price, listPrice) : 0;
  const priceClass =
    size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-base' : 'text-xl';

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={`${priceClass} font-bold tracking-tight text-[var(--brand-ink)]`}>{money(price)}</span>
      {listPrice && listPrice > price && (
        <span className="text-sm text-[var(--brand-muted)] line-through">{money(listPrice)}</span>
      )}
      {showDiscount && discount > 0 && (
        <span className="rounded bg-[var(--brand-danger)]/10 px-1.5 py-0.5 text-xs font-bold text-[var(--brand-danger)]">
          -{discount}%
        </span>
      )}
    </div>
  );
}
