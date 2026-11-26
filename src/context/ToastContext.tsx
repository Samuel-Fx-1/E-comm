import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { CheckCircle2, Info, X } from 'lucide-react';

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface ToastItem {
  id: number;
  message: string;
  action?: ToastAction;
  tone: 'success' | 'info';
}

interface ToastContextValue {
  toast: (message: string, options?: { action?: ToastAction; tone?: 'success' | 'info' }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toast = useCallback<ToastContextValue['toast']>((message, options) => {
    const id = nextId.current++;
    const item: ToastItem = { id, message, action: options?.action, tone: options?.tone ?? 'success' };
    setToasts((prev) => [...prev.slice(-2), item]);
    window.setTimeout(() => dismiss(id), 4500);
  }, [dismiss]);

  const value = useMemo(() => ({ toast }), [toast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6 sm:items-end sm:pr-6"
        role="region"
        aria-label="Notifications"
        aria-live="polite"
      >
        {toasts.map((item) => (
          <div
            key={item.id}
            className="pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-xl border border-white/10 bg-[var(--brand-navy)] px-4 py-3 text-white shadow-2xl"
          >
            {item.tone === 'success' ? (
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-yellow)]" aria-hidden="true" />
            ) : (
              <Info className="mt-0.5 h-5 w-5 shrink-0 text-[var(--brand-yellow)]" aria-hidden="true" />
            )}
            <p className="flex-1 text-sm leading-5">{item.message}</p>
            {item.action && (
              <button
                type="button"
                onClick={() => {
                  item.action?.onClick();
                  dismiss(item.id);
                }}
                className="shrink-0 text-sm font-semibold text-[var(--brand-yellow)] underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)]"
              >
                {item.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(item.id)}
              className="shrink-0 rounded p-0.5 text-white/70 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              aria-label="Dismiss notification"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used inside ToastProvider');
  return context;
}
