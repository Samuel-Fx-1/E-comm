import type { Category } from '../types';

export const categories: Category[] = [
  {
    slug: 'tech-gaming',
    name: 'Tech & Gaming',
    icon: 'Gamepad2',
    blurb: 'Audio, keyboards and room upgrades',
    gradient: 'from-sky-900 via-slate-900 to-slate-800',
    tint: '#0EA5E9',
  },
  {
    slug: 'streetwear-footwear',
    name: 'Streetwear & Footwear',
    icon: 'Shirt',
    blurb: 'Oversized layers and chunky sneakers',
    gradient: 'from-rose-900 via-stone-900 to-stone-800',
    tint: '#E11D48',
  },
  {
    slug: 'viral-skincare-haircare',
    name: 'Viral Skincare & Haircare',
    icon: 'Sparkles',
    blurb: 'Trending skin, hair and self-care',
    gradient: 'from-fuchsia-900 via-stone-900 to-stone-800',
    tint: '#C026D3',
  },
  {
    slug: 'lifestyle-aesthetic-essentials',
    name: 'Lifestyle & Aesthetic Essentials',
    icon: 'ShoppingBag',
    blurb: 'Everyday carry, hydration and desk gear',
    gradient: 'from-amber-800 via-stone-900 to-stone-800',
    tint: '#D97706',
  },
  {
    slug: 'gen-alpha-kids-corner',
    name: 'Gen Alpha & Kids Corner',
    icon: 'ToyBrick',
    blurb: 'Playful kits, bags and creative cameras',
    gradient: 'from-indigo-900 via-violet-900 to-slate-800',
    tint: '#6366F1',
  },
];

export const getCategory = (slug: string): Category | undefined =>
  categories.find((category) => category.slug === slug);
