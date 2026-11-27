import { useMemo, useState } from 'react';
import { BadgeCheck, MessageCircleQuestion, Star, ThumbsUp } from 'lucide-react';
import type { Product } from '../../types';
import { ratingBreakdown, seedQuestions, seedReviews } from '../../data/reviews';
import { useAuth } from '../../context/AuthContext';
import { useStore } from '../../context/StoreContext';
import { classNames, formatDate } from '../../lib/format';
import { Rating } from '../ui/Rating';
import { Button } from '../ui/Button';

function StarPicker({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex items-center gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onClick={() => onChange(star)}
          className="rounded p-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
        >
          <Star
            className={classNames(
              'h-7 w-7 transition-colors',
              star <= value ? 'fill-[var(--brand-orange)] text-[var(--brand-orange)]' : 'text-[var(--brand-line)] hover:text-[var(--brand-orange)]'
            )}
            aria-hidden="true"
          />
        </button>
      ))}
    </div>
  );
}

export function Reviews({ product }: { product: Product }) {
  const { user } = useAuth();
  const { reviews: storedReviews, questions: storedQuestions, addReview, addQuestion } = useStore();
  const userReviews = storedReviews[product.id] ?? [];
  const userQuestions = storedQuestions[product.id] ?? [];

  const reviews = useMemo(() => [...userReviews, ...seedReviews(product)], [userReviews, product]);
  const questions = useMemo(() => [...userQuestions, ...seedQuestions(product)], [userQuestions, product]);
  const breakdown = useMemo(() => ratingBreakdown(product, userReviews), [product, userReviews]);

  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewAuthor, setReviewAuthor] = useState(user?.name ?? '');
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [visibleCount, setVisibleCount] = useState(4);
  const [helpfulVotes, setHelpfulVotes] = useState<Record<string, boolean>>({});

  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionAuthor, setQuestionAuthor] = useState(user?.name ?? '');
  const [questionText, setQuestionText] = useState('');
  const [questionError, setQuestionError] = useState('');

  const submitReview = (event: React.FormEvent) => {
    event.preventDefault();
    if (!reviewAuthor.trim()) {
      setReviewError('Add the name you want shown with your review.');
      return;
    }
    if (reviewBody.trim().length < 20) {
      setReviewError('Please write at least 20 characters so your review is useful.');
      return;
    }
    addReview({
      id: `local-review-${Date.now()}`,
      productId: product.id,
      author: reviewAuthor.trim(),
      rating: reviewRating,
      title: reviewTitle.trim() || 'Customer review',
      body: reviewBody.trim(),
      date: new Date().toISOString().slice(0, 10),
      verified: false,
      helpful: 0,
    });
    setReviewTitle('');
    setReviewBody('');
    setReviewError('');
    setShowReviewForm(false);
    setVisibleCount((count) => count + 1);
  };

  const submitQuestion = (event: React.FormEvent) => {
    event.preventDefault();
    if (!questionAuthor.trim()) {
      setQuestionError('Add the name you want shown with your question.');
      return;
    }
    if (questionText.trim().length < 10) {
      setQuestionError('Please write a little more so sellers can answer well.');
      return;
    }
    addQuestion({
      id: `local-question-${Date.now()}`,
      productId: product.id,
      author: questionAuthor.trim(),
      question: questionText.trim(),
      date: new Date().toISOString().slice(0, 10),
    });
    setQuestionText('');
    setQuestionError('');
    setShowQuestionForm(false);
  };

  return (
    <div className="space-y-10">
      <section id="reviews" aria-labelledby="reviews-heading" className="scroll-mt-40">
        <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div>
            <h2 id="reviews-heading" className="font-serif text-2xl font-bold text-[var(--brand-ink)]">
              Customer reviews
            </h2>
            <div className="mt-3 flex items-center gap-2">
              <Rating rating={product.rating} size="md" showNumber />
              <span className="text-sm text-[var(--brand-muted)]">({product.reviewCount.toLocaleString()} reviews)</span>
            </div>

            <div className="mt-4 space-y-1.5" aria-hidden="true">
              {breakdown.map((row) => (
                <div key={row.stars} className="flex items-center gap-2 text-xs">
                  <span className="w-10 shrink-0 text-[var(--brand-muted)]">{row.stars} star</span>
                  <div className="h-3 flex-1 overflow-hidden rounded-sm border border-[var(--brand-line)] bg-white">
                    <div className="h-full bg-[var(--brand-orange)]" style={{ width: `${row.percent}%` }} />
                  </div>
                  <span className="w-10 shrink-0 text-right text-[var(--brand-muted)]">{row.percent}%</span>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-[var(--brand-line)] bg-white p-4">
              <h3 className="text-sm font-bold text-[var(--brand-ink)]">Review this product</h3>
              <p className="mt-1 text-xs text-[var(--brand-muted)]">Share your experience with other shoppers.</p>
              <Button size="sm" variant="outline" className="mt-3 w-full" onClick={() => setShowReviewForm((value) => !value)}>
                {showReviewForm ? 'Hide review form' : 'Write a customer review'}
              </Button>
            </div>
          </div>

          <div>
            {showReviewForm && (
              <form
                onSubmit={submitReview}
                className="mb-5 space-y-3 rounded-xl border border-[var(--brand-line)] bg-white p-4"
              >
                <h3 className="text-base font-bold text-[var(--brand-ink)]">Write a review</h3>
                <div>
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">
                    Overall rating
                  </span>
                  <StarPicker value={reviewRating} onChange={setReviewRating} />
                </div>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">
                    Your name
                  </span>
                  <input
                    value={reviewAuthor}
                    onChange={(event) => setReviewAuthor(event.target.value)}
                    className="w-full rounded-lg border border-[var(--brand-line)] px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                    placeholder="e.g. Aline M."
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">
                    Headline
                  </span>
                  <input
                    value={reviewTitle}
                    onChange={(event) => setReviewTitle(event.target.value)}
                    maxLength={80}
                    className="w-full rounded-lg border border-[var(--brand-line)] px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                    placeholder="What should other shoppers know?"
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">
                    Your review
                  </span>
                  <textarea
                    value={reviewBody}
                    onChange={(event) => setReviewBody(event.target.value)}
                    rows={4}
                    maxLength={1200}
                    className="w-full rounded-lg border border-[var(--brand-line)] px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                    placeholder="What did you like or dislike? How did you use it?"
                  />
                </label>
                {reviewError && <p className="text-xs font-semibold text-[var(--brand-danger)]">{reviewError}</p>}
                <Button type="submit" size="sm">
                  Submit review
                </Button>
                <p className="text-[11px] text-[var(--brand-muted)]">
                  Reviews are stored only in this browser.
                </p>
              </form>
            )}

            <ul className="space-y-4">
              {reviews.slice(0, visibleCount).map((review) => (
                <li key={review.id} className="rounded-xl border border-[var(--brand-line)] bg-white p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <Rating rating={review.rating} />
                    <span className="text-sm font-bold text-[var(--brand-ink)]">{review.title}</span>
                  </div>
                  <p className="mt-1 text-xs text-[var(--brand-muted)]">
                    {review.author} · {formatDate(review.date)}
                    {review.verified && (
                      <span className="ml-2 inline-flex items-center gap-1 font-semibold text-[var(--brand-success)]">
                        <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" /> Verified purchase
                      </span>
                    )}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-[var(--brand-ink)]">{review.body}</p>
                  <button
                    type="button"
                    disabled={helpfulVotes[review.id]}
                    onClick={() => setHelpfulVotes((prev) => ({ ...prev, [review.id]: true }))}
                    className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-[var(--brand-line)] px-3 py-1 text-xs font-medium text-[var(--brand-muted)] hover:border-[var(--brand-navy)] hover:text-[var(--brand-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)] disabled:text-[var(--brand-success)]"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" aria-hidden="true" />
                    {helpfulVotes[review.id] ? 'Thanks for your feedback' : `Helpful (${review.helpful + (helpfulVotes[review.id] ? 1 : 0)})`}
                  </button>
                </li>
              ))}
            </ul>
            {visibleCount < reviews.length && (
              <Button
                variant="outline"
                size="sm"
                className="mt-4"
                onClick={() => setVisibleCount((count) => count + 4)}
              >
                Show more reviews
              </Button>
            )}
          </div>
        </div>
      </section>

      <section id="questions" aria-labelledby="questions-heading" className="scroll-mt-40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="questions-heading" className="flex items-center gap-2 font-serif text-2xl font-bold text-[var(--brand-ink)]">
            <MessageCircleQuestion className="h-6 w-6 text-[var(--brand-orange)]" aria-hidden="true" />
            Questions &amp; answers
          </h2>
          <Button variant="outline" size="sm" onClick={() => setShowQuestionForm((value) => !value)}>
            {showQuestionForm ? 'Hide question form' : 'Ask a question'}
          </Button>
        </div>

        {showQuestionForm && (
          <form onSubmit={submitQuestion} className="mt-4 space-y-3 rounded-xl border border-[var(--brand-line)] bg-white p-4">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Your name</span>
              <input
                value={questionAuthor}
                onChange={(event) => setQuestionAuthor(event.target.value)}
                className="w-full rounded-lg border border-[var(--brand-line)] px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                placeholder="e.g. Eric N."
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">Your question</span>
              <textarea
                value={questionText}
                onChange={(event) => setQuestionText(event.target.value)}
                rows={3}
                maxLength={400}
                className="w-full rounded-lg border border-[var(--brand-line)] px-3 py-2 text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                placeholder="Ask about sizing, compatibility, delivery…"
              />
            </label>
            {questionError && <p className="text-xs font-semibold text-[var(--brand-danger)]">{questionError}</p>}
            <Button type="submit" size="sm">
              Post question
            </Button>
          </form>
        )}

        <ul className="mt-4 divide-y divide-[var(--brand-line)] rounded-xl border border-[var(--brand-line)] bg-white">
          {questions.map((entry) => (
            <li key={entry.id} className="p-4">
              <p className="text-sm font-semibold text-[var(--brand-ink)]">
                Q: {entry.question}
              </p>
              <p className="mt-1 text-xs text-[var(--brand-muted)]">Asked by {entry.author} on {formatDate(entry.date)}</p>
              {entry.answer ? (
                <p className="mt-2 rounded-lg bg-[var(--brand-cream)] p-3 text-sm leading-6 text-[var(--brand-ink)]">
                  <span className="font-bold">A:</span> {entry.answer}
                  {entry.answerAuthor && <span className="mt-1 block text-xs text-[var(--brand-muted)]">— {entry.answerAuthor}</span>}
                </p>
              ) : (
                <p className="mt-2 text-xs italic text-[var(--brand-muted)]">Awaiting a seller response.</p>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
