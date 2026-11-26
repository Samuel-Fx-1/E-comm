import type { Category } from '../types';

export const categories: Category[] = [
  {
    slug: 'tech-audio-accessories',
    name: 'Tech & Audio Accessories',
    icon: 'Headphones',
    blurb: 'Headphones, keyboards and desk gear',
    gradient: 'from-sky-900 via-slate-900 to-slate-800',
    tint: '#0EA5E9',
  },
  {
    slug: 'apparel-footwear',
    name: 'Apparel & Footwear',
    icon: 'Shirt',
    blurb: 'Everyday layers and casual shoes',
    gradient: 'from-rose-900 via-stone-900 to-stone-800',
    tint: '#E11D48',
  },
  {
    slug: 'skincare-personal-care',
    name: 'Skincare & Personal Care',
    icon: 'Sparkles',
    blurb: 'Skin, hair and self-care favourites',
    gradient: 'from-fuchsia-900 via-stone-900 to-stone-800',
    tint: '#C026D3',
  },
  {
    slug: 'home-kitchen',
    name: 'Home & Kitchen',
    icon: 'CookingPot',
    blurb: 'Cookware, steamers and bathroom upgrades',
    gradient: 'from-amber-800 via-stone-900 to-stone-800',
    tint: '#D97706',
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
