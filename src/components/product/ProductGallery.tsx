import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ZoomIn } from 'lucide-react';
import type { ResolvedImage } from '../../types';
import type { ImageCredit } from '../../data/imageMap';
import { largeSizes } from '../../data/imageMap';
import { Modal } from '../ui/Modal';
import { ImageWithFallback } from '../ui/ImageWithFallback';
import { classNames } from '../../lib/format';

interface ProductGalleryProps {
  images: ResolvedImage[];
  title: string;
  discount: number;
  credit?: ImageCredit;
  credits?: ImageCredit[];
}

function Attribution({ credit }: { credit: ImageCredit }) {
  return (
    <p className="mt-2 text-center text-[11px] text-[var(--brand-muted)]">
      Photo by{' '}
      <a href={credit.photographerUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--brand-ink)]">
        {credit.photographer}
      </a>{' '}
      on{' '}
      <a href={credit.photoUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--brand-ink)]">
        {credit.photoUrl.includes('pixabay') ? 'Pixabay' : credit.photoUrl.includes('unsplash') ? 'Unsplash' : 'Pexels'}
      </a>
      {credit.licenseUrl && (
        <>
          {' · '}
          <a href={credit.licenseUrl} target="_blank" rel="noopener noreferrer" className="underline hover:text-[var(--brand-ink)]">
            {credit.license}
          </a>
        </>
      )}
    </p>
  );
}

export function ProductGallery({ images, title, discount, credit, credits }: ProductGalleryProps) {
  const [active, setActive] = useState(0);
  const [zoomed, setZoomed] = useState(false);
  const [lightbox, setLightbox] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const frameRef = useRef<HTMLDivElement>(null);

  const current = images[active] ?? images[0];
  const activeCredit = credits?.[active] ?? credits?.[0] ?? credit;

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft') setActive((value) => (value - 1 + images.length) % images.length);
      if (event.key === 'ArrowRight') setActive((value) => (value + 1) % images.length);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lightbox, images.length]);

  if (images.length === 0) {
    return (
      <div className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-[var(--brand-line)] bg-[var(--brand-cream)] px-6 text-center text-sm text-[var(--brand-muted)]">
        Product photos are being prepared for {title}.
      </div>
    );
  }

  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row">
      <div className="flex gap-2 sm:flex-col" role="tablist" aria-label="Product images">
        {images.map((image, index) => (
          <button
            key={`${image.src}-${index}`}
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
            <ImageWithFallback src={image.src} srcSet={image.srcSet} sizes="72px" alt="" className="h-14 w-14 object-cover sm:h-16 sm:w-16" />
          </button>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        <div
          ref={frameRef}
          role="button"
          tabIndex={0}
          aria-label={`Open full-size image of ${title}. ${discount > 0 ? `-${discount}% off ` : ''}Click or hover to zoom`}
          className="relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border border-[var(--brand-line)] bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
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
          onClick={() => setLightbox(true)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              setLightbox(true);
            }
          }}
        >
          <ImageWithFallback
            src={current.src}
            srcSet={current.srcSet}
            sizes={largeSizes}
            width={current.width}
            height={current.height}
            alt={current.alt}
            priority
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
            <ZoomIn className="h-3 w-3" aria-hidden="true" /> Click or hover to zoom
          </span>
        </div>
        <p className="mt-2 text-center text-[11px] text-[var(--brand-muted)]">
          Image {active + 1} of {images.length} · {current.illustrative ? 'Illustrative artwork' : current.source === 'generated' ? 'Bundled artwork' : 'Product photo'}
        </p>
        {activeCredit && <Attribution credit={activeCredit} />}
      </div>

      <Modal open={lightbox} onClose={() => setLightbox(false)} title={`${title} — image viewer`} size="lg">
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setActive((value) => (value - 1 + images.length) % images.length)}
            className="rounded-full border border-[var(--brand-line)] p-2 hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand-orange)]"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>
          <ImageWithFallback
            key={current.src}
            src={current.src}
            srcSet={current.srcSet}
            sizes="(max-width: 768px) 90vw, 800px"
            width={current.width}
            height={current.height}
            alt={current.alt}
            priority
            className="max-h-[70vh] w-auto max-w-full rounded-lg object-contain"
          />
          <button
            type="button"
            onClick={() => setActive((value) => (value + 1) % images.length)}
            className="rounded-full border border-[var(--brand-line)] p-2 hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--brand-orange)]"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mt-3 text-center text-xs text-[var(--brand-muted)]">Use ← and → to browse, Escape to close.</p>
        {activeCredit && <Attribution credit={activeCredit} />}
      </Modal>
    </div>
  );
}
