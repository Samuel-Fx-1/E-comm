import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { promos } from '../../data/promos';
import { CategoryIcon } from '../ui/CategoryIcon';

export function PromoCarousel() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);

  const scrollByCard = (direction: -1 | 1) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector<HTMLElement>('[data-promo-card]');
    const amount = card ? card.offsetWidth + 16 : track.clientWidth / 2;
    track.scrollBy({ left: direction * amount, behavior: 'smooth' });
  };

  useEffect(() => {
    if (paused || hovered) return;
    const timer = window.setInterval(() => {
      const track = trackRef.current;
      if (!track) return;
      const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 8;
      if (atEnd) track.scrollTo({ left: 0, behavior: 'smooth' });
      else scrollByCard(1);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [paused, hovered]);

  return (
    <section aria-labelledby="promotions-heading" className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-orange)]">Featured this week</p>
          <h2 id="promotions-heading" className="font-serif text-2xl font-bold text-[var(--brand-ink)] sm:text-3xl">
            Finds worth a look
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setPaused((value) => !value)}
            className="rounded-full border border-[var(--brand-line)] bg-white p-2 text-[var(--brand-ink)] shadow-sm hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
            aria-label={paused ? 'Play promotions carousel' : 'Pause promotions carousel'}
            aria-pressed={paused}
          >
            {paused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(-1)}
            className="rounded-full border border-[var(--brand-line)] bg-white p-2 text-[var(--brand-ink)] shadow-sm hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
            aria-label="Previous promotions"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => scrollByCard(1)}
            className="rounded-full border border-[var(--brand-line)] bg-white p-2 text-[var(--brand-ink)] shadow-sm hover:border-[var(--brand-navy)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
            aria-label="Next promotions"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div
        ref={trackRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onFocus={() => setHovered(true)}
        onBlur={() => setHovered(false)}
        aria-roledescription="carousel"
      >
        {promos.map((promo) => (
          <article
            key={promo.id}
            data-promo-card
            className={`relative flex aspect-[4/5] w-[82%] shrink-0 snap-start flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-br ${promo.gradient} p-6 text-white shadow-lg sm:w-[calc(50%-8px)] lg:w-[calc(25%-12px)]`}
          >
            <CategoryIcon
              name={promo.icon}
              className="pointer-events-none absolute -right-8 -top-6 h-44 w-44 text-white/10"
            />
            <div className="relative">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--brand-yellow)]">{promo.eyebrow}</p>
              <h3 className="mt-3 font-serif text-3xl font-bold leading-tight">{promo.title}</h3>
              <p className="mt-2 max-w-[85%] text-sm leading-6 text-white/80">{promo.subtitle}</p>
            </div>
            <Link
              to={promo.href}
              className="relative inline-flex w-fit items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[var(--brand-navy)] transition-transform hover:translate-x-1 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)]"
            >
              {promo.cta}
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
