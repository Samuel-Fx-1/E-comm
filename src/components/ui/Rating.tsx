import { Star } from 'lucide-react';
import { classNames } from '../../lib/format';

interface RatingProps {
  rating: number;
  count?: number;
  size?: 'sm' | 'md';
  showNumber?: boolean;
  className?: string;
}

export function Rating({ rating, count, size = 'sm', showNumber = false, className }: RatingProps) {
  const starSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-5 w-5';
  const rounded = Math.round(rating);
  return (
    <div className={classNames('flex flex-wrap items-center gap-1', className)}>
      <span className="flex items-center" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={classNames(
              starSize,
              star <= rounded
                ? 'fill-[var(--brand-orange)] text-[var(--brand-orange)]'
                : 'fill-transparent text-[var(--brand-line)]'
            )}
          />
        ))}
      </span>
      <span className="sr-only">{rating.toFixed(1)} out of 5 stars</span>
      {showNumber && <span className="text-xs font-semibold text-[var(--brand-ink)]">{rating.toFixed(1)}</span>}
      {typeof count === 'number' && (
        <span className="text-xs text-[var(--brand-muted)]">({count.toLocaleString()})</span>
      )}
    </div>
  );
}
