/**
 * Soko brand + market configuration.
 * Change the brand name, logo text and palette here — the UI reads these values.
 */
export const site = {
  name: 'Soko',
  legalName: 'Soko Marketplace Ltd',
  logoText: 'soko',
  logoAccent: '.',
  logoMark: 'S',
  tagline: 'Everyday finds, delivered.',
  description:
    'Soko is a demo online marketplace for electronics, home, fashion, beauty, books, toys and groceries with delivery across East Africa and beyond.',
  url: 'https://soko.example.com',
  supportEmail: 'help@soko.example.com',
  supportPhone: '+250 788 000 000',
  colors: {
    navy: '#0C1E36',
    navyDeep: '#071426',
    navySoft: '#16304F',
    orange: '#F97316',
    orangeDark: '#EA580C',
    yellow: '#FFC94A',
    yellowDark: '#F0B429',
    cream: '#F6F3EC',
    ink: '#0F172A',
    muted: '#64748B',
    line: '#E2E8F0',
    success: '#0F766E',
    danger: '#B91C1C',
    white: '#FFFFFF',
  },
  defaultCountry: 'RW',
  defaultLanguage: 'en' as const,
  languages: [
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
  ],
  freeShippingThresholdUsd: 35,
  taxRate: 0.08,
  standardShippingUsd: 4.99,
  expressShippingUsd: 12.99,
  productsPerPage: 12,
  maxCompare: 3,
  maxRecentlyViewed: 12,
} as const;

export type LanguageCode = 'en' | 'fr';

export interface Country {
  code: string;
  name: string;
  flag: string;
  currency: string;
  /** Local currency units per 1 USD (demo rates). */
  rate: number;
  decimals: number;
  /** Round displayed prices to this step, e.g. 100 RWF. */
  rounding: number;
  /** Extra days added to a seller's delivery estimate. */
  deliveryOffset: number;
  cities: string[];
}

export const countries: Country[] = [
  {
    code: 'RW',
    name: 'Rwanda',
    flag: '🇷🇼',
    currency: 'RWF',
    rate: 1300,
    decimals: 0,
    rounding: 100,
    deliveryOffset: 2,
    cities: ['Kigali', 'Huye', 'Musanze', 'Rubavu', 'Muhanga', 'Rwamagana', 'Nyagatare'],
  },
  {
    code: 'KE',
    name: 'Kenya',
    flag: '🇰🇪',
    currency: 'KES',
    rate: 129,
    decimals: 0,
    rounding: 10,
    deliveryOffset: 3,
    cities: ['Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret'],
  },
  {
    code: 'UG',
    name: 'Uganda',
    flag: '🇺🇬',
    currency: 'UGX',
    rate: 3800,
    decimals: 0,
    rounding: 100,
    deliveryOffset: 4,
    cities: ['Kampala', 'Entebbe', 'Gulu', 'Mbarara', 'Jinja'],
  },
  {
    code: 'TZ',
    name: 'Tanzania',
    flag: '🇹🇿',
    currency: 'TZS',
    rate: 2600,
    decimals: 0,
    rounding: 100,
    deliveryOffset: 4,
    cities: ['Dar es Salaam', 'Arusha', 'Mwanza', 'Dodoma', 'Zanzibar City'],
  },
  {
    code: 'NG',
    name: 'Nigeria',
    flag: '🇳🇬',
    currency: 'NGN',
    rate: 1600,
    decimals: 0,
    rounding: 100,
    deliveryOffset: 5,
    cities: ['Lagos', 'Abuja', 'Port Harcourt', 'Ibadan', 'Kano'],
  },
  {
    code: 'ZA',
    name: 'South Africa',
    flag: '🇿🇦',
    currency: 'ZAR',
    rate: 18.5,
    decimals: 2,
    rounding: 1,
    deliveryOffset: 4,
    cities: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Port Elizabeth'],
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currency: 'USD',
    rate: 1,
    decimals: 2,
    rounding: 1,
    deliveryOffset: 0,
    cities: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Seattle'],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currency: 'GBP',
    rate: 0.79,
    decimals: 2,
    rounding: 1,
    deliveryOffset: 2,
    cities: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Leeds'],
  },
  {
    code: 'DE',
    name: 'Germany',
    flag: '🇩🇪',
    currency: 'EUR',
    rate: 0.92,
    decimals: 2,
    rounding: 1,
    deliveryOffset: 2,
    cities: ['Berlin', 'Munich', 'Hamburg', 'Cologne', 'Frankfurt'],
  },
  {
    code: 'FR',
    name: 'France',
    flag: '🇫🇷',
    currency: 'EUR',
    rate: 0.92,
    decimals: 2,
    rounding: 1,
    deliveryOffset: 2,
    cities: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice'],
  },
  {
    code: 'AE',
    name: 'United Arab Emirates',
    flag: '🇦🇪',
    currency: 'AED',
    rate: 3.67,
    decimals: 2,
    rounding: 1,
    deliveryOffset: 3,
    cities: ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'],
  },
  {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currency: 'INR',
    rate: 83,
    decimals: 0,
    rounding: 10,
    deliveryOffset: 4,
    cities: ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai'],
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currency: 'CAD',
    rate: 1.36,
    decimals: 2,
    rounding: 1,
    deliveryOffset: 3,
    cities: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa'],
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currency: 'AUD',
    rate: 1.52,
    decimals: 2,
    rounding: 1,
    deliveryOffset: 5,
    cities: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide'],
  },
];

export const getCountry = (code: string): Country =>
  countries.find((c) => c.code === code) ?? countries[0];

export const currencies = [...new Set(countries.map((c) => c.currency))];
