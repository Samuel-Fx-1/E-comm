import { makeProduct } from '../productFactory';

export const homeKitchen = [
  makeProduct({
    title: 'Kanso Ceramic Pour-Over Set', brand: 'Kanso', category: 'home-kitchen',
    price: 34.99, listPrice: 44.99, rating: 4.7, reviewCount: 892, stock: 38,
    bullets: ['Hand-glazed dripper, carafe and scoop', 'Brews two cups in about four minutes', 'Dishwasher safe and boxed for gifting'],
    specs: { Material: 'Glazed ceramic', Capacity: '600 ml', Pieces: '3', Filter: 'No. 2 cone' },
  }),
  makeProduct({
    title: 'Nordika Cast Iron Skillet 12-inch', brand: 'Nordika', category: 'home-kitchen',
    price: 39.99, listPrice: 59.99, rating: 4.8, reviewCount: 2310, stock: 45,
    bullets: ['Pre-seasoned and ready for the stove or fire', 'Even heat with excellent browning', 'Works on gas, induction, oven and grill'],
    specs: { Size: '12 in', Material: 'Cast iron', Weight: '3.2 kg', 'Oven safe': 'Up to 260 C' },
    isBestSeller: true,
  }),
  makeProduct({
    title: 'Verdant Bamboo Cutting Board Set', brand: 'Verdant', category: 'home-kitchen',
    price: 24.99, listPrice: 34.99, rating: 4.6, reviewCount: 1120, stock: 66,
    bullets: ['Three sizes with juice grooves', 'Dense bamboo resists knife scars', 'Reversible and easy to oil'],
    specs: { Pieces: '3', Material: 'Moso bamboo', Thickness: '1.8 cm', Care: 'Hand wash' },
  }),
  makeProduct({
    title: 'Lumio Smart LED Desk Lamp', brand: 'Lumio', category: 'home-kitchen',
    price: 45.99, listPrice: 64.99, rating: 4.5, reviewCount: 640, stock: 31,
    bullets: ['Tunable white light from warm to daylight', 'Touch dimmer with a 45-minute focus timer', 'USB-C charging port in the base'],
    specs: { Brightness: '800 lm', Temperature: '2700-6500 K', Power: '12 W', Extras: 'USB-C 18 W' },
    isDeal: true,
  }),
  makeProduct({
    title: 'Kanso Stoneware Dinner Set 16-piece', brand: 'Kanso', category: 'home-kitchen',
    price: 79.99, listPrice: 109.99, rating: 4.6, reviewCount: 415, stock: 22,
    bullets: ['Service for four with a matte speckle glaze', 'Reactive finish means every piece is unique', 'Microwave, oven and dishwasher safe'],
    specs: { Pieces: '16', Material: 'Stoneware', Serves: '4', Care: 'Dishwasher safe' },
  }),
  makeProduct({
    title: 'Nordika Air Fryer 5.5L', brand: 'Nordika', category: 'home-kitchen',
    price: 89.99, listPrice: 129.99, rating: 4.7, reviewCount: 3480, stock: 37,
    bullets: ['Crisp with up to 85% less oil', 'Eight presets and a shake reminder', 'Dishwasher-safe basket and crisper plate'],
    specs: { Capacity: '5.5 L', Power: '1700 W', Presets: '8', Temperature: '80-200 C' },
    isBestSeller: true, isDeal: true,
  }),
  makeProduct({
    title: 'Verdant Cotton Bath Towel Set', brand: 'Verdant', category: 'home-kitchen',
    price: 29.99, listPrice: 44.99, rating: 4.4, reviewCount: 980, stock: 90,
    bullets: ['Four-piece set in a soft waffle weave', 'Quick-drying long-staple cotton', 'Hanging loops and reinforced edges'],
    specs: { Pieces: '4', Material: '100% cotton', GSM: '550', Care: 'Machine wash' },
  }),
  makeProduct({
    title: 'Kanso French Press 1L', brand: 'Kanso', category: 'home-kitchen',
    price: 27.99, listPrice: 39.99, rating: 4.7, reviewCount: 1360, stock: 58,
    bullets: ['Double-wall steel keeps coffee hot longer', 'Four-level filtration for a clean cup', 'Makes eight cups at once'],
    specs: { Capacity: '1 L', Material: 'Stainless steel', Filter: '4-level', Care: 'Dishwasher safe' },
  }),
  makeProduct({
    title: 'Lumio Cordless Vacuum V8', brand: 'Lumio', category: 'home-kitchen',
    price: 159.99, listPrice: 219.99, rating: 4.3, reviewCount: 720, stock: 19,
    bullets: ['45 minutes of run time on eco mode', 'Converts to a handheld for stairs and cars', 'HEPA filtration traps fine dust'],
    specs: { 'Run time': '45 min', Power: '350 W', Bin: '0.6 L', Weight: '2.6 kg' },
    isDeal: true,
  }),
  makeProduct({
    title: 'Nordika Nonstick Cookware 10-piece', brand: 'Nordika', category: 'home-kitchen',
    price: 99.99, listPrice: 149.99, rating: 4.5, reviewCount: 1180, stock: 24,
    bullets: ['PFOA-free ceramic coating', 'Induction-ready bases with stay-cool handles', 'Tempered glass lids with steam vents'],
    specs: { Pieces: '10', Coating: 'Ceramic', Base: 'Induction', 'Oven safe': 'Up to 220 C' },
  }),
  makeProduct({
    title: 'Verdant Linen Throw Blanket', brand: 'Verdant', category: 'home-kitchen',
    price: 49.99, listPrice: 69.99, rating: 4.6, reviewCount: 355, stock: 41,
    bullets: ['Stonewashed linen-cotton blend', 'Breathable in warm rooms, cosy in cool ones', 'Fringed edges and a cotton storage bag'],
    specs: { Size: '130 x 170 cm', Material: 'Linen/cotton', Weight: '1.1 kg', Care: 'Machine wash cold' },
  }),
];
