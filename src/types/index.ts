export type CategorySlug =
  | 'electronics'
  | 'home-kitchen'
  | 'fashion'
  | 'beauty'
  | 'sports'
  | 'books'
  | 'toys'
  | 'groceries';

export interface Category {
  slug: CategorySlug;
  name: string;
  icon: string;
  blurb: string;
  /** Tailwind gradient classes for placeholder art. */
  gradient: string;
  tint: string;
}

export interface Product {
  id: string;
  slug: string;
  title: string;
  brand: string;
  category: CategorySlug;
  /** Price in USD cents-free base currency (USD). */
  price: number;
  listPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  stock: number;
  images: string[];
  bullets: string[];
  specs: Record<string, string>;
  seller: string;
  deliveryDays: number;
  isBestSeller: boolean;
  isDeal: boolean;
  addedAt: string;
}

export interface CartLine {
  productId: string;
  qty: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  date: string;
  verified: boolean;
  helpful: number;
}

export interface Question {
  id: string;
  productId: string;
  author: string;
  question: string;
  answer?: string;
  answerAuthor?: string;
  date: string;
}

export interface Address {
  fullName: string;
  phone: string;
  country: string;
  city: string;
  line1: string;
  line2?: string;
  postalCode?: string;
}

export interface SavedAddress extends Address {
  id: string;
  label: string;
}

export interface SavedPaymentMethod {
  id: string;
  type: 'card' | 'mobile-money' | 'cash';
  label: string;
  detail: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface StoredUser extends User {
  salt: string;
  passwordHash: string;
}

export type OrderStatus = 'Ordered' | 'Shipped' | 'Out for delivery' | 'Delivered';

export interface OrderItem {
  productId: string;
  title: string;
  slug: string;
  image: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  createdAt: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  address: Address;
  deliveryMethod: 'standard' | 'express';
  paymentLabel: string;
  status: OrderStatus;
  estimatedDelivery: string;
  email?: string;
  sample?: boolean;
}

export interface ProductFilters {
  q: string;
  category: CategorySlug | 'all';
  min: number;
  max: number;
  rating: number;
  brands: string[];
  inStock: boolean;
  dealsOnly: boolean;
  sort: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
  page: number;
}

export interface Promo {
  id: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  gradient: string;
  icon: string;
  tone: 'light' | 'dark';
}
