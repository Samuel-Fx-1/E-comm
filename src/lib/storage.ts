export function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage may be unavailable or full — demo app keeps working in memory */
  }
}

export function readString(key: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

export function writeString(key: string, value: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function removeKey(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const storageKeys = {
  cart: 'soko_cart_v1',
  saved: 'soko_saved_v1',
  wishlist: 'soko_wishlist_v1',
  compare: 'soko_compare_v1',
  recent: 'soko_recent_v1',
  reviews: 'soko_reviews_v1',
  questions: 'soko_questions_v1',
  orders: 'soko_orders_v1',
  users: 'soko_users_v1',
  session: 'soko_session_v1',
  country: 'soko_country_v1',
  city: 'soko_city_v1',
  currency: 'soko_currency_v1',
  language: 'soko_language_v1',
  shipBanner: 'soko_ship_banner_v1',
} as const;
