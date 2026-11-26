import type { Order, OrderItem } from '../types';
import { getProduct } from './products';
import { imagesFor } from './imageMap';

function item(slug: string, qty: number): OrderItem {
  const product = getProduct(slug);
  if (!product) throw new Error(`Unknown sample product: ${slug}`);
  return {
    productId: product.id,
    title: product.title,
    slug: product.slug,
    image: imagesFor(product)[0],
    price: product.price,
    qty,
  };
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function daysAhead(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

const deliveredItems = [
  item('auralis-pulse-5-wireless-earbuds', 1),
  item('kanso-ceramic-pour-over-set', 1),
];
const inTransitItems = [
  item('nordika-air-fryer-5-5l', 1),
  item('kigali-roasters-single-origin-coffee-500g', 2),
];

const subtotal = (items: OrderItem[]) => items.reduce((sum, line) => sum + line.price * line.qty, 0);
const round = (value: number) => Math.round(value * 100) / 100;

const deliveredSubtotal = subtotal(deliveredItems);
const transitSubtotal = subtotal(inTransitItems);

export const sampleOrders: Order[] = [
  {
    id: 'SK-8F2A91',
    createdAt: daysAgo(12),
    items: deliveredItems,
    subtotal: deliveredSubtotal,
    shipping: 0,
    tax: round(deliveredSubtotal * 0.08),
    total: round(deliveredSubtotal * 1.08),
    address: {
      fullName: 'Demo Customer',
      phone: '+250 788 000 000',
      country: 'RW',
      city: 'Kigali',
      line1: '12 KG 7 Avenue',
      line2: 'Kacyiru',
      postalCode: '0000',
    },
    deliveryMethod: 'standard',
    paymentLabel: 'Visa ending 4242',
    status: 'Delivered',
    estimatedDelivery: daysAgo(7),
    sample: true,
  },
  {
    id: 'SK-3C7B04',
    createdAt: daysAgo(3),
    items: inTransitItems,
    subtotal: transitSubtotal,
    shipping: 0,
    tax: round(transitSubtotal * 0.08),
    total: round(transitSubtotal * 1.08),
    address: {
      fullName: 'Demo Customer',
      phone: '+250 788 000 000',
      country: 'RW',
      city: 'Kigali',
      line1: '12 KG 7 Avenue',
      line2: 'Kacyiru',
      postalCode: '0000',
    },
    deliveryMethod: 'express',
    paymentLabel: 'MTN Mobile Money',
    status: 'Out for delivery',
    estimatedDelivery: daysAhead(1),
    sample: true,
  },
];
