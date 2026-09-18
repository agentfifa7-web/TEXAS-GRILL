import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Calendar, Clock, MapPin, Phone, UtensilsCrossed } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { getRestaurantBySlug, formatHours, isOpenNow } from '@/lib/data/restaurants'
import { RestaurantMap } from '@/components/shared/restaurant-map'
import { RESTAURANT_SERVICE_LABELS } from '@/lib/constants'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const restaurant = await getRestaurantBySlug(slug)
  if (!restaurant) return {}
  return {
    title: restaurant.name,
    description: restaurant.description ?? `${restaurant.name} — ${restaurant.address}. Réservez une table ou commandez en ligne.`,
    openGraph: {
      title: restaurant.name,
      description: restaurant.description ?? restaurant.address,
      images: restaurant.heroImage ? [restaurant.heroImage] : undefined,
    },
  }
}

export default async function RestaurantDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const restaurant = await getRestaurantBySlug(slug)
  if (!restaurant) notFound()

  const open = restaurant.status === 'OPEN' && isOpenNow(restaurant.hours)
  const weeklyHours = formatHours(restaurant.hours)

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: restaurant.name,
    description: restaurant.description ?? undefined,
    image: restaurant.heroImage ?? undefined,
    telephone: restaurant.phone ?? undefined,
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.address,
      addressLocality: restaurant.city,
      addressCountry: 'CI',
    },
    geo:
      restaurant.lat != null && restaurant.lng != null
        ? { '@type': 'GeoCoordinates', latitude: restaurant.lat, longitude: restaurant.lng }
        : undefined,
    openingHoursSpecification: restaurant.hours
      .filter((h) => !h.isClosed)
      .map((h) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: h.dayOfWeek,
        opens: h.openTime,
        closes: h.closeTime,
      })),
    servesCuisine: 'Grill',
    priceRange: 'XOF',
  }

  return (
    <div className="container-grill section-py">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="mb-6">
        <p className="eyebrow">Restaurant</p>
        <h1 className="display-heading text-5xl sm:text-6xl">
          {restaurant.name.replace('Texas Grill ', '')} <span className="text-fire">Grill.</span>
        </h1>
      </div>

      <div className="relative mb-8 h-64 w-full overflow-hidden rounded-xl bg-muted sm:h-96">
        {restaurant.heroImage && (
          <Image src={restaurant.heroImage} alt={restaurant.name} fill sizes="100vw" className="object-cover" priority />
        )}
        <Badge variant={open ? 'success' : 'dark'} className="absolute left-4 top-4">
          {open ? 'Ouvert maintenant' : restaurant.status === 'COMING_SOON' ? 'Bientôt' : 'Fermé'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {restaurant.description && <p className="mb-6 text-sm leading-relaxed text-muted-foreground sm:text-base">{restaurant.description}</p>}

          {restaurant.gallery.length > 1 && (
            <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {restaurant.gallery.map((src, i) => (
                <div key={i} className="relative h-32 overflow-hidden rounded-lg bg-muted sm:h-36">
                  <Image src={src} alt={`${restaurant.name} photo ${i + 1}`} fill sizes="200px" className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="card-grill p-5">
            <h2 className="mb-3 flex items-center gap-2 font-display text-xl uppercase tracking-wide">
              <Clock size={18} className="text-fire" /> Horaires
            </h2>
            <table className="w-full text-sm">
              <tbody>
                {weeklyHours.map((h) => (
                  <tr key={h.day} className="border-b border-border last:border-0">
                    <td className="py-2 font-bold">{h.day}</td>
                    <td className="py-2 text-right text-muted-foreground">{h.label}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8">
            <RestaurantMap
              points={
                restaurant.lat != null && restaurant.lng != null
                  ? [{ label: restaurant.name, lat: restaurant.lat, lng: restaurant.lng }]
                  : []
              }
            />
          </div>
        </div>

        <aside className="space-y-5">
          <div className="card-grill p-5">
            <p className="flex items-start gap-2 text-sm">
              <MapPin size={16} className="mt-0.5 shrink-0 text-fire" />
              {restaurant.address}
            </p>
            {restaurant.phone && (
              <p className="mt-3 flex items-center gap-2 text-sm">
                <Phone size={16} className="shrink-0 text-fire" />
                {restaurant.phone}
              </p>
            )}
            {restaurant.services.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {restaurant.services.map((s) => (
                  <Badge key={s} variant="outline">
                    {RESTAURANT_SERVICE_LABELS[s as keyof typeof RESTAURANT_SERVICE_LABELS] ?? s}
                  </Badge>
                ))}
              </div>
            )}
            <div className="mt-5 flex flex-col gap-2.5">
              <Link href={`/reservation?restaurant=${restaurant.slug}`} className="btn btn-primary justify-center">
                <Calendar size={16} /> Réserver une table
              </Link>
              <Link href="/menu" className="btn btn-outline justify-center">
                <UtensilsCrossed size={16} /> Commander
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
