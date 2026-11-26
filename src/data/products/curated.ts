import { makeProduct } from '../productFactory';

/**
 * The complete curated catalogue: 16 best-selling and trending products.
 * Every entry uses the standard makeProduct() schema and the five group slugs
 * from CategorySlug. Merchandising group labels are stored in `subcategory`.
 */
export const curatedProducts = [
  // Tech & Audio Accessories
  makeProduct({
    title: 'Wireless Noise-Canceling Headphones', brand: 'Auralis', category: 'tech-audio-accessories',
    subcategory: 'Tech & Audio Accessories',
    price: 89.99, listPrice: 129.99, rating: 4.8, reviewCount: 3240, stock: 64,
    shortDescription: 'Immersive over-ear sound with adaptive noise cancellation and a 40-hour battery.',
    bullets: [
      'Hybrid active noise cancellation quietens commutes and open-plan offices',
      '40 hours of playback with quick charge: 10 minutes gives 5 hours',
      'Memory-foam ear cushions and a foldable, travel-ready frame',
    ],
    specs: { Driver: '40 mm dynamic', Battery: '40 h', Connectivity: 'Bluetooth 5.4', Weight: '248 g' },
    variants: [
      { type: 'color', name: 'Colour', value: 'Midnight Black' },
      { type: 'color', name: 'Colour', value: 'Warm Sand' },
    ],
    isBestSeller: true, isDeal: true, addedAt: '2026-11-20',
  }),
  makeProduct({
    title: 'Bluetooth Neckband Earphones', brand: 'Auralis', category: 'tech-audio-accessories',
    subcategory: 'Tech & Audio Accessories',
    price: 34.99, listPrice: 49.99, rating: 4.5, reviewCount: 1580, stock: 120,
    shortDescription: 'Lightweight neckband earphones with 18-hour playback and magnetic earbuds.',
    bullets: [
      'Flexible neckband stays comfortable through long listening sessions',
      '18-hour playback and USB-C fast charging',
      'Magnetic earbuds pause music when they clip together',
    ],
    specs: { Battery: '18 h', Connectivity: 'Bluetooth 5.3', Weight: '32 g', 'Water resistance': 'IPX4' },
    addedAt: '2026-11-18',
  }),
  makeProduct({
    title: 'Foldable Wireless Keyboard', brand: 'Nordika', category: 'tech-audio-accessories',
    subcategory: 'Tech & Audio Accessories',
    price: 46.99, listPrice: 59.99, rating: 4.6, reviewCount: 940, stock: 78,
    shortDescription: 'A compact folding keyboard that pairs with three devices at once.',
    bullets: [
      'Folds to pocket size for working from cafés and co-working spaces',
      'Pairs with up to three devices and switches with one key',
      'Scissor-switch keys with an integrated stand for phones and tablets',
    ],
    specs: { Layout: '78 keys', Connectivity: 'Bluetooth / USB-C', Battery: '90 days', Weight: '310 g' },
    isTrending: true, isDeal: true, addedAt: '2026-11-16',
  }),
  makeProduct({
    title: 'Wireless Charging Desk Mat', brand: 'Lumo', category: 'tech-audio-accessories',
    subcategory: 'Tech & Audio Accessories',
    price: 39.99, listPrice: 54.99, rating: 4.4, reviewCount: 610, stock: 52,
    shortDescription: 'A large stitched desk mat with a 15W wireless charging pad built in.',
    bullets: [
      'Stitched, water-resistant surface protects a full desk setup',
      '15W wireless charging pad with a removable puck for travel',
      'Non-slip rubber base keeps the mat in place during long sessions',
    ],
    specs: { Size: '900 × 400 mm', Charging: '15 W Qi', Material: 'PU leather', Base: 'Non-slip rubber' },
    isDeal: true, addedAt: '2026-11-14',
  }),
  makeProduct({
    title: 'Mini Rechargeable Precision Screwdriver Set', brand: 'Voltix', category: 'tech-audio-accessories',
    subcategory: 'Tech & Audio Accessories',
    price: 24.99, listPrice: 34.99, rating: 4.7, reviewCount: 1280, stock: 95,
    shortDescription: 'A 24-bit rechargeable driver kit for phones, laptops and small repairs.',
    bullets: [
      '24 interchangeable bits cover the most common device screws',
      'Rechargeable motor with a magnetic tip and LED work light',
      'Slim aluminium case keeps every bit organised',
    ],
    specs: { Bits: '24 pieces', Torque: '0.15 Nm', Charging: 'USB-C', 'Work light': 'Built-in LED' },
    isDeal: true, addedAt: '2026-11-12',
  }),

  // Apparel & Footwear
  makeProduct({
    title: 'Classic Heavyweight Cotton T-Shirt', brand: 'Kanso', category: 'apparel-footwear',
    subcategory: 'Apparel & Footwear',
    price: 19.99, listPrice: 26.99, rating: 4.6, reviewCount: 2140, stock: 210,
    shortDescription: 'A boxy 220gsm cotton tee that holds its shape wash after wash.',
    bullets: [
      '220gsm combed cotton with a soft, substantial hand feel',
      'Pre-shrunk fabric and reinforced shoulder seams',
      'Relaxed unisex fit that works layered or on its own',
    ],
    specs: { Fabric: '100% combed cotton', Weight: '220 gsm', Fit: 'Relaxed unisex', Care: 'Machine wash cold' },
    variants: [
      { type: 'size', name: 'Size', value: 'S' },
      { type: 'size', name: 'Size', value: 'M' },
      { type: 'size', name: 'Size', value: 'L' },
      { type: 'size', name: 'Size', value: 'XL' },
      { type: 'color', name: 'Colour', value: 'Ink Black' },
      { type: 'color', name: 'Colour', value: 'Ivory' },
    ],
    isBestSeller: true, addedAt: '2026-11-21',
  }),
  makeProduct({
    title: 'Lightweight Everyday Windbreaker Jacket', brand: 'Rift', category: 'apparel-footwear',
    subcategory: 'Apparel & Footwear',
    price: 54.99, listPrice: 74.99, rating: 4.5, reviewCount: 870, stock: 66,
    shortDescription: 'A packable windbreaker that blocks breeze without overheating.',
    bullets: [
      'Packable ripstop shell weighs less than a water bottle',
      'Elastic cuffs and an adjustable hood seal out wind',
      'Packs into its own pocket for easy carrying',
    ],
    specs: { Fabric: 'Ripstop nylon', Weight: '240 g', Fit: 'Regular', Care: 'Machine wash cold' },
    variants: [
      { type: 'size', name: 'Size', value: 'M' },
      { type: 'size', name: 'Size', value: 'L' },
      { type: 'color', name: 'Colour', value: 'Olive' },
      { type: 'color', name: 'Colour', value: 'Navy' },
    ],
    isDeal: true, addedAt: '2026-11-19',
  }),
  makeProduct({
    title: 'Casual Low-Top Sneakers', brand: 'Atlas', category: 'apparel-footwear',
    subcategory: 'Apparel & Footwear',
    price: 62.99, listPrice: 84.99, rating: 4.7, reviewCount: 1760, stock: 88,
    shortDescription: 'Clean low-top sneakers with a cushioned footbed for all-day wear.',
    bullets: [
      'Breathable canvas upper with reinforced toe and heel panels',
      'Cushioned foam footbed stays comfortable on paved city streets',
      'Grippy rubber outsole with a classic low-profile silhouette',
    ],
    specs: { Upper: 'Canvas', Sole: 'Rubber', Fit: 'True to size', Care: 'Spot clean' },
    variants: [
      { type: 'size', name: 'Size', value: '39' },
      { type: 'size', name: 'Size', value: '42' },
      { type: 'size', name: 'Size', value: '44' },
      { type: 'color', name: 'Colour', value: 'White' },
      { type: 'color', name: 'Colour', value: 'Black' },
    ],
    isTrending: true, isDeal: true, addedAt: '2026-11-17',
  }),

  // Skincare & Personal Care
  makeProduct({
    title: 'Niacinamide Hydrating Body Lotion', brand: 'Sana', category: 'skincare-personal-care',
    subcategory: 'Skincare & Personal Care',
    price: 17.99, listPrice: 24.99, rating: 4.7, reviewCount: 1980, stock: 140,
    shortDescription: 'A fast-absorbing 5% niacinamide lotion for soft, even-looking skin.',
    bullets: [
      '5% niacinamide helps even out the look of dull skin',
      'Lightweight, non-greasy formula absorbs in seconds',
      'Fragrance-free and suitable for daily use on all skin types',
    ],
    specs: { Volume: '400 ml', 'Key ingredient': '5% niacinamide', 'Skin type': 'All skin types', pH: '5.5' },
    isBestSeller: true, addedAt: '2026-11-22',
  }),
  makeProduct({
    title: 'Collagen Hydrogel Under-Eye Patches', brand: 'Sana', category: 'skincare-personal-care',
    subcategory: 'Skincare & Personal Care',
    price: 21.99, listPrice: 29.99, rating: 4.5, reviewCount: 1120, stock: 75,
    shortDescription: 'Cooling hydrogel patches that hydrate and de-puff tired under-eyes.',
    bullets: [
      'Hydrogel patches stay in place while you move',
      'Collagen and caffeine help skin look rested and refreshed',
      'Thirty pairs in a resealable, travel-friendly jar',
    ],
    specs: { Count: '30 pairs', 'Key ingredients': 'Collagen, caffeine', Use: '20 minutes', 'Skin type': 'All skin types' },
    variants: [
      { type: 'size', name: 'Pack', value: '10 pairs' },
      { type: 'size', name: 'Pack', value: '30 pairs' },
    ],
    isTrending: true, isDeal: true, addedAt: '2026-11-15',
  }),
  makeProduct({
    title: 'Natural Coconut Hair Growth & Repair Oil', brand: 'Mirembe', category: 'skincare-personal-care',
    subcategory: 'Skincare & Personal Care',
    price: 14.99, listPrice: 21.99, rating: 4.6, reviewCount: 1430, stock: 130,
    shortDescription: 'A lightweight coconut oil blend that strengthens and adds shine.',
    bullets: [
      'Cold-pressed coconut oil with baobab and castor oil',
      'Helps reduce breakage and adds shine without heaviness',
      'Works as a leave-in treatment or a weekly hair mask',
    ],
    specs: { Volume: '200 ml', Ingredients: 'Coconut, baobab, castor', Hair: 'All hair types', Origin: 'Rwanda' },
    addedAt: '2026-11-13',
  }),

  // Home & Kitchen
  makeProduct({
    title: 'Nonstick Cookware Set', brand: 'Nordika', category: 'home-kitchen',
    subcategory: 'Home & Kitchen',
    price: 119.99, listPrice: 169.99, rating: 4.7, reviewCount: 2260, stock: 34,
    shortDescription: 'A ten-piece ceramic nonstick set with ovensafe stainless handles.',
    bullets: [
      'Ceramic nonstick coating releases food with minimal oil',
      'Oven safe to 230°C with stay-cool stainless handles',
      'Includes frying pans, saucepans, a stockpot and matching lids',
    ],
    specs: { Pieces: '10', Material: 'Aluminium with ceramic coating', 'Oven safe': '230°C', Care: 'Hand wash recommended' },
    isBestSeller: true, isDeal: true, addedAt: '2026-11-23',
  }),
  makeProduct({
    title: 'Portable Handheld Garment Steamer', brand: 'Lumio', category: 'home-kitchen',
    subcategory: 'Home & Kitchen',
    price: 49.99, listPrice: 69.99, rating: 4.4, reviewCount: 760, stock: 58,
    shortDescription: 'A 20-second-heat handheld steamer for quick wrinkle removal.',
    bullets: [
      'Heats in 20 seconds and runs for up to 25 minutes',
      'Detachable 180 ml tank with a leakage-proof design',
      'Compact enough for a suitcase or a small apartment',
    ],
    specs: { Power: '1500 W', Tank: '180 ml', 'Heat-up': '20 s', Weight: '780 g' },
    addedAt: '2026-11-11',
  }),
  makeProduct({
    title: 'High-Pressure Filtered Shower Head', brand: 'Verdant', category: 'home-kitchen',
    subcategory: 'Home & Kitchen',
    price: 32.99, listPrice: 44.99, rating: 4.6, reviewCount: 910, stock: 102,
    shortDescription: 'A filtered shower head that boosts pressure and reduces chlorine.',
    bullets: [
      'Multi-stage filter reduces chlorine and sediment',
      'Pressurised spray keeps a strong flow in low-pressure buildings',
      'Tool-free installation fits standard shower arms',
    ],
    specs: { Finish: 'Brushed chrome', Filter: 'Multi-stage', Modes: '3 sprays', Installation: 'Tool-free' },
    isDeal: true, addedAt: '2026-11-10',
  }),

  // Digital Products
  makeProduct({
    title: 'All-in-One Productivity Digital Planner', brand: 'Soko Studio', category: 'digital',
    subcategory: 'Digital Products',
    price: 12.99, listPrice: 19.99, rating: 4.8, reviewCount: 1340, stock: 9999,
    shortDescription: 'A hyperlinked 2027 planner with goals, habits and budget pages.',
    bullets: [
      'Hyperlinked tabs jump straight to calendars, habits and budgets',
      'Includes weekly, monthly and quarterly review templates',
      'Instant download for GoodNotes, Notability and PDF apps',
    ],
    specs: { Format: 'PDF + GoodNotes', Pages: '320', Year: '2027', Delivery: 'Instant download' },
    variants: [
      { type: 'size', name: 'Format', value: 'PDF' },
      { type: 'size', name: 'Format', value: 'GoodNotes' },
    ],
    deliveryDays: 0, isTrending: true, isDeal: true, addedAt: '2026-11-24',
  }),
  makeProduct({
    title: 'Professional Photo Editing Presets Bundle', brand: 'Soko Studio', category: 'digital',
    subcategory: 'Digital Products',
    price: 18.99, listPrice: 29.99, rating: 4.7, reviewCount: 980, stock: 9999,
    shortDescription: 'Forty cinematic presets for Lightroom and Camera Raw.',
    bullets: [
      'Forty looks for portraits, travel and everyday scenes',
      'One-click presets with adjustable intensity sliders',
      'Includes a short guide to building a consistent feed',
    ],
    specs: { Count: '40 presets', Format: 'XMP + DNG', Software: 'Lightroom / Camera Raw', Delivery: 'Instant download' },
    variants: [
      { type: 'size', name: 'Format', value: 'XMP' },
      { type: 'size', name: 'Format', value: 'DNG' },
    ],
    deliveryDays: 0, addedAt: '2026-11-09',
  }),
];
