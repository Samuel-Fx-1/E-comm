import {
  BookOpen, CookingPot, Cpu, Dumbbell, Headphones, Shirt, ShoppingBasket, Sparkles, ToyBrick,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  BookOpen,
  CookingPot,
  Cpu,
  Dumbbell,
  Headphones,
  Shirt,
  ShoppingBasket,
  Sparkles,
  ToyBrick,
};

interface CategoryIconProps {
  name: string;
  className?: string;
}

export function CategoryIcon({ name, className }: CategoryIconProps) {
  const Icon = icons[name] ?? ShoppingBasket;
  return <Icon className={className} aria-hidden="true" />;
}
