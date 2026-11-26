import { makeProduct } from '../productFactory';

export const groceries = [
  makeProduct({
    title: 'Kigali Roasters Single-Origin Coffee 500g', brand: 'Kigali Roasters', category: 'groceries',
    price: 16.99, listPrice: 22.99, rating: 4.8, reviewCount: 1240, stock: 90,
    bullets: ['Washed Rwandan Arabica from Nyamasheke', 'Notes of red apple, honey and cocoa', 'Roasted weekly and packed with a valve'],
    specs: { Weight: '500 g', Origin: 'Nyamasheke, RW', Roast: 'Medium', Process: 'Washed' },
    isBestSeller: true, isDeal: true,
  }),
  makeProduct({
    title: 'Mirembe Raw Wildflower Honey 500g', brand: 'Mirembe', category: 'groceries',
    price: 12.99, listPrice: 17.99, rating: 4.8, reviewCount: 980, stock: 120,
    bullets: ['Raw and unfiltered, never heated', 'Harvested by beekeepers in the Eastern Province', 'Glass jar with a wooden dipper'],
    specs: { Weight: '500 g', Origin: 'Rwanda', Type: 'Wildflower', Raw: 'Yes' },
  }),
  makeProduct({
    title: 'Kigali Roasters Green Tea 40 bags', brand: 'Kigali Roasters', category: 'groceries',
    price: 8.99, listPrice: 11.99, rating: 4.5, reviewCount: 520, stock: 160,
    bullets: ['Highland green tea with a clean finish', 'Biodegradable pyramid bags', '40 bags in a resealable pouch'],
    specs: { Bags: '40', Origin: 'Rwanda', Type: 'Green', Packaging: 'Resealable' },
  }),
  makeProduct({
    title: 'Sana Extra Virgin Olive Oil 1L', brand: 'Sana', category: 'groceries',
    price: 18.99, listPrice: 24.99, rating: 4.6, reviewCount: 740, stock: 85,
    bullets: ['Cold-pressed extra virgin olive oil', 'Peppery finish for dressings and cooking', 'Dark glass bottle protects flavour'],
    specs: { Volume: '1 L', Type: 'Extra virgin', Press: 'Cold', Acidity: '0.3%' },
  }),
  makeProduct({
    title: 'Mirembe Roasted Cashews 400g', brand: 'Mirembe', category: 'groceries',
    price: 11.99, listPrice: 15.99, rating: 4.7, reviewCount: 660, stock: 100,
    bullets: ['Dry-roasted with a touch of sea salt', 'No oil or preservatives', 'Resealable pouch'],
    specs: { Weight: '400 g', Roast: 'Dry', Salt: 'Light', Pack: 'Resealable' },
  }),
  makeProduct({
    title: 'Kigali Roasters Ground Coffee 1kg', brand: 'Kigali Roasters', category: 'groceries',
    price: 24.99, listPrice: 32.99, rating: 4.7, reviewCount: 890, stock: 70,
    bullets: ['Consistent grind for filter and French press', 'Blend of Rwandan and Ugandan Arabica', 'One kilo bag, roasted to order'],
    specs: { Weight: '1 kg', Blend: 'RW/UG Arabica', Grind: 'Medium', Roast: 'Medium-dark' },
    isBestSeller: true,
  }),
  makeProduct({
    title: 'Mirembe Dark Chocolate 70% 6-pack', brand: 'Mirembe', category: 'groceries',
    price: 14.99, listPrice: 19.99, rating: 4.6, reviewCount: 430, stock: 75,
    bullets: ['Single-origin cocoa with a clean snap', 'Six individually wrapped bars', 'No palm oil or artificial flavour'],
    specs: { Bars: '6 x 50 g', Cocoa: '70%', Origin: 'Uganda', Vegan: 'Yes' },
  }),
  makeProduct({
    title: 'Sana Basmati Rice 5kg', brand: 'Sana', category: 'groceries',
    price: 21.99, listPrice: 27.99, rating: 4.5, reviewCount: 1120, stock: 65,
    bullets: ['Long-grain aged basmati', 'Fluffs up without clumping', 'Resealable 5 kg bag'],
    specs: { Weight: '5 kg', Grain: 'Basmati', Age: '12 months', Pack: 'Resealable' },
  }),
  makeProduct({
    title: 'Mirembe Dried Mango Slices 300g', brand: 'Mirembe', category: 'groceries',
    price: 9.99, listPrice: 13.99, rating: 4.6, reviewCount: 380, stock: 130,
    bullets: ['Sun-dried mango with no added sugar', 'Soft, chewy slices', 'Great for lunchboxes and hikes'],
    specs: { Weight: '300 g', Sugar: 'None added', Origin: 'Rwanda', Preservatives: 'No' },
  }),
  makeProduct({
    title: 'Sana Organic Peanut Butter 1kg', brand: 'Sana', category: 'groceries',
    price: 10.99, listPrice: 14.99, rating: 4.7, reviewCount: 920, stock: 110,
    bullets: ['One ingredient: roasted organic peanuts', 'Crunchy texture with no palm oil', 'Stir and enjoy; no added sugar'],
    specs: { Weight: '1 kg', Ingredients: 'Peanuts', Texture: 'Crunchy', Organic: 'Yes' },
  }),
  makeProduct({
    title: 'Kigali Roasters Chai Spice Blend', brand: 'Kigali Roasters', category: 'groceries',
    price: 7.99, listPrice: 10.99, rating: 4.4, reviewCount: 260, stock: 140,
    bullets: ['Cardamom, cinnamon, ginger and clove', 'Freshly ground in small batches', 'Makes a rich cup with milk or water'],
    specs: { Weight: '100 g', Blend: '5 spices', Origin: 'Rwanda', Grind: 'Fine' },
  }),
];
