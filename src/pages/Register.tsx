import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Lock, UserPlus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Seo } from '../components/ui/Seo';

const schema = z
  .object({
    name: z.string().min(2, 'Enter your full name.'),
    email: z
      .string()
      .min(1, 'Enter your email address.')
      .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Enter a valid email address.'),
    password: z.string().min(8, 'Use at least 8 characters.'),
    confirm: z.string().min(1, 'Confirm your password.'),
  })
  .refine((values) => values.password === values.confirm, {
    message: 'Passwords do not match.',
    path: ['confirm'],
  });

type FormValues = z.infer<typeof schema>;

const inputClass =
  'w-full rounded-lg border border-[var(--brand-line)] bg-white px-3 py-2.5 text-sm text-[var(--brand-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]';

export default function RegisterPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerError('');
    const result = await signUp(values.name, values.email, values.password);
    if (!result.ok) {
      setServerError(result.error ?? 'Could not create your account.');
      return;
    }
    navigate('/account', { replace: true });
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Seo title="Create account" path="/register" noIndex />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-[var(--brand-line)] bg-white p-6 shadow-sm">
          <h1 className="font-serif text-3xl font-bold text-[var(--brand-ink)]">Create your account</h1>
          <p className="mt-1 text-sm text-[var(--brand-muted)]">It takes a minute and stays on this device.</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-4" noValidate>
            <div>
              <label htmlFor="register-name" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">
                Full name
              </label>
              <input
                id="register-name"
                autoComplete="name"
                className={inputClass}
                aria-invalid={Boolean(errors.name)}
                aria-describedby={errors.name ? 'register-name-error' : undefined}
                {...register('name')}
              />
              {errors.name && (
                <p id="register-name-error" className="mt-1 text-xs font-semibold text-[var(--brand-danger)]">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="register-email" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">
                Email
              </label>
              <input
                id="register-email"
                type="email"
                autoComplete="email"
                className={inputClass}
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? 'register-email-error' : undefined}
                {...register('email')}
              />
              {errors.email && (
                <p id="register-email-error" className="mt-1 text-xs font-semibold text-[var(--brand-danger)]">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="register-password" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">
                Password
              </label>
              <div className="relative">
                <input
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={`${inputClass} pr-10`}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? 'register-password-error' : 'register-password-hint'}
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
              <p id="register-password-hint" className="mt-1 text-[11px] text-[var(--brand-muted)]">
                At least 8 characters. Do not reuse a real password.
              </p>
              {errors.password && (
                <p id="register-password-error" className="mt-1 text-xs font-semibold text-[var(--brand-danger)]">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="register-confirm" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--brand-muted)]">
                Confirm password
              </label>
              <input
                id="register-confirm"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                className={inputClass}
                aria-invalid={Boolean(errors.confirm)}
                aria-describedby={errors.confirm ? 'register-confirm-error' : undefined}
                {...register('confirm')}
              />
              {errors.confirm && (
                <p id="register-confirm-error" className="mt-1 text-xs font-semibold text-[var(--brand-danger)]">
                  {errors.confirm.message}
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
              <UserPlus className="h-4 w-4" aria-hidden="true" />
              {isSubmitting ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="mt-4 text-sm text-[var(--brand-muted)]">
            Already have an account?{' '}
            <Link to="/signin" className="font-semibold text-[var(--brand-navy)] underline underline-offset-2">
              Sign in
            </Link>
          </p>

          <p className="mt-4 flex items-start gap-1.5 rounded-lg bg-[var(--brand-cream)] p-3 text-[11px] leading-4 text-[var(--brand-muted)]">
            <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--brand-success)]" aria-hidden="true" />
            Demo registration: credentials are salted and hashed with SHA-256 in localStorage. There is no server and no
            email verification.
          </p>
        </div>

        <aside className="rounded-2xl bg-[var(--brand-navy)] p-6 text-white sm:p-8">
          <h2 className="font-serif text-2xl font-bold">A marketplace that remembers you.</h2>
          <ul className="mt-4 space-y-3 text-sm text-white/80">
            <li>Save your delivery address for one-tap checkout.</li>
            <li>Follow orders from placed to delivered.</li>
            <li>Build a wishlist and compare products side by side.</li>
            <li>Get recommendations based on what you browse.</li>
          </ul>
          <p className="mt-6 rounded-xl bg-white/10 p-3 text-xs leading-5 text-white/70">
            Accounts are for demonstration only. No real personal data should be entered, and no credentials leave this
            browser.
          </p>
        </aside>
      </div>
    </div>
  );
}
