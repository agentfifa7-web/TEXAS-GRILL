import type { Metadata } from 'next'
import { getRestaurants } from '@/lib/data/restaurants'
import { ReservationForm } from '@/components/shared/reservation-form'
import { PageHero } from '@/components/shared/page-hero'

export const metadata: Metadata = {
  title: 'Réservation',
  description: 'Réservez votre table dans un restaurant Texas Grill à Abidjan en quelques clics.',
}

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ restaurant?: string }>
}) {
  const params = await searchParams
  const restaurants = await getRestaurants()

  return (
    <div className="container-grill section-py">
      <PageHero
        eyebrow="Table réservée, feu allumé"
        title={<>Réserver une <span className="text-fire">table.</span></>}
        description="Choisissez votre restaurant, votre date et le nombre de convives — nous confirmons votre réservation rapidement."
        videoSrc="/videos/hero-restaurant.mp4"
        center
      />

      <ReservationForm
        restaurants={restaurants.map((r) => ({ id: r.id, slug: r.slug, name: r.name }))}
        defaultSlug={params.restaurant}
      />
    </div>
  )
}
