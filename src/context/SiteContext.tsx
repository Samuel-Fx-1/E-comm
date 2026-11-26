import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { countries, getCountry, site } from '../config/site';
import type { Country, LanguageCode } from '../config/site';
import { formatMoneyMeta } from '../lib/format';
import { translate } from '../lib/i18n';
import type { TranslationKey } from '../lib/i18n';
import { readString, storageKeys, writeString } from '../lib/storage';

interface SiteContextValue {
  country: Country;
  countryCode: string;
  city: string;
  currency: string;
  language: LanguageCode;
  countryModalOpen: boolean;
  shipBannerDismissed: boolean;
  setCountry: (code: string) => void;
  setCity: (city: string) => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: LanguageCode) => void;
  setCountryModalOpen: (open: boolean) => void;
  dismissShipBanner: () => void;
  resetShipBanner: () => void;
  money: (rwf: number) => string;
  t: (key: TranslationKey) => string;
}

const SiteContext = createContext<SiteContextValue | null>(null);

const currencyMeta = (code: string) =>
  countries.find((entry) => entry.currency === code) ?? countries[0];

export function SiteProvider({ children }: { children: ReactNode }) {
  const [countryCode, setCountryCodeState] = useState(() => readString(storageKeys.country, site.defaultCountry));
  const [city, setCityState] = useState(() => {
    const code = readString(storageKeys.country, site.defaultCountry);
    return readString(storageKeys.city, getCountry(code).cities[0]);
  });
  const [currency, setCurrencyState] = useState(() => {
    const code = readString(storageKeys.country, site.defaultCountry);
    return readString(storageKeys.currency, getCountry(code).currency);
  });
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const stored = readString(storageKeys.language, site.defaultLanguage);
    return stored === 'fr' ? 'fr' : 'en';
  });
  const [countryModalOpen, setCountryModalOpen] = useState(false);
  const [shipBannerDismissed, setShipBannerDismissed] = useState(
    () => readString(storageKeys.shipBanner, 'open') === 'dismissed'
  );

  const country = getCountry(countryCode);

  useEffect(() => {
    writeString(storageKeys.country, countryCode);
  }, [countryCode]);

  useEffect(() => {
    writeString(storageKeys.city, city);
  }, [city]);

  useEffect(() => {
    writeString(storageKeys.currency, currency);
  }, [currency]);

  useEffect(() => {
    writeString(storageKeys.language, language);
    document.documentElement.lang = language;
  }, [language]);

  const setCountry = useCallback((code: string) => {
    const next = getCountry(code);
    setCountryCodeState(next.code);
    setCityState(next.cities[0]);
    setCurrencyState(next.currency);
  }, []);

  const setCity = useCallback((nextCity: string) => {
    setCityState(nextCity);
  }, []);

  const setCurrency = useCallback((nextCurrency: string) => {
    if (countries.some((entry) => entry.currency === nextCurrency)) setCurrencyState(nextCurrency);
  }, []);

  const dismissShipBanner = useCallback(() => {
    setShipBannerDismissed(true);
    writeString(storageKeys.shipBanner, 'dismissed');
  }, []);

  const resetShipBanner = useCallback(() => {
    setShipBannerDismissed(false);
    writeString(storageKeys.shipBanner, 'open');
  }, []);

  const money = useCallback((rwf: number) => formatMoneyMeta(rwf, currencyMeta(currency)), [currency]);
  const t = useCallback((key: TranslationKey) => translate(language, key), [language]);

  const value = useMemo<SiteContextValue>(
    () => ({
      country,
      countryCode,
      city,
      currency,
      language,
      countryModalOpen,
      shipBannerDismissed,
      setCountry,
      setCity,
      setCurrency,
      setLanguage: setLanguageState,
      setCountryModalOpen,
      dismissShipBanner,
      resetShipBanner,
      money,
      t,
    }),
    [country, countryCode, city, currency, language, countryModalOpen, shipBannerDismissed, setCountry, setCity, setCurrency, dismissShipBanner, resetShipBanner, money, t]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
}

export function useSite(): SiteContextValue {
  const context = useContext(SiteContext);
  if (!context) throw new Error('useSite must be used inside SiteProvider');
  return context;
}
