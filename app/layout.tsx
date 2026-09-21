import type { Metadata, Viewport } from 'next'
import { Bebas_Neue, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCartSummaryReadOnly } from '@/lib/actions/cart'
import { getSiteUrl } from '@/lib/constants'
import { Providers } from '@/components/providers/providers'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import { CartDrawer } from '@/components/layout/cart-drawer'
import { FloatingOrderButton } from '@/components/layout/floating-order-button'
import { AskTexasWidget } from '@/components/shared/ask-texas-widget'
import { PwaInstall } from '@/components/shared/pwa-install'
import './globals.css'

const bebas = Bebas_Neue({ subsets: ['latin'], weight: '400', variable: '--font-display', display: 'swap' })
const inter = Inter({ subsets: ['latin'], variable: '--font-sans', display: 'swap' })

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: { default: 'Texas Grill — The Grill Experience', template: '%s | Texas Grill' },
  description: "Le goût du vrai grill, avec l'énergie d'Abidjan. Commandez en ligne, réservez une table ou faites-vous livrer vos grillades, burgers et ribs Texas Grill.",
  keywords: ['Texas Grill', 'restaurant Abidjan', 'grillades', 'burger Abidjan', 'livraison', 'barbecue', 'steak house'],
  openGraph: {
    title: 'Texas Grill — The Grill Experience',
    description: "Le goût du vrai grill, avec l'énergie d'Abidjan.",
    siteName: 'Texas Grill',
    locale: 'fr_CI',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Texas Grill', description: "Le goût du vrai grill, avec l'énergie d'Abidjan." },
  manifest: '/manifest.webmanifest',
  icons: { icon: [{ url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' }, { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' }, { url: '/icon.svg', type: 'image/svg+xml' }], apple: '/apple-icon.png' },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#ef4c19',
  width: 'device-width',
  initialScale: 1,
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Restaurant',
  name: 'Texas Grill',
  description: "Le goût du vrai grill, avec l'énergie d'Abidjan.",
  servesCuisine: ['American', 'Barbecue', 'Grill'],
  priceRange: '$$',
  areaServed: { '@type': 'City', name: 'Abidjan' },
  address: { '@type': 'PostalAddress', addressLocality: 'Abidjan', addressCountry: 'CI' },
}

// The root layout runs on every single request. A misconfiguration in
// either of these (e.g. an auth provider env var issue, a transient DB
// connection hiccup) must never take the *entire* site down with it — so
// each is isolated and falls back to a safe default, with the real error
// logged clearly for Vercel's Runtime Logs instead of surfacing as an
// unhandled exception that trips the global error boundary on every route.
async function getSessionSafely() {
  try {
    return await getServerSession(authOptions)
  } catch (error) {
    console.error('[texas-grill] getServerSession failed — continuing as signed out:', error)
    return null
  }
}

async function getCartSafely() {
  try {
    return await getCartSummaryReadOnly()
  } catch (error) {
    console.error('[texas-grill] getCartSummaryReadOnly failed — continuing with an empty cart:', error)
    return { cart: null, orderType: 'DELIVERY' as const, items: [], subtotal: 0, count: 0 }
  }
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [session, cart] = await Promise.all([getSessionSafely(), getCartSafely()])

  return (
    <html lang="fr" className={`${bebas.variable} ${inter.variable}`}>
      <body className="antialiased">
        {/* eslint-disable-next-line react/no-danger */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <Providers
          session={session}
          initialCart={{
            items: cart.items as never,
            subtotal: cart.subtotal,
            count: cart.count,
            orderType: cart.orderType,
          }}
        >
          <Navbar />
          <main className="min-h-[60vh]">{children}</main>
          <Footer />
          <CartDrawer />
          <FloatingOrderButton />
          <AskTexasWidget />
          <PwaInstall />
        </Providers>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
