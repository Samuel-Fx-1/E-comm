import { useEffect, useState } from 'react';
import type { CSSProperties, ImgHTMLAttributes } from 'react';
import { imageInfo } from '../../data/imageMap';
import { classNames } from '../../lib/format';

interface ImageWithFallbackProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> {
  src: string;
  alt: string;
  fallback?: string;
  /** Above-the-fold images load eagerly with high fetch priority. */
  priority?: boolean;
}

const DEFAULT_FALLBACK = '/images/placeholder.svg';

export function ImageWithFallback({
  src,
  alt,
  fallback,
  className,
  loading = 'lazy',
  priority = false,
  style,
  width,
  height,
  srcSet,
  sizes,
  ...props
}: ImageWithFallbackProps) {
  const info = imageInfo(src);
  const localFallback = fallback ?? info?.fallbackSrc ?? DEFAULT_FALLBACK;
  const [current, setCurrent] = useState(src);

  useEffect(() => {
    setCurrent(src);
  }, [src]);

  const placeholder: CSSProperties = info?.blurSrc
    ? { backgroundImage: `url("${info.blurSrc}")`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : info?.color
      ? { backgroundColor: info.color }
      : {};

  return (
    <img
      src={current}
      alt={alt}
      loading={priority ? 'eager' : loading}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      width={width ?? info?.width}
      height={height ?? info?.height}
      srcSet={srcSet ?? info?.srcSet}
      sizes={sizes ?? info?.sizes}
      style={{ ...placeholder, ...style }}
      onError={() => {
        if (current !== localFallback) setCurrent(localFallback);
      }}
      className={classNames('bg-[var(--brand-cream)]', className)}
      {...props}
    />
  );
}
