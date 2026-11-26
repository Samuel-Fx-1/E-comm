import type { Category } from '../types';

export const categories: Category[] = [
  {
    slug: 'electronics',
    name: 'Electronics',
    icon: 'Cpu',
    blurb: 'Audio, charging, displays and smart gear',
    gradient: 'from-sky-900 via-slate-900 to-slate-800',
    tint: '#0EA5E9',
  },
  {
    slug: 'home-kitchen',
    name: 'Home & Kitchen',
    icon: 'CookingPot',
    blurb: 'Cookware, coffee, decor and cleaning',
    gradient: 'from-amber-800 via-stone-900 to-stone-800',
    tint: '#D97706',
  },
  {
    slug: 'fashion',
    name: 'Fashion',
    icon: 'Shirt',
    blurb: 'Everyday layers, shoes and accessories',
    gradient: 'from-rose-900 via-stone-900 to-stone-800',
    tint: '#E11D48',
  },
  {
    slug: 'beauty',
    name: 'Beauty',
    icon: 'Sparkles',
    blurb: 'Skin, hair and self-care favourites',
    gradient: 'from-fuchsia-900 via-stone-900 to-stone-800',
    tint: '#C026D3',
  },
  {
    slug: 'sports',
    name: 'Sports & Outdoors',
    icon: 'Dumbbell',
    blurb: 'Training, hiking and camping essentials',
    gradient: 'from-emerald-900 via-stone-900 to-stone-800',
    tint: '#059669',
  },
  {
    slug: 'books',
    name: 'Books',
    icon: 'BookOpen',
    blurb: 'Fiction, cooking, design and field guides',
    gradient: 'from-indigo-900 via-slate-900 to-slate-800',
    tint: '#4F46E5',
  },
  {
    slug: 'toys',
    name: 'Toys & Games',
    icon: 'ToyBrick',
    blurb: 'Building sets, plush and outdoor play',
    gradient: 'from-orange-900 via-stone-900 to-stone-800',
    tint: '#EA580C',
  },
  {
    slug: 'groceries',
    name: 'Groceries',
    icon: 'ShoppingBasket',
    blurb: 'Coffee, pantry staples and local treats',
    gradient: 'from-lime-900 via-stone-900 to-stone-800',
    tint: '#65A30D',
  },
  {
    slug: 'digital',
    name: 'Digital Products',
    icon: 'Download',
    blurb: 'Planners, presets and instant downloads',
    gradient: 'from-sky-900 via-indigo-900 to-slate-800',
    tint: '#6366F1',
  },
];

export const getCategory = (slug: string): Category | undefined =>
  categories.find((category) => category.slug === slug);
