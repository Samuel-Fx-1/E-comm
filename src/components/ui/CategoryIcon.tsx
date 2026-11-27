import {
  BookOpen, CookingPot, Cpu, Download, Dumbbell, Gamepad2, Headphones, Shirt, ShoppingBag, ShoppingBasket, Sparkles, ToyBrick,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const icons: Record<string, LucideIcon> = {
  BookOpen,
  CookingPot,
  Cpu,
  Download,
  Dumbbell,
  Gamepad2,
  Headphones,
  Shirt,
  ShoppingBag,
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
