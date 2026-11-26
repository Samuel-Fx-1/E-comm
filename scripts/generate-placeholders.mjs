/**
 * Generates deterministic, dependency-free SVG artwork for every product in
 * src/data/products/*.ts. This is the bundled fallback: no API key or network
 * access is required. Run `npm run images:placeholders` after adding products.
 */
import { readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const productsDir = join(root, 'src', 'data', 'products');
const outputDir = join(root, 'public', 'images', 'products');

const palette = {
  electronics: ['#0C1E36', '#2563EB'],
  'home-kitchen': ['#7C2D12', '#EA580C'],
  fashion: ['#4C1D95', '#DB2777'],
  beauty: ['#831843', '#F472B6'],
  sports: ['#064E3B', '#0D9488'],
  books: ['#1E3A8A', '#6366F1'],
  toys: ['#9A3412', '#F59E0B'],
  groceries: ['#365314', '#65A30D'],
};

const escapeXml = (text) =>
  String(text).replace(/[<>&"']/g, (char) => ({
    '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;',
  })[char]);

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function initials(title) {
  return title
    .split(/\s+/)
    .filter((word) => /[A-Za-z0-9]/.test(word))
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
}

function artwork({ title, category, variant }) {
  const [dark, light] = palette[category] ?? palette.electronics;
  const label = escapeXml(category.replace(/-/g, ' ').toUpperCase());
  const name = escapeXml(title);
  const mark = escapeXml(initials(title));
  const id = `g${variant}`;
  const offset = variant === 1 ? 0 : 130;

  const shapes = variant === 1
    ? `<circle cx="640" cy="180" r="230" fill="${light}" opacity="0.16" />
       <rect x="70" y="520" width="300" height="300" rx="60" fill="${light}" opacity="0.12" transform="rotate(-18 220 670)" />
       <circle cx="250" cy="230" r="72" fill="none" stroke="${light}" stroke-width="3" opacity="0.35" />`
    : `<rect x="430" y="90" width="340" height="340" rx="90" fill="${light}" opacity="0.14" transform="rotate(14 600 260)" />
       <circle cx="160" cy="620" r="240" fill="${light}" opacity="0.13" />
       <path d="M80 200 L520 120" stroke="${light}" stroke-width="3" opacity="0.3" fill="none" />`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800" role="img" aria-label="${name}">
  <defs>
    <linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${dark}" />
      <stop offset="1" stop-color="${light}" />
    </linearGradient>
  </defs>
  <rect width="800" height="800" fill="url(#${id})" />
  ${shapes}
  <g transform="translate(${offset} 0)">
    <circle cx="400" cy="392" r="172" fill="#FFFFFF" opacity="0.92" />
    <text x="400" y="452" text-anchor="middle" font-family="Georgia, serif" font-size="168" font-weight="700" fill="${dark}">${mark}</text>
  </g>
  <rect x="0" y="696" width="800" height="104" fill="#071426" opacity="0.82" />
  <text x="48" y="744" font-family="Arial, sans-serif" font-size="24" font-weight="700" fill="#FFC94A" letter-spacing="4">SOKO · DEMO ART</text>
  <text x="48" y="776" font-family="Arial, sans-serif" font-size="19" fill="#FFFFFF" opacity="0.75">${label} — ${name.length > 44 ? name.slice(0, 43) + '…' : name}</text>
</svg>
`;
}

const products = [];
for (const file of readdirSync(productsDir).filter((name) => name.endsWith('.ts'))) {
  const source = readFileSync(join(productsDir, file), 'utf8');
  for (const match of source.matchAll(/makeProduct\(\{([\s\S]*?)\}\)/g)) {
    const block = match[1];
    const title = block.match(/title:\s*'((?:[^'\\]|\\.)*)'/)?.[1];
    const category = block.match(/category:\s*'([a-z-]+)'/)?.[1];
    if (!title || !category) continue;
    products.push({ slug: slugify(title.replace(/\\'/g, "'")), title, category });
  }
}

mkdirSync(outputDir, { recursive: true });
for (const product of products) {
  for (const variant of [1, 2]) {
    writeFileSync(
      join(outputDir, `${product.slug}-${variant}.svg`),
      artwork({ ...product, variant }),
      'utf8'
    );
  }
}

const unique = new Set(products.map((product) => product.slug));
if (unique.size !== products.length) {
  console.warn(`Warning: ${products.length - unique.size} duplicate slug(s) found.`);
}
console.log(`Generated ${products.length * 2} local SVG images for ${products.length} products.`);
