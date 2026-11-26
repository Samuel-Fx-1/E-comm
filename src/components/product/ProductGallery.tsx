import { useRef, useState } from 'react';
import { ZoomIn } from 'lucide-react';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { classNames } from '../../lib/format';

interface ProductGalleryProps {
  images: string[];
  title: string;
  discount: number;
}

export function ProductGallery({ images, title, discount }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const frameRef = useRef<HTMLDivElement>(null);

  const current = images[active] ?? images[0];

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex gap-2 sm:flex-col" role="tablist" aria-label="Product images">
        {images.map((image, index) => (
          <button
            key={image}
            type="button"
            role="tab"
            aria-selected={active === index}
            aria-label={`View image ${index + 1} of ${images.length}`}
            onClick={() => setActive(index)}
            className={classNames(
              'overflow-hidden rounded-lg border-2 bg-white p-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]',
              active === index ? 'border-[var(--brand-orange)]' : 'border-[var(--brand-line)] hover:border-[var(--brand-navy)]'
            )}
          >
            <ImageWithFallback src={image} alt="" className="h-14 w-14 object-cover sm:h-16 sm:w-16" />
          </button>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div
          ref={frameRef}
          className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-[var(--brand-line)] bg-white"
          onMouseEnter={() => setZoomed(true)}
          onMouseLeave={() => {
            setZoomed(false);
            setOrigin({ x: 50, y: 50 });
          }}
          onMouseMove={(event) => {
            const rect = frameRef.current?.getBoundingClientRect();
            if (!rect) return;
            setOrigin({
              x: ((event.clientX - rect.left) / rect.width) * 100,
              y: ((event.clientY - rect.top) / rect.height) * 100,
            });
          }}
        >
          <ImageWithFallback
            src={current}
            alt={title}
            loading="eager"
            className="h-full w-full object-cover transition-transform duration-150 ease-out"
            style={{
              transform: zoomed ? 'scale(1.9)' : 'scale(1)',
              transformOrigin: `${origin.x}% ${origin.y}%`,
            }}
          />
          {discount > 0 && (
            <span className="absolute left-3 top-3 rounded bg-[var(--brand-danger)] px-2.5 py-1 text-xs font-bold text-white shadow">
              -{discount}% off
            </span>
          )}
          <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white">
            <ZoomIn className="h-3 w-3" aria-hidden="true" /> Hover to zoom
          </span>
        </div>
        <p className="mt-2 text-center text-[11px] text-[var(--brand-muted)]">
          Image {active + 1} of {images.length} · Demo artwork for this listing
        </p>
      </div>
    </div>
  );
}
