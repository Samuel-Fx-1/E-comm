import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { classNames } from '../../lib/format';

type Variant = 'primary' | 'accent' | 'dark' | 'outline' | 'ghost' | 'link';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
  children: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    'bg-[var(--brand-orange)] text-white hover:bg-[var(--brand-orange-dark)] border border-transparent',
  accent:
    'bg-[var(--brand-yellow)] text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] border border-transparent',
  dark:
    'bg-[var(--brand-navy)] text-white hover:bg-[var(--brand-navy-soft)] border border-transparent',
  outline:
    'bg-white text-[var(--brand-ink)] border border-[var(--brand-line)] hover:border-[var(--brand-navy)] hover:bg-[var(--brand-cream)]',
  ghost:
    'bg-transparent text-[var(--brand-ink)] border border-transparent hover:bg-black/5',
  link:
    'bg-transparent text-[var(--brand-navy)] border border-transparent underline-offset-2 hover:underline p-0',
};

const sizes: Record<Size, string> = {
  sm: 'text-xs px-3 py-1.5 rounded-md gap-1.5',
  md: 'text-sm px-4 py-2.5 rounded-lg gap-2',
  lg: 'text-base px-6 py-3 rounded-lg gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className,
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={classNames(
        'inline-flex items-center justify-center font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)] disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
