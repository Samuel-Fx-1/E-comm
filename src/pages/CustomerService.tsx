import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, CreditCard, Headphones, Mail, MapPin, Package, Phone, RotateCcw, Search, Truck,
} from 'lucide-react';
import { site } from '../config/site';
import { useSite } from '../context/SiteContext';
import { classNames } from '../lib/format';
import { Seo } from '../components/ui/Seo';

const faqs = [
  {
    question: 'Is this a real shop?',
    answer:
      'No. Soko runs locally in this browser. Products, sellers, reviews and prices are illustrative. No payment is processed and no email is sent.',
  },
  {
    question: 'Where is my order?',
    answer:
      'Open Your Orders to see the delivery timeline. Orders you place in this browser appear immediately with a simulated "Ordered" status and an estimated delivery date.',
  },
  {
    question: 'How do returns work?',
    answer:
      'In a hosted marketplace you would open the order and choose "Return items" within the return window. Orders here are stored locally, so returns are informational only.',
  },
  {
    question: 'Can I change my delivery country?',
    answer:
      'Yes. Select the delivery-to area in the header, choose one of the available countries and a city. Prices convert using fixed reference exchange rates.',
  },
  {
    question: 'What happens to my data?',
    answer:
      'Your account, cart, wishlist, orders and reviews are stored in your browser localStorage. Clearing site data removes them. Nothing is uploaded to a server.',
  },
  {
    question: 'How do I become a seller?',
    answer:
      'This project has no seller backend, so the Sell page explains what a real onboarding flow would require. You can still browse products from many fictional sellers.',
  },
];

const topics = [
  { icon: Package, title: 'Orders & tracking', body: 'Find an order, check its status and buy again.', to: '/orders' },
  { icon: RotateCcw, title: 'Returns & refunds', body: 'Return windows, condition rules and refund timing.', to: '/orders' },
  { icon: CreditCard, title: 'Payments', body: 'Supported payment methods and billing questions.', to: '/checkout' },
  { icon: Truck, title: 'Shipping & delivery', body: 'Delivery estimates by country and speed.', to: '/search' },
];

export default function CustomerServicePage() {
  const { t } = useSite();
  const [query, setQuery] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const matches = faqs.filter((faq) =>
    `${faq.question} ${faq.answer}`.toLowerCase().includes(query.trim().toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
      <Seo
        title="Customer service"
        description="Help, delivery information, returns guidance and answers to common questions about Soko."
        path="/customer-service"
      />

      <div className="overflow-hidden rounded-2xl bg-[var(--brand-navy)] px-6 py-10 text-white sm:px-10">
        <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-yellow)]">
          <Headphones className="h-4 w-4" aria-hidden="true" /> {t('customerService')}
        </p>
        <h1 className="mt-2 font-serif text-4xl font-bold sm:text-5xl">How can we help?</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">
          Search our help topics, or jump straight to your orders. Everything here relates to a local storefront with no real
          transactions.
        </p>
        <div className="mt-5 flex max-w-2xl items-center gap-2 rounded-xl bg-white p-1.5 shadow-lg">
          <Search className="ml-2 h-4 w-4 shrink-0 text-[var(--brand-muted)]" aria-hidden="true" />
          <label htmlFor="help-search" className="sr-only">Search help articles</label>
          <input
            id="help-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search help articles…"
            className="min-w-0 flex-1 bg-transparent py-1.5 text-sm text-[var(--brand-ink)] outline-none placeholder:text-[var(--brand-muted)]"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-[var(--brand-muted)] hover:text-[var(--brand-ink)]"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <section aria-labelledby="topics-heading" className="mt-8">
        <h2 id="topics-heading" className="font-serif text-2xl font-bold text-[var(--brand-ink)]">
          Popular topics
        </h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topics.map((topic) => (
            <Link
              key={topic.title}
              to={topic.to}
              className="rounded-xl border border-[var(--brand-line)] bg-white p-4 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
            >
              <topic.icon className="h-5 w-5 text-[var(--brand-orange)]" aria-hidden="true" />
              <h3 className="mt-2 text-sm font-bold text-[var(--brand-ink)]">{topic.title}</h3>
              <p className="mt-1 text-xs leading-5 text-[var(--brand-muted)]">{topic.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="faq-heading" className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <h2 id="faq-heading" className="font-serif text-2xl font-bold text-[var(--brand-ink)]">
            Frequently asked questions
          </h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-[var(--brand-line)] bg-white">
            {matches.length === 0 ? (
              <p className="p-6 text-sm text-[var(--brand-muted)]">
                No article matches “{query}”. Try “order”, “delivery” or “data”.
              </p>
            ) : (
              <ul className="divide-y divide-[var(--brand-line)]">
                {matches.map((faq) => {
                  const index = faqs.indexOf(faq);
                  const open = openIndex === index;
                  return (
                    <li key={faq.question}>
                      <h3>
                        <button
                          type="button"
                          onClick={() => setOpenIndex(open ? null : index)}
                          aria-expanded={open}
                          aria-controls={`faq-panel-${index}`}
                          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold text-[var(--brand-ink)] hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--brand-orange)]"
                        >
                          {faq.question}
                          <ChevronDown
                            className={classNames('h-4 w-4 shrink-0 text-[var(--brand-muted)] transition-transform', open && 'rotate-180')}
                            aria-hidden="true"
                          />
                        </button>
                      </h3>
                      {open && (
                        <div id={`faq-panel-${index}`} className="px-4 pb-4 text-sm leading-6 text-[var(--brand-muted)]">
                          {faq.answer}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-4">
            <h2 className="text-sm font-bold text-[var(--brand-ink)]">Contact</h2>
            <ul className="mt-3 space-y-3 text-sm text-[var(--brand-muted)]">
              <li className="flex items-start gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-orange)]" aria-hidden="true" />
                <span>{site.supportEmail}</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-orange)]" aria-hidden="true" />
                <span>{site.supportPhone}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand-orange)]" aria-hidden="true" />
                <span>Kigali, Rwanda</span>
              </li>
            </ul>
            <p className="mt-3 rounded-lg bg-[var(--brand-cream)] p-2 text-[11px] leading-4 text-[var(--brand-muted)]">
              These contacts are illustrative. No messages are sent from this storefront.
            </p>
          </div>

          <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-4">
            <h2 className="text-sm font-bold text-[var(--brand-ink)]">Useful links</h2>
            <ul className="mt-2 space-y-1.5 text-sm">
              {[
                { label: 'Your orders', to: '/orders' },
                { label: 'Your account', to: '/account' },
                { label: 'Checkout help', to: '/checkout' },
                { label: 'Wishlist', to: '/wishlist' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="block rounded-lg px-2 py-1.5 text-[var(--brand-ink)] hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>
    </div>
  );
}
