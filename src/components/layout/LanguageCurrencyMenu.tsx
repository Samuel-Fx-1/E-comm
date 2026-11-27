import { useRef, useState } from 'react';
import { Check, ChevronDown, Globe2 } from 'lucide-react';
import { countries, currencies } from '../../config/site';
import type { LanguageCode } from '../../config/site';
import { useSite } from '../../context/SiteContext';
import { useOnClickOutside } from '../../lib/hooks';

const languageLabels: Record<LanguageCode, string> = { en: 'English', fr: 'Français' };

export function LanguageCurrencyMenu() {
  const { language, setLanguage, currency, setCurrency, t } = useSite();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOnClickOutside(ref, () => setOpen(false), open);

  const currencyLabel = (code: string) => {
    const country = countries.find((entry) => entry.currency === code);
    return country ? `${code} · ${country.name}` : code;
  };

  return (
    <div
      ref={ref}
      className="relative"
      onKeyDown={(event) => {
        if (event.key === 'Escape') setOpen(false);
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={`${t('languageCurrency')}: ${language.toUpperCase()} | ${currency}`}
        className="flex items-center gap-1.5 rounded border border-transparent px-2 py-2 text-sm font-semibold text-white hover:border-white/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-yellow)]"
      >
        <Globe2 className="h-4 w-4" aria-hidden="true" />
        <span className="uppercase">{language}</span>
        <span className="text-white/40">|</span>
        <span>{currency}</span>
        <ChevronDown className="h-3 w-3" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-[75] mt-2 w-64 rounded-xl border border-[var(--brand-line)] bg-white p-3 text-[var(--brand-ink)] shadow-2xl"
        >
          <p className="px-2 pb-1 text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">Language</p>
          {(Object.keys(languageLabels) as LanguageCode[]).map((code) => (
            <button
              key={code}
              type="button"
              role="menuitemradio"
              aria-checked={language === code}
              onClick={() => setLanguage(code)}
              className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
            >
              {languageLabels[code]}
              {language === code && <Check className="h-4 w-4 text-[var(--brand-success)]" aria-hidden="true" />}
            </button>
          ))}
          <p className="mt-2 border-t border-[var(--brand-line)] px-2 pb-1 pt-2 text-xs font-bold uppercase tracking-wide text-[var(--brand-muted)]">
            Currency
          </p>
          <div className="max-h-48 overflow-y-auto">
            {currencies.map((code) => (
              <button
                key={code}
                type="button"
                role="menuitemradio"
                aria-checked={currency === code}
                onClick={() => setCurrency(code)}
                className="flex w-full items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-[var(--brand-cream)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--brand-orange)]"
              >
                {currencyLabel(code)}
                {currency === code && <Check className="h-4 w-4 text-[var(--brand-success)]" aria-hidden="true" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
