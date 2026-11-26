import { Check, Circle, Package, Truck } from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { addDays, formatDate } from '../../lib/format';
import { classNames } from '../../lib/format';

const STEPS: Array<{ status: OrderStatus; label: string; description: string }> = [
  { status: 'Ordered', label: 'Order placed', description: 'We received your order.' },
  { status: 'Shipped', label: 'Shipped', description: 'Your parcel left the fulfilment centre.' },
  { status: 'Out for delivery', label: 'Out for delivery', description: 'A courier is on the way.' },
  { status: 'Delivered', label: 'Delivered', description: 'Parcel handed over at the address.' },
];

export function OrderTimeline({ order, compact = false }: { order: Order; compact?: boolean }) {
  const activeIndex = Math.max(0, STEPS.findIndex((step) => step.status === order.status));
  const dates = [
    order.createdAt,
    addDays(order.createdAt, 1),
    addDays(order.createdAt, 2),
    order.estimatedDelivery,
  ];

  return (
    <ol className={classNames('space-y-0', compact && 'flex gap-1 space-y-0')} aria-label={`Order status: ${order.status}`}>
      {STEPS.map((step, index) => {
        const done = index < activeIndex;
        const current = index === activeIndex;
        const reached = done || current;
        return (
          <li key={step.status} className={classNames('relative flex gap-3', compact ? 'flex-1 flex-col items-center gap-1 text-center' : 'pb-5 last:pb-0')}>
            {!compact && index < STEPS.length - 1 && (
              <span
                aria-hidden="true"
                className={classNames(
                  'absolute left-[13px] top-7 h-[calc(100%-1.25rem)] w-0.5',
                  done ? 'bg-[var(--brand-success)]' : 'bg-[var(--brand-line)]'
                )}
              />
            )}
            <span
              className={classNames(
                'relative z-10 grid h-7 w-7 shrink-0 place-items-center rounded-full border-2',
                done
                  ? 'border-[var(--brand-success)] bg-[var(--brand-success)] text-white'
                  : current
                    ? 'border-[var(--brand-orange)] bg-white text-[var(--brand-orange)]'
                    : 'border-[var(--brand-line)] bg-white text-[var(--brand-line)]'
              )}
            >
              {done ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : current ? (
                index === 1 ? (
                  <Truck className="h-3.5 w-3.5" aria-hidden="true" />
                ) : index === 3 ? (
                  <Package className="h-3.5 w-3.5" aria-hidden="true" />
                ) : (
                  <Circle className="h-2.5 w-2.5 fill-current" aria-hidden="true" />
                )
              ) : (
                <Circle className="h-2.5 w-2.5" aria-hidden="true" />
              )}
            </span>
            <div className={compact ? '' : 'min-w-0'}>
              <p
                className={classNames(
                  'text-xs font-bold',
                  reached ? 'text-[var(--brand-ink)]' : 'text-[var(--brand-muted)]',
                  compact && 'leading-4'
                )}
              >
                {step.label}
              </p>
              {!compact && (
                <>
                  <p className="text-xs text-[var(--brand-muted)]">{step.description}</p>
                  <p className="mt-0.5 text-[11px] text-[var(--brand-muted)]">
                    {reached ? formatDate(dates[index]) : `Expected ${formatDate(dates[index])}`}
                  </p>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
