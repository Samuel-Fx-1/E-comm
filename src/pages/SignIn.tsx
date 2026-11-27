import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Seo } from '../components/ui/Seo';

const schema = z.object({
  email: z
    .string()
    .min(1, 'Enter your email address.')
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'),
  password: z.string().min(8, 'Your password must be at least 8 characters.'),
});

type FormValues = z.infer<typeof schema>;

const inputClass =
  'w-full rounded-lg border border-[var(--brand-line)] bg-white px-3 py-2.5 text-sm text-[var(--brand-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]';

export default function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const from = (location.state as { from?: string } | null)?.from ?? '/account';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    const result = await signIn(values.email, values.password);
    if (!result.ok) {
      setServerError(result.error ?? 'Could not sign in.');
      return;
    }
    navigate(from, { replace: true });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Seo title="Sign in" path="/signin" noIndex />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-6 shadow-sm">
          <h1 className="font-serif text-3xl font-bold text-[var(--brand-ink)]">Sign in</h1>
          <p className="mt-1 text-sm text-[var(--brand-muted)]">
            Welcome back. Your account lives only in this browser.
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
            <div>
              <label htmlFor="signin-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">
                Email
              </label>
              <input
                id="signin-email"
                type="email"
                autoComplete="email"
                className={inputClass}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'signin-email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p id="signin-email-error" className="mt-1 text-xs font-semibold text-[var(--brand-danger)]">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="signin-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">
                Password
              </label>
              <div className="relative">
                <input
                  id="signin-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  className={`${inputClass} pr-10`}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'signin-password-error' : undefined}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-[var(--brand-muted)] hover:text-[var(--brand-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
                </button>
              </div>
              {errors.password && (
                <p id="signin-password-error" className="mt-1 text-xs font-semibold text-[var(--brand-danger)]">
                  {errors.password.message}
                </p>
              )}
            </div>

            {serverError && (
              <p role="alert" className="rounded-lg bg-[var(--brand-danger)]/5 p-2.5 text-xs font-semibold text-[var(--brand-danger)]">
                {serverError}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--brand-yellow)] px-4 py-2.5 text-sm font-bold text-[var(--brand-navy-deep)] hover:bg-[var(--brand-yellow-dark)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Lock className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <p className="mt-4 text-sm text-[var(--brand-muted)]">
            New to Soko?{' '}
            <Link to="/register" className="font-semibold text-[var(--brand-navy)] underline underline-offset-2">
              Create your account
            </Link>
          </p>

          <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-[var(--brand-cream)] p-3 text-[11px] leading-4 text-[var(--brand-muted)]">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--brand-success)]" aria-hidden="true" />
            Local accounts: passwords are salted and SHA-256 hashed in localStorage. Do not reuse a real password.
          </p>
        </div>

        <aside className="rounded-2xl bg-[var(--brand-navy)] p-6 text-white sm:p-8">
          <h2 className="font-serif text-2xl font-bold">One account, the whole marketplace.</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li>Track locally saved orders with a delivery timeline.</li>
            <li>Save addresses and payment methods for faster checkout.</li>
            <li>Keep a wishlist, compare list and recently viewed items.</li>
            <li>Post reviews and questions on any product.</li>
          </ul>
          <p className="mt-6 rounded-xl bg-white/10 p-3 text-xs leading-5 text-white/70">
            This project has no backend. Everything is stored locally in your browser, and clearing site data removes
            your local account, cart and orders.
          </p>
        </aside>
      </div>
    </div>
  );
}
