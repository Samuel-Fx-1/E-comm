import { makeProduct } from '../productFactory';

export const toys = [
  makeProduct({
    title: 'Rift Build-It Blocks 500-piece', brand: 'Rift', category: 'toys',
    price: 34.99, listPrice: 49.99, rating: 4.7, reviewCount: 1560, stock: 48,
    bullets: ['500 compatible bricks in 12 colours', 'Step-by-step ideas booklet included', 'Storage tub with a carry handle'],
    specs: { Pieces: '500', Age: '5+', Material: 'ABS', Storage: 'Tub' },
    isBestSeller: true,
  }),
  makeProduct({
    title: 'Kanso Wooden Puzzle Map', brand: 'Kanso', category: 'toys',
    price: 24.99, listPrice: 34.99, rating: 4.6, reviewCount: 420, stock: 36,
    bullets: ['Laser-cut wooden map of East Africa', 'Chunky pieces sized for small hands', 'Non-toxic water-based paint'],
    specs: { Pieces: '38', Age: '3+', Material: 'Birch ply', Size: '40 x 30 cm' },
  }),
  makeProduct({
    title: 'Rift Remote Control Rover', brand: 'Rift', category: 'toys',
    price: 39.99, listPrice: 54.99, rating: 4.4, reviewCount: 890, stock: 30,
    bullets: ['2.4 GHz remote with a 30 m range', 'All-terrain rubber tyres', 'Rechargeable battery included'],
    specs: { Scale: '1:16', Range: '30 m', Battery: '4.8 V 700 mAh', Age: '6+' },
    isDeal: true,
  }),
  makeProduct({
    title: 'Lumio Glow Star Projector', brand: 'Lumio', category: 'toys',
    price: 27.99, listPrice: 39.99, rating: 4.5, reviewCount: 1340, stock: 62,
    bullets: ['Projects stars and nebula clouds', 'Eight colour modes with a timer', 'USB-powered with a quiet motor'],
    specs: { Modes: '8', Timer: '15/30/60 min', Power: 'USB', Age: '3+' },
  }),
  makeProduct({
    title: 'Kanso Plush Elephant', brand: 'Kanso', category: 'toys',
    price: 19.99, listPrice: 27.99, rating: 4.8, reviewCount: 760, stock: 74,
    bullets: ['Super-soft recycled plush', 'Embroidered eyes, no small parts', 'Machine washable at 30 C'],
    specs: { Height: '32 cm', Material: 'Recycled polyester', Age: '0+', Care: 'Machine wash' },
  }),
  makeProduct({
    title: 'Rift Magnetic Tile Set 64-piece', brand: 'Rift', category: 'toys',
    price: 44.99, listPrice: 59.99, rating: 4.7, reviewCount: 1120, stock: 40,
    bullets: ['64 magnetic tiles in five shapes', 'Strong magnets with rounded edges', 'Builds flat patterns or 3D towers'],
    specs: { Pieces: '64', Age: '3+', Material: 'ABS + magnet', Shapes: '5' },
    isBestSeller: true,
  }),
  makeProduct({
    title: 'Kanso Kids Art Easel', brand: 'Kanso', category: 'toys',
    price: 49.99, listPrice: 69.99, rating: 4.5, reviewCount: 310, stock: 18,
    bullets: ['Double-sided board with a paper roll', 'Adjustable height for growing artists', 'Folds flat for storage'],
    specs: { Height: '95-125 cm', Sides: '2', 'Paper roll': 'Included', Age: '3+' },
  }),
  makeProduct({
    title: 'Rift STEM Robot Kit', brand: 'Rift', category: 'toys',
    price: 59.99, listPrice: 79.99, rating: 4.6, reviewCount: 540, stock: 22,
    bullets: ['Build and code six moving robots', 'Drag-and-drop app plus block coding', 'Rechargeable and modular'],
    specs: { Robots: '6', Age: '8+', Battery: 'Li-ion', App: 'iOS/Android' },
    isDeal: true,
  }),
  makeProduct({
    title: 'Kanso Wooden Train Set', brand: 'Kanso', category: 'toys',
    price: 39.99, listPrice: 54.99, rating: 4.6, reviewCount: 480, stock: 27,
    bullets: ['32-piece wooden track with a bridge', 'Magnetic train cars and signs', 'Compatible with major wooden rails'],
    specs: { Pieces: '32', Age: '3+', Material: 'Beech wood', Track: 'Compatible' },
  }),
  makeProduct({
    title: 'Rift Outdoor Bubble Machine', brand: 'Rift', category: 'toys',
    price: 22.99, listPrice: 32.99, rating: 4.3, reviewCount: 620, stock: 58,
    bullets: ['Thousands of bubbles per minute', 'Rechargeable with a 45-minute run', 'Includes two bubble solutions'],
    specs: { Output: '5000/min', Battery: '45 min', Age: '3+', Liquid: '2 bottles' },
  }),
];
