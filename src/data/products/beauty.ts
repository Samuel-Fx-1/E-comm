import { makeProduct } from '../productFactory';

export const beauty = [
  makeProduct({
    title: 'Sana Vitamin C Serum', brand: 'Sana', category: 'beauty',
    price: 24.99, listPrice: 34.99, rating: 4.6, reviewCount: 1820, stock: 75,
    bullets: ['10% stabilised vitamin C with hyaluronic acid', 'Brightens and evens tone over time', 'Lightweight, fragrance-free formula'],
    specs: { Volume: '30 ml', 'Key actives': 'Vitamin C, HA', 'Skin type': 'All', Vegan: 'Yes' },
    isBestSeller: true,
  }),
  makeProduct({
    title: 'Sana Hydrating Face Cream', brand: 'Sana', category: 'beauty',
    price: 19.99, listPrice: 27.99, rating: 4.5, reviewCount: 1240, stock: 92,
    bullets: ['Ceramide-rich cream for a soft barrier', 'Non-greasy finish under makeup', 'Fragrance-free and dermatologist tested'],
    specs: { Volume: '50 ml', 'Key actives': 'Ceramides, squalane', 'Skin type': 'Normal to dry', Texture: 'Cream' },
  }),
  makeProduct({
    title: 'Mirembe Shea Butter Body Set', brand: 'Mirembe', category: 'beauty',
    price: 29.99, listPrice: 39.99, rating: 4.8, reviewCount: 980, stock: 60,
    bullets: ['Raw shea, cocoa butter and baobab oil', 'Three-piece set for bath and after', 'Sourced from women-led cooperatives'],
    specs: { Pieces: '3', 'Key actives': 'Shea, baobab', Scent: 'Light vanilla', Size: '250 ml each' },
  }),
  makeProduct({
    title: 'Sana Charcoal Clay Mask', brand: 'Sana', category: 'beauty',
    price: 14.99, listPrice: 19.99, rating: 4.3, reviewCount: 640, stock: 120,
    bullets: ['Kaolin and charcoal draw out excess oil', 'Cooling gel-clay texture', 'Ten-minute weekly reset'],
    specs: { Volume: '75 ml', 'Key actives': 'Charcoal, kaolin', 'Skin type': 'Oily/combination', Use: '1-2x weekly' },
  }),
  makeProduct({
    title: 'Lumio Ionic Hair Dryer', brand: 'Lumio', category: 'beauty',
    price: 59.99, listPrice: 79.99, rating: 4.4, reviewCount: 530, stock: 28,
    bullets: ['Fast drying with ionic frizz control', 'Three heat and two speed settings', 'Cool-shot button and concentrator nozzle'],
    specs: { Power: '1800 W', Settings: '3 heat / 2 speed', Weight: '540 g', Cable: '2.5 m' },
    isDeal: true,
  }),
  makeProduct({
    title: 'Sana Matte Lipstick Trio', brand: 'Sana', category: 'beauty',
    price: 22.99, listPrice: 29.99, rating: 4.5, reviewCount: 890, stock: 84,
    bullets: ['Three wearable matte shades', 'Creamy application that sets soft', 'Enriched with jojoba and vitamin E'],
    specs: { Pieces: '3', Finish: 'Matte', Shades: 'Rose, clay, berry', Weight: '3.5 g each' },
  }),
  makeProduct({
    title: 'Mirembe Essential Oil Gift Set', brand: 'Mirembe', category: 'beauty',
    price: 34.99, listPrice: 49.99, rating: 4.7, reviewCount: 410, stock: 44,
    bullets: ['Six single-origin oils with a wooden stand', 'Lavender, eucalyptus, tea tree and more', 'Steam-distilled, no synthetic fragrance'],
    specs: { Pieces: '6', Volume: '10 ml each', Purity: '100% essential oil', Stand: 'Bamboo' },
  }),
  makeProduct({
    title: 'Sana SPF 50 Sunscreen', brand: 'Sana', category: 'beauty',
    price: 16.99, listPrice: 22.99, rating: 4.6, reviewCount: 1560, stock: 140,
    bullets: ['Broad-spectrum SPF 50 protection', 'No white cast on deeper skin tones', 'Reef-friendly filters'],
    specs: { Volume: '50 ml', SPF: '50', 'Water resistance': '80 min', Finish: 'Invisible' },
    isBestSeller: true,
  }),
  makeProduct({
    title: 'Mirembe Beard Grooming Kit', brand: 'Mirembe', category: 'beauty',
    price: 27.99, listPrice: 39.99, rating: 4.4, reviewCount: 320, stock: 51,
    bullets: ['Beard wash, oil and balm trio', 'Softens coarse hair and calms itch', 'Cedar and bergamot scent'],
    specs: { Pieces: '3', 'Key oils': 'Argan, jojoba', Scent: 'Cedar/bergamot', Size: '100 ml / 30 ml' },
  }),
  makeProduct({
    title: 'Sana Makeup Brush Set 12-piece', brand: 'Sana', category: 'beauty',
    price: 25.99, listPrice: 39.99, rating: 4.5, reviewCount: 720, stock: 67,
    bullets: ['Twelve face and eye brushes', 'Soft synthetic bristles, vegan', 'Storage case and cleaning mat included'],
    specs: { Pieces: '12', Bristles: 'Synthetic', Handle: 'Birch', Case: 'Cotton roll' },
  }),
];
