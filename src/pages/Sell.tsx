import { Link } from 'react-router-dom';
import {
  ArrowRight, BarChart3, Boxes, Check, CircleDollarSign, ClipboardList, Store, Truck, Users,
} from 'lucide-react';
import { site } from '../config/site';
import { useSite } from '../context/SiteContext';
import { Seo } from '../components/ui/Seo';

const steps = [
  { icon: ClipboardList, title: 'Create your seller profile', body: 'Business details, payout account and tax information.' },
  { icon: Boxes, title: 'List your catalogue', body: 'Photos, titles, variations, stock levels and shipping templates.' },
  { icon: Truck, title: 'Set delivery options', body: 'Coverage by country, handling time and carrier rates.' },
  { icon: CircleDollarSign, title: 'Get paid', body: 'Order-level payouts after returns and referrals are settled.' },
];

const benefits = [
  { icon: Users, title: 'Reach new shoppers', body: 'Browse across 14 demo markets with local currency display.' },
  { icon: BarChart3, title: 'Understand demand', body: 'Search terms, conversion and repeat purchase reporting.' },
  { icon: Store, title: 'Keep your brand', body: 'Your storefront, your product stories and your customer service.' },
];

export default function SellPage() {
  const { t } = useSite();

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Seo
        title="Sell on Soko"
        description="Learn how selling works on a marketplace like Soko. This demo has no seller backend; onboarding is informational."
        path="/sell"
      />

      <div className="overflow-hidden rounded-2xl bg-[var(--brand-navy)] px-6 py-10 text-white sm:px-10">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-yellow)]">
          <Store className="h-4 w-4" aria-hidden="true" /> {t('sell')} on {site.name}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">Grow your business with us.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
          Reach shoppers across the region with a storefront built for mobile. This demo does not include a seller
          backend, so the form below is illustrative and stores nothing.
        </p>
        <Link
          to="/search"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[var(--brand-yellow)] px-5 py-2.5 text-sm font-bold text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Explore the catalogue <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>

      <section aria-labelledby="sell-steps-heading" className="mt-8">
        <h2 id="sell-steps-heading" className="font-serif text-2xl font-bold text-[var(--brand-ink)]">
          How onboarding would work
        </h2>
        <ol className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="relative rounded-2xl border border-[var(--brand-line)] bg-white p-4">
              <span className="absolute right-4 top-4 font-serif text-3xl font-bold text-[var(--brand-line)]">
                {index + 1}
              </span>
              <step.icon className="h-5 w-5 text-[var(--brand-orange)]" aria-hidden="true" />
              <h3 className="mt-3 pr-8 text-sm font-bold text-[var(--brand-ink)]">{step.title}</h3>
              <p className="mt-1 text-xs leading-5 text-[var(--brand-muted)]">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="sell-benefits-heading" className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div>
          <h2 id="sell-benefits-heading" className="font-serif text-2xl font-bold text-[var(--brand-ink)]">
            Why sell here
          </h2>
          <div className="mt-3 space-y-3">
            {benefits.map((benefit) => (
              <div key={benefit.title} className="flex gap-3 rounded-xl border border-[var(--brand-line)] bg-white p-4">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--brand-orange)]/10 text-[var(--brand-orange)]">
                  <benefit.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-[var(--brand-ink)]">{benefit.title}</h3>
                  <p className="mt-0.5 text-xs leading-5 text-[var(--brand-muted)]">{benefit.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-5">
          <h2 className="text-lg font-bold text-[var(--brand-ink)]">Express interest</h2>
          <p className="mt-1 text-xs text-[var(--brand-muted)]">
            Demo only — this form does not submit or store anything.
          </p>
          <form
            className="mt-4 space-y-3"
            onSubmit={(event) => {
              event.preventDefault();
              event.currentTarget.reset();
            }}
          >
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[var(--brand-muted)]">Business name</span>
              <input
                required
                placeholder="Your shop name"
                className="w-full rounded-lg border border-[var(--brand-line)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[var(--brand-muted)]">Email</span>
              <input
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-[var(--brand-line)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-[var(--brand-muted)]">What do you sell?</span>
              <textarea
                rows={3}
                placeholder="A short description of your products"
                className="w-full resize-y rounded-lg border border-[var(--brand-line)] px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-orange)]"
              />
            </label>
            <button
              type="submit"
              disabled
              className="w-full cursor-not-allowed rounded-lg bg-[var(--brand-line)] px-4 py-2.5 text-sm font-semibold text-[var(--brand-muted)]"
            >
              Seller onboarding needs a backend
            </button>
          </form>
          <ul className="mt-4 space-y-1.5 text-xs text-[var(--brand-muted)]">
            {['No account required to browse', 'No personal data collected', 'No payment or payout setup'].map((note) => (
              <li key={note} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-[var(--brand-success)]" aria-hidden="true" /> {note}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
