import { useEffect, useState } from 'react';
import type { ImgHTMLAttributes } from 'react';
import { classNames } from '../../lib/format';

interface ImageWithFallbackProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string;
  alt: string;
  fallback?: string;
}

const DEFAULT_FALLBACK = '/images/placeholder.svg';

export function ImageWithFallback({
  src,
  alt,
  fallback = DEFAULT_FALLBACK,
  className,
  loading = 'lazy',
  ...props
}: ImageWithFallbackProps) {
  const [current, setCurrent] = useState(src);

  useEffect(() => {
    setCurrent(src);
  }, [src]);

  return (
    <img
      src={current}
      alt={alt}
      loading={loading}
      decoding="async"
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
      className={classNames('bg-[var(--brand-cream)]', className)}
      {...props}
    />
  );
}
