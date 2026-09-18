import type { Metadata } from 'next'
import { getRestaurants } from '@/lib/data/restaurants'
import { ReservationForm } from '@/components/shared/reservation-form'

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
      <div className="mb-8 text-center">
        <p className="eyebrow justify-center">Table réservée, feu allumé</p>
        <h1 className="display-heading text-5xl sm:text-6xl">
          Réserver une <span className="text-fire">table.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
          Choisissez votre restaurant, votre date et le nombre de convives — nous confirmons votre réservation rapidement.
        </p>
      </div>

      <ReservationForm
        restaurants={restaurants.map((r) => ({ id: r.id, slug: r.slug, name: r.name }))}
        defaultSlug={params.restaurant}
      />
    </div>
  )
}
