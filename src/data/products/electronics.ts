import { makeProduct } from '../productFactory';

export const electronics = [
  makeProduct({
    title: 'Auralis Pulse 5 Wireless Earbuds', brand: 'Auralis', category: 'electronics',
    price: 49.99, listPrice: 79.99, rating: 4.6, reviewCount: 2841, stock: 42,
    bullets: ['Adaptive noise cancelling with a transparency mode', '8 hours per charge, 32 hours with the case', 'IPX5 sweat resistance and wireless charging'],
    specs: { Driver: '10 mm dynamic', Battery: '8 h + 24 h case', Connectivity: 'Bluetooth 5.4', 'Water resistance': 'IPX5' },
    isBestSeller: true, isDeal: true,
  }),
  makeProduct({
    title: 'Voltix 65W GaN Charger', brand: 'Voltix', category: 'electronics',
    price: 29.99, listPrice: 39.99, rating: 4.7, reviewCount: 1932, stock: 87,
    bullets: ['Charges a laptop, tablet and phone at once', 'GaN design is 35% smaller than a standard brick', 'Foldable prongs and travel pouch included'],
    specs: { Output: '65 W total', Ports: '2x USB-C, 1x USB-A', Protocol: 'PD 3.0 / QC 4+', Cable: '1.8 m USB-C included' },
    isBestSeller: true,
  }),
  makeProduct({
    title: 'Lumo 27-inch QHD Monitor', brand: 'Lumo', category: 'electronics',
    price: 249.99, listPrice: 329.99, rating: 4.5, reviewCount: 864, stock: 18,
    bullets: ['2560x1440 IPS panel with slim bezels', '75 Hz refresh with adaptive sync', 'USB-C 65 W and HDMI 2.0 inputs'],
    specs: { Panel: '27 in IPS', Resolution: '2560 x 1440', Refresh: '75 Hz', Ports: 'USB-C, 2x HDMI, DP' },
    isDeal: true,
  }),
  makeProduct({
    title: 'Nordika Mechanical Keyboard K87', brand: 'Nordika', category: 'electronics',
    price: 89.99, listPrice: 119.99, rating: 4.8, reviewCount: 1204, stock: 33,
    bullets: ['Hot-swappable switches with a tactile bump', 'Triple-mode: USB-C, 2.4 GHz and Bluetooth', 'Per-key white backlight and PBT keycaps'],
    specs: { Layout: '87-key TKL', Switches: 'Hot-swap tactile', Battery: '4000 mAh', Connection: 'USB-C / 2.4G / BT' },
  }),
  makeProduct({
    title: 'Auralis Studio Over-Ear Headphones', brand: 'Auralis', category: 'electronics',
    price: 129.99, listPrice: 179.99, rating: 4.7, reviewCount: 3210, stock: 26,
    bullets: ['40 mm drivers tuned for warm, detailed sound', 'Hybrid ANC with 40-hour battery life', 'Memory-foam earcups and folding frame'],
    specs: { Driver: '40 mm', Battery: '40 h ANC on', Weight: '268 g', Codecs: 'AAC, LDAC' },
    isBestSeller: true,
  }),
  makeProduct({
    title: 'Voltix 20,000mAh Power Bank', brand: 'Voltix', category: 'electronics',
    price: 39.99, listPrice: 54.99, rating: 4.4, reviewCount: 4210, stock: 120,
    bullets: ['Charges two devices at full speed', 'Digital display shows exact battery percentage', 'Airline-safe capacity with pass-through charging'],
    specs: { Capacity: '20,000 mAh', Output: '30 W USB-C PD', Ports: '2x USB-C, 1x USB-A', Weight: '365 g' },
  }),
  makeProduct({
    title: 'Kanso Smart Watch S2', brand: 'Kanso', category: 'electronics',
    price: 149.99, listPrice: 199.99, rating: 4.3, reviewCount: 1876, stock: 21,
    bullets: ['1.8 in AMOLED display with always-on mode', 'Heart rate, SpO2 and sleep tracking', '10-day battery and 5 ATM water resistance'],
    specs: { Display: '1.8 in AMOLED', Battery: '10 days', Sensors: 'HR, SpO2, GPS', Water: '5 ATM' },
    isDeal: true,
  }),
  makeProduct({
    title: 'Lumio 1080p Webcam', brand: 'Lumio', category: 'electronics',
    price: 59.99, listPrice: 79.99, rating: 4.2, reviewCount: 733, stock: 54,
    bullets: ['Full HD 1080p at 30 fps with auto light correction', 'Dual noise-reducing microphones', 'Privacy shutter and tripod thread'],
    specs: { Video: '1080p / 30 fps', 'Field of view': '90 degrees', Mic: 'Dual stereo', Mount: 'Clip + tripod' },
  }),
  makeProduct({
    title: 'Rift Bluetooth Speaker Mini', brand: 'Rift', category: 'electronics',
    price: 34.99, listPrice: 49.99, rating: 4.5, reviewCount: 1560, stock: 64,
    bullets: ['Punchy 360-degree sound in a pocketable body', '12-hour playtime and IP67 dust/water rating', 'Pair two speakers for stereo sound'],
    specs: { Output: '12 W', Battery: '12 h', Rating: 'IP67', Pairing: 'BT 5.3 / stereo' },
  }),
  makeProduct({
    title: 'Voltix USB-C Hub 8-in-1', brand: 'Voltix', category: 'electronics',
    price: 44.99, listPrice: 59.99, rating: 4.6, reviewCount: 980, stock: 73,
    bullets: ['Adds HDMI 4K, Ethernet, SD and three USB ports', '100 W pass-through charging for your laptop', 'Aluminium shell with a short braided cable'],
    specs: { Ports: '8', HDMI: '4K 60 Hz', Ethernet: '1 Gbps', Power: '100 W PD' },
  }),
  makeProduct({
    title: 'Auralis Soundbar 2.1', brand: 'Auralis', category: 'electronics',
    price: 119.99, listPrice: 159.99, rating: 4.4, reviewCount: 512, stock: 14,
    bullets: ['2.1 channels with a wireless subwoofer', 'Dialogue mode for clearer movies and news', 'HDMI ARC, optical and Bluetooth inputs'],
    specs: { Channels: '2.1', Power: '120 W', Inputs: 'HDMI ARC, optical, BT', Subwoofer: 'Wireless' },
  }),
];
