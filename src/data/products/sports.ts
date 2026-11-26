import { makeProduct } from '../productFactory';

export const sports = [
  makeProduct({
    title: 'Rift Yoga Mat 6mm', brand: 'Rift', category: 'sports',
    price: 29.99, listPrice: 39.99, rating: 4.6, reviewCount: 1420, stock: 80,
    bullets: ['Cushioned 6 mm TPE with a grippy top', 'Alignment lines for consistent poses', 'Carry strap included'],
    specs: { Size: '183 x 61 cm', Thickness: '6 mm', Material: 'TPE', Weight: '0.9 kg' },
  }),
  makeProduct({
    title: 'Rift Adjustable Dumbbell 24kg', brand: 'Rift', category: 'sports',
    price: 149.99, listPrice: 199.99, rating: 4.7, reviewCount: 620, stock: 16,
    bullets: ['Swap from 2.5 to 24 kg in seconds', 'Replaces 15 pairs of fixed weights', 'Compact tray keeps plates tidy'],
    specs: { Range: '2.5-24 kg', Increment: '2.5 kg', Pieces: '1 dumbbell', Warranty: '2 years' },
    isDeal: true,
  }),
  makeProduct({
    title: 'Atlas Trail Running Shoes', brand: 'Atlas', category: 'sports',
    price: 89.99, listPrice: 119.99, rating: 4.5, reviewCount: 780, stock: 39,
    bullets: ['Aggressive lugs for loose terrain', 'Rock plate protects the forefoot', 'Breathable mesh with a gusseted tongue'],
    specs: { Drop: '6 mm', Weight: '285 g', Terrain: 'Trail', Sizes: 'EU 39-47' },
    isBestSeller: true,
  }),
  makeProduct({
    title: 'Rift Resistance Band Set', brand: 'Rift', category: 'sports',
    price: 19.99, listPrice: 29.99, rating: 4.4, reviewCount: 1980, stock: 150,
    bullets: ['Five resistance levels from light to extra heavy', 'Door anchor, handles and ankle straps', 'Cotton-blend bands that will not roll'],
    specs: { Pieces: '5 bands + 4 accessories', Resistance: '5-40 kg', Material: 'Cotton/latex', Bag: 'Included' },
  }),
  makeProduct({
    title: 'Atlas 2-Person Camping Tent', brand: 'Atlas', category: 'sports',
    price: 119.99, listPrice: 159.99, rating: 4.6, reviewCount: 340, stock: 23,
    bullets: ['Freestanding two-person dome with two doors', 'Waterproof 3000 mm fly and taped seams', 'Packs to 3.4 kg with poles and pegs'],
    specs: { Capacity: '2 people', Waterproof: '3000 mm', Weight: '3.4 kg', Season: '3-season' },
    isDeal: true,
  }),
  makeProduct({
    title: 'Rift Insulated Water Bottle 1L', brand: 'Rift', category: 'sports',
    price: 24.99, listPrice: 32.99, rating: 4.8, reviewCount: 2240, stock: 180,
    bullets: ['Keeps drinks cold for 24 hours, hot for 12', 'Leakproof lid with a carry loop', 'Fits standard cup holders'],
    specs: { Capacity: '1 L', Material: '18/8 steel', Insulation: 'Double wall', Care: 'Hand wash' },
    isBestSeller: true,
  }),
  makeProduct({
    title: 'Atlas Cycling Helmet', brand: 'Atlas', category: 'sports',
    price: 54.99, listPrice: 74.99, rating: 4.4, reviewCount: 290, stock: 34,
    bullets: ['In-mould shell with 18 vents', 'Dial fit system and reflective rear light', 'Removable visor and washable pads'],
    specs: { Weight: '260 g', Vents: '18', Fit: '54-61 cm', Standard: 'CE EN 1078' },
  }),
  makeProduct({
    title: 'Rift Foam Roller', brand: 'Rift', category: 'sports',
    price: 21.99, listPrice: 29.99, rating: 4.5, reviewCount: 860, stock: 95,
    bullets: ['Firm EVA foam for muscle release', 'Textured surface targets knots', 'Hollow core keeps it light'],
    specs: { Length: '45 cm', Diameter: '14 cm', Material: 'EVA', Weight: '0.6 kg' },
  }),
  makeProduct({
    title: 'Atlas Hiking Backpack 40L', brand: 'Atlas', category: 'sports',
    price: 79.99, listPrice: 109.99, rating: 4.6, reviewCount: 410, stock: 26,
    bullets: ['Ventilated back panel and adjustable harness', 'Rain cover tucked into the base', 'Hip-belt pockets and a hydration sleeve'],
    specs: { Capacity: '40 L', Weight: '1.3 kg', Material: 'Ripstop nylon', 'Rain cover': 'Included' },
  }),
  makeProduct({
    title: 'Rift Jump Rope Pro', brand: 'Rift', category: 'sports',
    price: 14.99, listPrice: 19.99, rating: 4.4, reviewCount: 1320, stock: 200,
    bullets: ['Speed bearings for smooth double-unders', 'Adjustable cable with spare wire', 'Cushioned handles with a secure grip'],
    specs: { Length: '3 m adjustable', Handles: 'Aluminium', Bearings: 'Ball', Cable: '2 spares' },
  }),
];
