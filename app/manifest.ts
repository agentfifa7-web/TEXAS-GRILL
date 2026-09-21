import type { MetadataRoute } from 'next'
import { BRAND } from '@/lib/constants'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} — The Grill Experience`,
    short_name: BRAND.name,
    description: "Le goût du vrai grill, avec l'énergie d'Abidjan. Commandez, réservez, savourez.",
    start_url: '/',
    display: 'standalone',
    background_color: '#f7f1e4',
    theme_color: '#e5283a',
    orientation: 'portrait',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
      { src: '/icon-maskable.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
      { src: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    categories: ['food', 'lifestyle', 'shopping'],
    lang: 'fr',
  }
}
