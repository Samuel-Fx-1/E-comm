/** Shared parser for hand-written catalog additions.
 *
 * Each line uses pipe-separated fields:
 * slug | name | brand | subcategory | price | listPrice | rating | reviews | stock
 * | description | bullet1 | bullet2 | bullet3 | spec1 | spec2 | spec3 | spec4
 * | variants | flags | query1;query2;query3;query4
 *
 * Variants use `type=value1/value2;type=value1/value2`. Flags are letters:
 * B best seller, D deal, T trending, G Gen Z pick, V viral.
 */
export function parse(lines, category, addedAt = '2026-11-27') {
  const flagMap = {
    B: 'isBestSeller',
    D: 'isDeal',
    T: 'isTrending',
    G: 'isGenZPick',
    V: 'isViral',
  };
  return lines.map((line) => {
    const f = line.split('|').map((value) => value.trim());
    if (f.length !== 20) throw new Error(`Expected 20 fields for ${f[0] || 'product'}, got ${f.length}`);
    const flags = { isBestSeller: false, isDeal: false, isTrending: false, isGenZPick: false, isViral: false };
    for (const letter of f[18]) {
      const key = flagMap[letter];
      if (!key) throw new Error(`Unknown flag ${letter} for ${f[0]}`);
      flags[key] = true;
    }
    const variants = f[17]
      ? f[17].split(';').map((entry) => {
        const [type, values] = entry.split('=');
        return values.split('/').map((value) => ({ type, name: type === 'color' ? 'Color' : 'Size', value }));
      }).flat()
      : [];
    return {
      slug: f[0],
      name: f[1],
      brand: f[2],
      category,
      subcategory: f[3],
      price: Number(f[4]),
      listPrice: Number(f[5]),
      rating: Number(f[6]),
      reviewCount: Number(f[7]),
      stock: Number(f[8]),
      shortDescription: f[9],
      bullets: [f[10], f[11], f[12]],
      specs: Object.fromEntries(f.slice(13, 17).map((spec) => {
        const index = spec.indexOf(':');
        return [spec.slice(0, index).trim(), spec.slice(index + 1).trim()];
      })),
      variants,
      seller: 'Soko Marketplace',
      deliveryDays: 3,
      addedAt,
      flags,
      imageQueries: f[19].split(';').map((query) => query.trim()),
      images: [],
    };
  });
}
