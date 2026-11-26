import { makeProduct } from '../productFactory';

/**
 * The complete curated catalogue: 20 Gen Z / Gen Alpha products.
 * Every entry uses the standard makeProduct() schema and the five group slugs
 * from CategorySlug. Merchandising group labels are stored in `subcategory`.
 */
export const curatedProducts = [
  // Tech & Gaming
  makeProduct({
    title: 'Wireless Noise-Canceling Over-Ear Headphones', brand: 'Auralis', category: 'tech-gaming',
    subcategory: 'Tech & Gaming',
    price: 89.99, listPrice: 119.99, rating: 4.8, reviewCount: 8420, stock: 64,
    shortDescription: 'Immersive over-ear sound with adaptive noise cancellation, plush ear cups and a 40-hour battery.',
    bullets: [
      'Adaptive noise cancellation quietens commutes and busy shared spaces',
      '40 hours of playback with a quick charge that adds 5 hours in 10 minutes',
      'Memory-foam cushions and a foldable frame make travel easy',
    ],
    specs: { Driver: '40 mm dynamic', Battery: '40 h', Connectivity: 'Bluetooth 5.4', Weight: '248 g' },
    variants: [
      { type: 'color', name: 'Colour', value: 'Midnight Black' },
      { type: 'color', name: 'Colour', value: 'Warm Sand' },
    ],
    isBestSeller: true, isGenZPick: true, isDeal: true, addedAt: '2026-11-24',
  }),
  makeProduct({
    title: 'Low-Latency Gaming Wireless Earbuds', brand: 'Voltix', category: 'tech-gaming',
    subcategory: 'Tech & Gaming',
    price: 39.99, listPrice: 49.99, rating: 4.6, reviewCount: 3180, stock: 112,
    shortDescription: 'Low-latency earbuds with a snug sport fit, punchy bass and a pocketable charging case.',
    bullets: [
      'Game mode keeps audio and on-screen action in sync',
      'Three tip sizes help you find a secure, comfortable seal',
      'The compact case adds up to 24 hours of total listening time',
    ],
    specs: { Driver: '10 mm dynamic', Battery: '6 h + 18 h case', Latency: '45 ms', Connectivity: 'Bluetooth 5.4' },
    variants: [
      { type: 'color', name: 'Colour', value: 'Black' },
      { type: 'color', name: 'Colour', value: 'White' },
    ],
    isDeal: true, addedAt: '2026-11-22',
  }),
  makeProduct({
    title: 'Compact Mechanical Hall-Effect Keyboard', brand: 'Nordika', category: 'tech-gaming',
    subcategory: 'Tech & Gaming',
    price: 89.99, listPrice: 109.99, rating: 4.7, reviewCount: 1260, stock: 38,
    shortDescription: 'A compact hall-effect keyboard with adjustable actuation, hot-swap switches and a clean low profile.',
    bullets: [
      'Hall-effect switches let you tune how far each key travels',
      'Hot-swappable keycaps make it easy to refresh the look',
      'A 75% layout leaves room for your mouse without losing the number row',
    ],
    specs: { Layout: '75% / 82 keys', Switches: 'Hall-effect', Actuation: 'Adjustable', Connectivity: 'USB-C' },
    variants: [
      { type: 'color', name: 'Colour', value: 'Graphite' },
      { type: 'color', name: 'Colour', value: 'Ivory' },
    ],
    isGenZPick: true, isDeal: true, addedAt: '2026-11-21',
  }),
  makeProduct({
    title: 'RGB Smart LED Room Strip Lights', brand: 'Lumo', category: 'tech-gaming',
    subcategory: 'Tech & Gaming',
    price: 24.99, listPrice: 34.99, rating: 4.5, reviewCount: 5210, stock: 145,
    shortDescription: 'Smart RGB strip lights with app control, music sync and peel-and-stick backing for any room.',
    bullets: [
      'Sixteen million colours and scene presets set the mood instantly',
      'Music mode makes the lights react to your playlist',
      'Peel-and-stick backing installs in minutes without tools',
    ],
    specs: { Length: '5 m', Colours: '16 million', Control: 'App + remote', Power: 'USB 5 V' },
    variants: [
      { type: 'color', name: 'Length', value: '5 m' },
      { type: 'color', name: 'Length', value: '10 m' },
    ],
    isDeal: true, addedAt: '2026-11-19',
  }),
  makeProduct({
    title: 'Wireless Charging Desk Mat', brand: 'Lumo', category: 'tech-gaming',
    subcategory: 'Tech & Gaming',
    price: 36.99, listPrice: 44.99, rating: 4.4, reviewCount: 860, stock: 72,
    shortDescription: 'A stitched desk mat with a built-in 15W wireless charging pad and a smooth, tidy work surface.',
    bullets: [
      'A stitched, water-resistant surface protects a full desk setup',
      'The built-in 15W pad charges a phone while you work',
      'A non-slip rubber base keeps everything in place',
    ],
    specs: { Size: '900 × 400 mm', Charging: '15 W Qi', Material: 'PU leather', Base: 'Non-slip rubber' },
    variants: [
      { type: 'color', name: 'Colour', value: 'Slate' },
      { type: 'color', name: 'Colour', value: 'Beige' },
    ],
    isDeal: true, addedAt: '2026-11-17',
  }),

  // Streetwear & Footwear
  makeProduct({
    title: 'Heavyweight Oversized Graphic T-Shirt', brand: 'Kanso', category: 'streetwear-footwear',
    subcategory: 'Streetwear & Footwear',
    price: 29.99, listPrice: 39.99, rating: 4.7, reviewCount: 6740, stock: 180,
    shortDescription: 'A heavyweight oversized tee with a boxy cut and soft-washed graphic that keeps its shape.',
    bullets: [
      '240gsm cotton feels substantial without feeling stiff',
      'Drop shoulders and a boxy cut layer easily over fits',
      'The washed graphic stays soft after every wash',
    ],
    specs: { Fabric: '100% combed cotton', Weight: '240 gsm', Fit: 'Oversized unisex', Care: 'Machine wash cold' },
    variants: [
      { type: 'size', name: 'Size', value: 'S' },
      { type: 'size', name: 'Size', value: 'M' },
      { type: 'size', name: 'Size', value: 'L' },
      { type: 'size', name: 'Size', value: 'XL' },
      { type: 'color', name: 'Colour', value: 'Ink Black' },
      { type: 'color', name: 'Colour', value: 'Ivory' },
    ],
    isBestSeller: true, isDeal: true, addedAt: '2026-11-23',
  }),
  makeProduct({
    title: 'Baggy Barrel-Fit Cargo Jeans', brand: 'Rift', category: 'streetwear-footwear',
    subcategory: 'Streetwear & Footwear',
    price: 49.99, rating: 4.5, reviewCount: 2140, stock: 96,
    shortDescription: 'Baggy barrel-fit cargo jeans with roomy pockets and a relaxed waistband for everyday street fits.',
    bullets: [
      'A curved barrel leg gives classic denim a modern silhouette',
      'Six roomy pockets carry the essentials without a bag',
      'Washed denim breaks in naturally with wear',
    ],
    specs: { Fabric: '100% cotton denim', Fit: 'Baggy barrel', Rise: 'Mid rise', Care: 'Machine wash cold' },
    variants: [
      { type: 'size', name: 'Waist', value: '28' },
      { type: 'size', name: 'Waist', value: '30' },
      { type: 'size', name: 'Waist', value: '32' },
      { type: 'size', name: 'Waist', value: '34' },
      { type: 'color', name: 'Colour', value: 'Washed Blue' },
      { type: 'color', name: 'Colour', value: 'Black' },
    ],
    addedAt: '2026-11-20',
  }),
  makeProduct({
    title: 'High-Waisted Fold-Over Athleisure Leggings', brand: 'Kanso', category: 'streetwear-footwear',
    subcategory: 'Streetwear & Footwear',
    price: 29.99, listPrice: 39.99, rating: 4.6, reviewCount: 3890, stock: 132,
    shortDescription: 'High-waisted fold-over leggings with squat-friendly stretch and a soft brushed finish.',
    bullets: [
      'The fold-over waistband stays put through workouts and errands',
      'Four-way stretch moves with you and recovers its shape',
      'A brushed finish feels soft against the skin',
    ],
    specs: { Fabric: 'Nylon / elastane', Rise: 'High rise', Length: 'Full length', Care: 'Machine wash cold' },
    variants: [
      { type: 'size', name: 'Size', value: 'S' },
      { type: 'size', name: 'Size', value: 'M' },
      { type: 'size', name: 'Size', value: 'L' },
      { type: 'color', name: 'Colour', value: 'Black' },
      { type: 'color', name: 'Colour', value: 'Mauve' },
    ],
    isDeal: true, addedAt: '2026-11-18',
  }),
  makeProduct({
    title: 'Retro Low-Top Chunky Sneakers', brand: 'Atlas', category: 'streetwear-footwear',
    subcategory: 'Streetwear & Footwear',
    price: 69.99, listPrice: 89.99, rating: 4.8, reviewCount: 9120, stock: 58,
    shortDescription: 'Retro low-top chunky sneakers with a cushioned sole and contrast panels that lift everyday fits.',
    bullets: [
      'A chunky foam sole adds height without extra weight',
      'Contrast panels bring a retro sporty look to any outfit',
      'A grippy rubber outsole holds up to daily city miles',
    ],
    specs: { Upper: 'Synthetic leather / mesh', Sole: 'Rubber', Fit: 'True to size', Care: 'Spot clean' },
    variants: [
      { type: 'size', name: 'Size', value: '38' },
      { type: 'size', name: 'Size', value: '40' },
      { type: 'size', name: 'Size', value: '42' },
      { type: 'size', name: 'Size', value: '44' },
      { type: 'color', name: 'Colour', value: 'Cream' },
      { type: 'color', name: 'Colour', value: 'Black' },
    ],
    isTrending: true, isGenZPick: true, isDeal: true, addedAt: '2026-11-16',
  }),

  // Viral Skincare & Haircare
  makeProduct({
    title: 'Hydrocolloid Star Pimple Patches (36 Count)', brand: 'Sana', category: 'viral-skincare-haircare',
    subcategory: 'Viral Skincare & Haircare',
    price: 8.99, listPrice: 11.99, rating: 4.7, reviewCount: 7820, stock: 210,
    shortDescription: 'Hydrocolloid star patches in a 36-count pack that cushion and cover blemishes overnight.',
    bullets: [
      'Thirty-six star-shaped patches in two playful sizes',
      'Hydrocolloid material cushions skin while you sleep',
      'A slim, peel-and-stick sheet fits easily in a bag',
    ],
    specs: { Count: '36 patches', Material: 'Hydrocolloid', Sizes: '2 sizes', Use: 'Overnight' },
    isViral: true, isDeal: true, addedAt: '2026-11-25',
  }),
  makeProduct({
    title: 'Niacinamide Brightening & Hydrating Body Lotion', brand: 'Sana', category: 'viral-skincare-haircare',
    subcategory: 'Viral Skincare & Haircare',
    price: 16.99, listPrice: 22.99, rating: 4.6, reviewCount: 5430, stock: 158,
    shortDescription: 'A fast-absorbing niacinamide lotion that leaves skin soft, hydrated and comfortably bright-looking.',
    bullets: [
      'Niacinamide supports a more even-looking skin tone',
      'A lightweight, non-greasy texture absorbs in seconds',
      'Fragrance-free and made for daily use',
    ],
    specs: { Volume: '400 ml', 'Key ingredient': 'Niacinamide', 'Skin type': 'All skin types', pH: '5.5' },
    isBestSeller: true, isDeal: true, addedAt: '2026-11-22',
  }),
  makeProduct({
    title: 'Collagen Hydrogel Under-Eye Patches', brand: 'Sana', category: 'viral-skincare-haircare',
    subcategory: 'Viral Skincare & Haircare',
    price: 13.99, listPrice: 17.99, rating: 4.5, reviewCount: 4260, stock: 104,
    shortDescription: 'Cooling hydrogel patches that hydrate the under-eye area and help you look rested after a late night.',
    bullets: [
      'Hydrogel patches stay in place while you move',
      'A cooling, hydrating boost for tired-looking eyes',
      'Thirty pairs in a resealable, travel-friendly jar',
    ],
    specs: { Count: '30 pairs', Material: 'Hydrogel', Use: '20 minutes', 'Skin type': 'All skin types' },
    isViral: true, isTrending: true, isDeal: true, addedAt: '2026-11-15',
  }),
  makeProduct({
    title: 'Silicone Scalp Massager & Hair Growth Brush', brand: 'Mirembe', category: 'viral-skincare-haircare',
    subcategory: 'Viral Skincare & Haircare',
    price: 8.49, listPrice: 11.99, rating: 4.4, reviewCount: 1980, stock: 12,
    shortDescription: 'A soft silicone scalp brush with flexible nodes that turn shampoo time into a relaxing ritual.',
    bullets: [
      'Flexible silicone nodes massage as you shampoo',
      'A comfortable grip works on wet or dry hair',
      'Compact enough for a shower caddy or travel bag',
    ],
    specs: { Material: 'Food-grade silicone', Use: 'Wet or dry hair', Care: 'Rinse and air dry', Colour: 'Blush' },
    isDeal: true, addedAt: '2026-11-13',
  }),
  makeProduct({
    title: 'Satin Sleep Bonnet & Scrunchie Set', brand: 'Mirembe', category: 'viral-skincare-haircare',
    subcategory: 'Viral Skincare & Haircare',
    price: 11.99, listPrice: 15.99, rating: 4.6, reviewCount: 3110, stock: 9,
    shortDescription: 'A satin sleep bonnet and matching scrunchies that help reduce friction and keep hairstyles intact.',
    bullets: [
      'A smooth satin lining helps reduce friction overnight',
      'An adjustable band stays comfortable while you sleep',
      'Two matching scrunchies complete the set',
    ],
    specs: { Material: 'Satin', Set: 'Bonnet + 2 scrunchies', Fit: 'Adjustable', Care: 'Hand wash cold' },
    variants: [
      { type: 'color', name: 'Colour', value: 'Blush' },
      { type: 'color', name: 'Colour', value: 'Black' },
    ],
    isGenZPick: true, isDeal: true, addedAt: '2026-11-12',
  }),

  // Lifestyle & Aesthetic Essentials
  makeProduct({
    title: 'Insulated Stainless Steel Flip-Straw Water Bottle (32oz)', brand: 'Lumo', category: 'lifestyle-aesthetic-essentials',
    subcategory: 'Lifestyle & Aesthetic Essentials',
    price: 29.99, listPrice: 38.99, rating: 4.8, reviewCount: 10420, stock: 84,
    shortDescription: 'An insulated flip-straw bottle that keeps drinks cold for hours and fits most cup holders.',
    bullets: [
      'Double-wall insulation keeps drinks cold for up to 24 hours',
      'A flip straw makes sipping quick and easy',
      'The 32oz size fits most cup holders and day bags',
    ],
    specs: { Capacity: '32 oz / 950 ml', Material: 'Stainless steel', Insulation: 'Double wall', Care: 'Hand wash' },
    variants: [
      { type: 'color', name: 'Colour', value: 'Cream' },
      { type: 'color', name: 'Colour', value: 'Black' },
    ],
    isTrending: true, isDeal: true, addedAt: '2026-11-21',
  }),
  makeProduct({
    title: 'Quilted Puffer Makeup & Tech Organizer Bag', brand: 'Nordika', category: 'lifestyle-aesthetic-essentials',
    subcategory: 'Lifestyle & Aesthetic Essentials',
    price: 22.99, rating: 4.5, reviewCount: 2740, stock: 67,
    shortDescription: 'A quilted puffer organizer with padded sections for makeup, tech and everyday essentials.',
    bullets: [
      'Padded compartments keep bottles and cables separated',
      'The quilted shell wipes clean after daily use',
      'A roomy interior still fits in most tote bags',
    ],
    specs: { Material: 'Quilted polyester', Closure: 'Zip', Compartments: '3', Care: 'Wipe clean' },
    variants: [
      { type: 'color', name: 'Colour', value: 'Quilted Black' },
      { type: 'color', name: 'Colour', value: 'Blush' },
    ],
    addedAt: '2026-11-14',
  }),
  makeProduct({
    title: 'Portable USB-C Mini Smoothie Blender', brand: 'Lumo', category: 'lifestyle-aesthetic-essentials',
    subcategory: 'Lifestyle & Aesthetic Essentials',
    price: 27.99, listPrice: 34.99, rating: 4.3, reviewCount: 3670, stock: 74,
    shortDescription: 'A portable USB-C mini blender that whips up smoothies in a travel-friendly 400ml cup.',
    bullets: [
      'A 400ml cup blends and travels in one piece',
      'USB-C recharging keeps it ready for the gym or desk',
      'A quick pulse handles fruit, greens and ice',
    ],
    specs: { Capacity: '400 ml', Charging: 'USB-C', Blades: '4 stainless blades', Battery: '2000 mAh' },
    variants: [
      { type: 'color', name: 'Colour', value: 'Mint' },
      { type: 'color', name: 'Colour', value: 'Black' },
    ],
    isDeal: true, addedAt: '2026-11-11',
  }),

  // Gen Alpha & Kids Corner
  makeProduct({
    title: 'Interactive STEM Robotics Building Kit', brand: 'Soko Studio', category: 'gen-alpha-kids-corner',
    subcategory: 'Gen Alpha & Kids Corner',
    price: 49.99, listPrice: 64.99, rating: 4.7, reviewCount: 1890, stock: 46,
    shortDescription: 'A hands-on robotics kit with snap-together parts and simple coding cards for young builders.',
    bullets: [
      'Snap-together parts make building approachable',
      'Simple coding cards introduce sequences and logic',
      'Ages 8+ with adult supervision for the first build',
    ],
    specs: { Pieces: '240', 'Age range': 'Ages 8+', Power: 'AA batteries', 'Build time': '60-90 min' },
    isGenZPick: true, isDeal: true, addedAt: '2026-11-20',
  }),
  makeProduct({
    title: 'Ergonomic Aesthetic School Backpack with Pins', brand: 'Atlas', category: 'gen-alpha-kids-corner',
    subcategory: 'Gen Alpha & Kids Corner',
    price: 39.99, rating: 4.6, reviewCount: 2280, stock: 88,
    shortDescription: 'An ergonomic school backpack with padded straps, plenty of pockets and pins for personalising your fit.',
    bullets: [
      'Padded straps and a breathable back panel spread the load',
      'A laptop sleeve and three pockets keep school gear sorted',
      'Three cheery pins let kids customise the look',
    ],
    specs: { Capacity: '22 L', Laptop: 'Up to 15 in', Material: 'Recycled polyester', 'Age range': 'Ages 8+' },
    variants: [
      { type: 'color', name: 'Colour', value: 'Navy' },
      { type: 'color', name: 'Colour', value: 'Rose' },
    ],
    addedAt: '2026-11-18',
  }),
  makeProduct({
    title: 'Kids Digital Instant Print Camera', brand: 'Soko Studio', category: 'gen-alpha-kids-corner',
    subcategory: 'Gen Alpha & Kids Corner',
    price: 49.99, rating: 4.4, reviewCount: 1560, stock: 33,
    shortDescription: 'A pocket-friendly instant print camera with a 2-inch screen, fun frames and USB-C recharging.',
    bullets: [
      'Prints a photo seconds after you press the shutter',
      'A 2-inch screen makes framing and replay easy',
      'Fun frames and stickers encourage creative play',
    ],
    specs: { Display: '2 in', Prints: 'Thermal paper', Charging: 'USB-C', 'Age range': 'Ages 8+' },
    variants: [
      { type: 'color', name: 'Colour', value: 'Yellow' },
      { type: 'color', name: 'Colour', value: 'White' },
    ],
    addedAt: '2026-11-10',
  }),
];
