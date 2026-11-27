import type { Country } from '../config/site';
import { getCountry, site } from '../config/site';

/** Convert an RWF-native amount into a selected country's display currency. */
export function convertRwf(rwf: number, country: Country): number {
  const raw = (rwf / site.rwfPerUsd) * country.rate;
  if (country.rounding > 1) {
    return Math.round(raw / country.rounding) * country.rounding;
  }
  return Math.round(raw * 100) / 100;
}

export function formatMoney(rwf: number, countryCode: string): string {
  const country = getCountry(countryCode);
  return formatMoneyMeta(rwf, country);
}

export function formatMoneyMeta(
  rwf: number,
  meta: { currency: string; rate: number; decimals: number; rounding: number }
): string {
  const raw = (rwf / site.rwfPerUsd) * meta.rate;
  const value =
    meta.rounding > 1
      ? Math.round(raw / meta.rounding) * meta.rounding
      : Math.round(raw * 100) / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: meta.currency,
    minimumFractionDigits: meta.decimals,
    maximumFractionDigits: meta.decimals,
  }).format(value);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

export function discountPercent(price: number, listPrice: number): number {
  if (!listPrice || listPrice <= price) return 0;
  return Math.round(((listPrice - price) / listPrice) * 100);
}

export function formatDate(iso: string, language = 'en'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function addDays(iso: string | Date, days: number): string {
  const base = typeof iso === 'string' ? new Date(iso) : new Date(iso.getTime());
  base.setDate(base.getDate() + days);
  return base.toISOString();
}

/** Delivery window in days, including the destination country's offset. */
export function deliveryWindow(deliveryDays: number, countryCode: string, express = false): { min: number; max: number } {
  const country = getCountry(countryCode);
  const base = Math.max(1, deliveryDays + country.deliveryOffset);
  if (express) return { min: Math.max(1, base - 1), max: base };
  return { min: base, max: base + 2 };
}

export function deliveryDateRange(deliveryDays: number, countryCode: string, express = false, language = 'en'): string {
  const { min, max } = deliveryWindow(deliveryDays, countryCode, express);
  const start = new Date();
  start.setDate(start.getDate() + min);
  const end = new Date();
  end.setDate(end.getDate() + max);
  const fmt = (d: Date) =>
    d.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function estimatedDeliveryIso(deliveryDays: number, countryCode: string, express = false): string {
  const { max } = deliveryWindow(deliveryDays, countryCode, express);
  const date = new Date();
  date.setDate(date.getDate() + max);
  return date.toISOString();
}

export function classNames(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
