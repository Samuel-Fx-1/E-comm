import { makeProduct } from '../productFactory';

export const fashion = [
  makeProduct({
    title: 'Rift Everyday Sneakers', brand: 'Rift', category: 'fashion',
    price: 59.99, listPrice: 89.99, rating: 4.5, reviewCount: 2140, stock: 52,
    bullets: ['Knit upper with a padded collar', 'Cushioned EVA midsole for all-day wear', 'Rubber outsole with a subtle grip pattern'],
    specs: { Upper: 'Recycled knit', Sole: 'EVA + rubber', Fit: 'True to size', Sizes: 'EU 38-46' },
    isBestSeller: true,
  }),
  makeProduct({
    title: 'Kanso Linen Shirt', brand: 'Kanso', category: 'fashion',
    price: 39.99, listPrice: 54.99, rating: 4.4, reviewCount: 870, stock: 64,
    bullets: ['Breathable European linen', 'Relaxed cut with a soft collar', 'Corozo buttons and a chest pocket'],
    specs: { Material: '100% linen', Fit: 'Relaxed', Care: 'Machine wash cold', Sizes: 'XS-XXL' },
  }),
  makeProduct({
    title: 'Mirembe Ankara Print Wrap Dress', brand: 'Mirembe', category: 'fashion',
    price: 64.99, listPrice: 89.99, rating: 4.8, reviewCount: 512, stock: 29,
    bullets: ['Hand-finished wax print in small batches', 'Adjustable wrap tie with a flattering drape', 'Lined bodice and pockets'],
    specs: { Material: 'Cotton wax print', Length: 'Midi', Care: 'Hand wash', Sizes: 'XS-XL' },
    isBestSeller: true,
  }),
  makeProduct({
    title: 'Rift Slim Chino Pants', brand: 'Rift', category: 'fashion',
    price: 44.99, listPrice: 59.99, rating: 4.3, reviewCount: 1090, stock: 71,
    bullets: ['Stretch cotton twill that moves with you', 'Slim through the leg with a clean hem', 'Hidden coin pocket and reinforced belt loops'],
    specs: { Material: '98% cotton, 2% elastane', Fit: 'Slim', Rise: 'Mid', Sizes: '28-40' },
  }),
  makeProduct({
    title: 'Kanso Wool Blend Overcoat', brand: 'Kanso', category: 'fashion',
    price: 129.99, listPrice: 189.99, rating: 4.6, reviewCount: 340, stock: 12,
    bullets: ['Warm wool blend with a smooth lining', 'Notch lapel and deep welt pockets', 'Falls just below the knee'],
    specs: { Material: '60% wool blend', Lining: 'Recycled polyester', Fit: 'Tailored', Care: 'Dry clean' },
    isDeal: true,
  }),
  makeProduct({
    title: 'Mirembe Beaded Bracelet Set', brand: 'Mirembe', category: 'fashion',
    price: 19.99, listPrice: 29.99, rating: 4.7, reviewCount: 760, stock: 110,
    bullets: ['Three stacking bracelets with glass beads', 'Adjustable cord fits most wrists', 'Handmade by artisans in Kigali'],
    specs: { Pieces: '3', Beads: 'Glass', Closure: 'Adjustable', Care: 'Wipe clean' },
  }),
  makeProduct({
    title: 'Rift Canvas Backpack 22L', brand: 'Rift', category: 'fashion',
    price: 49.99, listPrice: 69.99, rating: 4.6, reviewCount: 980, stock: 46,
    bullets: ['Padded 15-inch laptop sleeve', 'Water-resistant waxed canvas', 'Side bottle pockets and a luggage strap'],
    specs: { Capacity: '22 L', Material: 'Waxed canvas', Laptop: 'Up to 15 in', Warranty: '2 years' },
  }),
  makeProduct({
    title: 'Kanso Leather Belt', brand: 'Kanso', category: 'fashion',
    price: 24.99, listPrice: 34.99, rating: 4.5, reviewCount: 640, stock: 88,
    bullets: ['Full-grain leather that ages beautifully', 'Brushed nickel buckle', 'Five holes for an easy fit'],
    specs: { Material: 'Full-grain leather', Width: '3.5 cm', Sizes: '80-115 cm', Buckle: 'Nickel' },
  }),
  makeProduct({
    title: 'Mirembe Silk Scarf', brand: 'Mirembe', category: 'fashion',
    price: 34.99, listPrice: 49.99, rating: 4.7, reviewCount: 290, stock: 35,
    bullets: ['Lightweight silk with hand-rolled edges', 'Original botanical print', 'Packs flat for travel'],
    specs: { Material: '100% silk', Size: '90 x 90 cm', Care: 'Dry clean', Print: 'Botanical' },
  }),
  makeProduct({
    title: 'Rift Performance Running Jacket', brand: 'Rift', category: 'fashion',
    price: 69.99, listPrice: 99.99, rating: 4.4, reviewCount: 430, stock: 27,
    bullets: ['Wind-resistant shell with laser-cut vents', 'Reflective details for low light', 'Packs into its own pocket'],
    specs: { Material: 'Recycled ripstop', Water: 'DWR coating', Fit: 'Athletic', Pockets: '2 zip' },
    isDeal: true,
  }),
  makeProduct({
    title: 'Kanso Classic Denim Jacket', brand: 'Kanso', category: 'fashion',
    price: 79.99, listPrice: 109.99, rating: 4.6, reviewCount: 720, stock: 33,
    bullets: ['Rigid 12 oz denim with a vintage wash', 'Classic four-pocket styling', 'Adjustable waist tabs'],
    specs: { Material: '100% cotton denim', Fit: 'Regular', Wash: 'Vintage indigo', Sizes: 'S-XXL' },
  }),
];
