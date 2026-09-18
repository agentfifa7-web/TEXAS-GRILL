// Generates on-brand local SVG placeholder artwork for the demo catalog, so
// the platform never depends on hotlinking third-party stock photography.
// Run: node scripts/generate-placeholder-art.mjs
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..', 'public', 'images')

const PALETTES = [
  ['#ef4c19', '#b81f2b'],
  ['#15100c', '#34302c'],
  ['#f0a63f', '#ef4c19'],
  ['#b81f2b', '#15100c'],
  ['#34302c', '#15100c'],
]

const ICONS = {
  flame: `<path d="M100 40c8 26-14 30-14 50a14 14 0 0028 0c0-8-4-12-4-18 14 8 22 24 22 38a32 32 0 01-64 0c0-30 20-36 32-70z" />`,
  burger: `<path d="M46 96h108a10 10 0 010 20H46a10 10 0 010-20z"/><path d="M50 118h100l-6 14a14 14 0 01-13 9H69a14 14 0 01-13-9z"/><path d="M54 90c2-24 24-42 46-42s44 18 46 42z"/><circle cx="76" cy="72" r="3"/><circle cx="100" cy="66" r="3"/><circle cx="124" cy="72" r="3"/>`,
  drumstick: `<path d="M92 40c22 0 46 18 46 46 0 20-14 30-14 30l22 22a12 12 0 01-17 17l-22-22s-10 14-30 14c-28 0-46-24-46-46 0-30 33-61 61-61z"/>`,
  steak: `<ellipse cx="100" cy="100" rx="58" ry="42"/><path d="M58 78l84 44M62 100l76 30M70 122l60 8" stroke="#00000030" stroke-width="4" fill="none"/>`,
  skewer: `<line x1="34" y1="166" x2="166" y2="34" stroke-width="6"/><circle cx="70" cy="130" r="18"/><circle cx="100" cy="100" r="18"/><circle cx="130" cy="70" r="18"/>`,
  corn: `<ellipse cx="100" cy="100" rx="34" ry="60"/><path d="M76 60l48 80M124 60L76 140M84 48l32 104M116 48L84 152" stroke="#00000025" stroke-width="3" fill="none"/>`,
  drink: `<path d="M64 50h72l-10 110a10 10 0 01-10 9H84a10 10 0 01-10-9z"/><rect x="58" y="42" width="84" height="14" rx="7"/>`,
  shrimp: `<path d="M50 130c0-44 36-80 80-80 6 0 10 12 2 16-30 14-46 40-46 64 0 12-8 20-18 20s-18-8-18-20z"/>`,
  fish: `<path d="M40 100c20-30 60-46 96-46 16 0 24 16 24 46s-8 46-24 46c-36 0-76-16-96-46z"/><circle cx="120" cy="88" r="5"/>`,
  storefront: `<path d="M40 90l6-34h108l6 34"/><rect x="46" y="90" width="108" height="70" rx="4"/><rect x="86" y="120" width="28" height="40"/>`,
}

const CATEGORY_ICON = {
  burgers: 'burger', grillades: 'steak', steaks: 'steak', 'ribs-bbq': 'flame', poulet: 'drumstick',
  brochettes: 'skewer', seafood: 'shrimp', accompagnements: 'corn', boissons: 'drink', menus: 'flame', 'family-deals': 'flame',
}

function svg({ icon, colors, label }) {
  const [c1, c2] = colors
  const iconPath = ICONS[icon] ?? ICONS.flame
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}" />
      <stop offset="1" stop-color="${c2}" />
    </linearGradient>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.6" fill="#ffffff22" />
    </pattern>
  </defs>
  <rect width="800" height="600" fill="url(#g)" />
  <rect width="800" height="600" fill="url(#dots)" />
  <g transform="translate(300,200) scale(2)" fill="#ffffff26">${iconPath}</g>
</svg>`
}

// Kept in sync with prisma/seed.ts's productDefs / restaurantDefs slugs.
const products = [
  ['texas-trio-burger', 'The Texas Trio', 'burgers'], ['firehouse-burger', 'Firehouse Burger', 'burgers'],
  ['classic-cheeseburger', 'Classic Cheeseburger', 'burgers'], ['poitrine-fumee', 'Poitrine de Bœuf Fumée', 'grillades'],
  ['mix-grill-texas', 'Mix Grill Texas', 'grillades'], ['ribeye-steak', 'Ribeye Steak', 'steaks'],
  ['t-bone-steak', 'T-Bone Steak', 'steaks'], ['pitmaster-ribs', 'Pitmaster Ribs', 'ribs-bbq'],
  ['baby-back-ribs', 'Baby Back Ribs', 'ribs-bbq'], ['firehouse-half-chicken', 'Firehouse Half Chicken', 'poulet'],
  ['poulet-braise', 'Poulet Braisé', 'poulet'], ['brochettes-boeuf', 'Brochettes de Bœuf', 'brochettes'],
  ['brochettes-mixtes', 'Brochettes Mixtes', 'brochettes'], ['crevettes-grillees', 'Crevettes Grillées', 'seafood'],
  ['charred-street-corn', 'Charred Street Corn', 'accompagnements'], ['frites-maison', 'Frites Maison', 'accompagnements'],
  ['alloco', 'Alloco', 'accompagnements'], ['attieke', 'Attiéké', 'accompagnements'],
  ['jus-bissap', 'Jus de Bissap', 'boissons'], ['jus-gingembre', 'Jus de Gingembre', 'boissons'],
  ['soda', 'Soda', 'boissons'], ['menu-solo-grill', 'Menu Solo Grill', 'menus'],
  ['family-deal-4', 'Family Deal 4', 'family-deals'], ['family-deal-6', 'Family Deal 6', 'family-deals'],
].map(([slug, name, cat]) => ({ slug, name, cat }))

const restaurants = [
  ['riviera', 'Texas Grill Riviera'], ['zone-4', 'Texas Grill Zone 4'], ['yopougon', 'Texas Grill Yopougon'],
  ['deux-plateaux', 'Texas Grill Deux-Plateaux'], ['cocody', 'Texas Grill Cocody'],
].map(([slug, name]) => ({ slug, name }))

mkdirSync(join(ROOT, 'products'), { recursive: true })
mkdirSync(join(ROOT, 'restaurants'), { recursive: true })
mkdirSync(join(ROOT, 'misc'), { recursive: true })

products.forEach((p, i) => {
  const icon = CATEGORY_ICON[p.cat] ?? 'flame'
  const colors = PALETTES[i % PALETTES.length]
  writeFileSync(join(ROOT, 'products', `${p.slug}.svg`), svg({ icon, colors, label: p.name }))
})

restaurants.forEach((r, i) => {
  writeFileSync(join(ROOT, 'restaurants', `${r.slug}.svg`), svg({ icon: 'storefront', colors: PALETTES[(i + 1) % PALETTES.length], label: r.name }))
})

writeFileSync(join(ROOT, 'misc', 'hero.svg'), svg({ icon: 'flame', colors: ['#15100c', '#ef4c19'] }))
writeFileSync(join(ROOT, 'misc', 'story-1.svg'), svg({ icon: 'flame', colors: PALETTES[0] }))
writeFileSync(join(ROOT, 'misc', 'story-2.svg'), svg({ icon: 'skewer', colors: PALETTES[1] }))
writeFileSync(join(ROOT, 'misc', 'story-3.svg'), svg({ icon: 'steak', colors: PALETTES[2] }))
writeFileSync(join(ROOT, 'misc', 'video-1.svg'), svg({ icon: 'storefront', colors: PALETTES[3] }))
writeFileSync(join(ROOT, 'misc', 'video-2.svg'), svg({ icon: 'flame', colors: PALETTES[4] }))

console.log(`Generated ${products.length} product images, ${restaurants.length} restaurant images.`)
