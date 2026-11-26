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

/** Where a gallery image came from. Unsplash images are hotlinked, never rehosted. */
export type ImageSource = 'unsplash' | 'pexels' | 'override' | 'generated' | 'illustrative';

/** A gallery-ready image with accessible text and responsive metadata. */
export interface ResolvedImage {
  src: string;
  srcSet?: string;
  sizes?: string;
  alt: string;
  source: ImageSource;
  width: number;
  height: number;
  /** Tiny blurred image used as a low-cost placeholder while the photo loads. */
  blurSrc?: string;
  color?: string;
  creditId?: string;
  illustrative?: boolean;
}

export interface ProductVariant {
  type: 'color' | 'size';
  name: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  /** Preferred display name. `title` is kept as a compatibility alias. */
  name: string;
  title: string;
  brand: string;
  category: CategorySlug;
  subcategory: string;
  /** RWF is the native price unit. USD aliases remain for the legacy formatter. */
  priceRwf: number;
  oldPriceRwf: number;
  price: number;
  listPrice: number;
  discount: number;
  rating: number;
  reviewCount: number;
  stock: number;
  shortDescription: string;
  /** Gallery entries (main plus 3–5 views) are resolved from data/product-images.json. */
  images: string[];
  bullets: string[];
  specs: Record<string, string>;
  variants: ProductVariant[];
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
