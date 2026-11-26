import type { Product, Question, Review } from '../types';

const NAMES = [
  'Aline M.', 'Eric N.', 'Grace U.', 'Samuel K.', 'Diane R.', 'Patrick H.',
  'Fatima A.', 'Joseph M.', 'Claudine T.', 'Brian O.', 'Nadia S.', 'Emmanuel B.',
];

const POSITIVE_TITLES = [
  'Exactly as described', 'Worth every franc', 'Better than I expected', 'Solid everyday buy',
  'Great value', 'Would order again', 'Arrived early and well packed',
];

const MIXED_TITLES = ['Good, with one small issue', 'Does the job', 'Nice quality for the price'];

const POSITIVE_BODIES = [
  'Arrived on time and the packaging was neat. Quality feels well above the price and it has held up after a few weeks of daily use.',
  'I compared a few options before ordering and this was the right call. Works exactly as advertised and the finish is clean.',
  'Ordered for a family member and ended up buying a second one. Simple to use, no surprises, and delivery was quick.',
  'The photos are accurate. It feels sturdy, the details are thoughtful, and it has become part of my routine.',
  'Really happy with this purchase. Setup took minutes and everything worked the first time.',
];

const MIXED_BODIES = [
  'Overall I like it, though the instructions could be clearer. Once set up it does what I need and feels durable.',
  'Good value for the price. The finish is not perfect but for everyday use it is more than fine.',
  'Works well after a small adjustment. Delivery was fast and customer service answered my question the same day.',
];

function hash(text: string): number {
  let value = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return Math.abs(value);
}

function pick<T>(items: T[], seed: number): T {
  return items[seed % items.length];
}

export function seedReviews(product: Product): Review[] {
  const base = hash(product.slug);
  const count = 5 + (base % 3);
  const ratings = product.rating >= 4.5 ? [5, 5, 5, 4, 5, 4, 3] : [5, 4, 4, 5, 3, 4, 2];
  const reviews: Review[] = [];

  for (let i = 0; i < count; i += 1) {
    const seed = base + i * 97;
    const rating = ratings[i % ratings.length];
    const positive = rating >= 4;
    const month = 1 + (seed % 9);
    const day = 1 + (seed % 27);
    reviews.push({
      id: `${product.id}-review-${i}`,
      productId: product.id,
      author: pick(NAMES, seed),
      rating,
      title: positive ? pick(POSITIVE_TITLES, seed) : pick(MIXED_TITLES, seed),
      body: positive ? pick(POSITIVE_BODIES, seed) : pick(MIXED_BODIES, seed),
      date: `2026-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
      verified: seed % 5 !== 0,
      helpful: 2 + (seed % 41),
    });
  }

  return reviews.sort((a, b) => b.date.localeCompare(a.date));
}

export interface RatingBreakdown {
  stars: number;
  count: number;
  percent: number;
}

export function ratingBreakdown(product: Product, extra: Review[] = []): RatingBreakdown[] {
  let weights: number[];
  if (product.rating >= 4.7) weights = [0.82, 0.12, 0.04, 0.01, 0.01];
  else if (product.rating >= 4.5) weights = [0.72, 0.18, 0.06, 0.02, 0.02];
  else if (product.rating >= 4.3) weights = [0.62, 0.22, 0.09, 0.04, 0.03];
  else if (product.rating >= 4.0) weights = [0.52, 0.24, 0.13, 0.06, 0.05];
  else weights = [0.42, 0.25, 0.16, 0.09, 0.08];

  const total = product.reviewCount;
  const counts = weights.map((weight, index) =>
    index === weights.length - 1 ? 0 : Math.round(total * weight)
  );
  counts[4] = Math.max(0, total - counts.reduce((sum, value) => sum + value, 0));

  const combined = [0, 0, 0, 0, 0];
  counts.forEach((count, index) => {
    combined[index] += count;
  });
  extra.forEach((review) => {
    const index = 5 - Math.min(5, Math.max(1, review.rating));
    combined[index] += 1;
  });

  const grandTotal = combined.reduce((sum, value) => sum + value, 0) || 1;
  return combined.map((count, index) => ({
    stars: 5 - index,
    count,
    percent: Math.round((count / grandTotal) * 100),
  }));
}

const QUESTIONS: Array<{ q: string; a: string }> = [
  {
    q: 'Does this ship to my country?',
    a: 'Yes. Delivery estimates update automatically when you change your delivery country from the header.',
  },
  {
    q: 'Is there a warranty or returns policy?',
    a: 'Most items include a one-year seller warranty. Returns are accepted within 30 days in original condition.',
  },
  {
    q: 'How long does delivery usually take?',
    a: 'Standard delivery is typically 2-7 business days depending on your country. Express options are shown at checkout.',
  },
  {
    q: 'Is the packaging discreet and secure?',
    a: 'Orders ship in recyclable, tamper-evident packaging with the item protected by recycled padding.',
  },
];

const CATEGORY_QUESTIONS: Record<string, { q: string; a: string }> = {
  electronics: {
    q: 'Does it work with 220-240V power and local plugs?',
    a: 'Yes. Chargers ship with a compatible plug or a USB-C cable; check the specs table for the exact input.',
  },
  'home-kitchen': {
    q: 'Is it dishwasher safe?',
    a: 'Check the Care or Material row in the specs table. Items marked dishwasher safe can go on the top rack.',
  },
  fashion: {
    q: 'How does the sizing run?',
    a: 'Most pieces run true to size. The specs table lists the available sizes and fit; check the size guide on the product page.',
  },
  beauty: {
    q: 'Is it suitable for sensitive skin?',
    a: 'Formulas are fragrance-free unless noted. Patch test first and check the ingredient list in the specs table.',
  },
  sports: {
    q: 'Is it suitable for beginners?',
    a: 'Yes. It is designed for everyday training and includes setup guidance for first-time use.',
  },
  books: {
    q: 'Is this the complete and unabridged edition?',
    a: 'Yes, this is the full edition from the publisher listed in the specs table.',
  },
  toys: {
    q: 'What age is this recommended for?',
    a: 'The recommended age is listed in the specs table. Small parts may not be suitable for children under 3.',
  },
  groceries: {
    q: 'How should I store it after opening?',
    a: 'Store in a cool, dry place and reseal the pouch or jar. Check the label for the best-before date.',
  },
};

export function seedQuestions(product: Product): Question[] {
  const base = hash(product.slug);
  const categoryQuestion = CATEGORY_QUESTIONS[product.category] ?? QUESTIONS[0];
  const list = [QUESTIONS[0], categoryQuestion, QUESTIONS[1 + (base % 2)]];
  return list.map((item, index) => ({
    id: `${product.id}-q-${index}`,
    productId: product.id,
    author: pick(NAMES, base + index * 31),
    question: item.q,
    answer: item.a,
    answerAuthor: `${product.seller} Support`,
    date: `2026-${String(1 + ((base + index) % 9)).padStart(2, '0')}-${String(1 + ((base + index * 3) % 27)).padStart(2, '0')}`,
  }));
}
