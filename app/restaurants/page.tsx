import type { Metadata } from 'next'
import { getRestaurants } from '@/lib/data/restaurants'
import { RestaurantCard } from '@/components/shared/restaurant-card'
import { RestaurantMap } from '@/components/shared/restaurant-map'

export const metadata: Metadata = {
  title: 'Nos Restaurants',
  description: 'Retrouvez les restaurants Texas Grill à Abidjan — Riviera, Zone 4, Yopougon, Deux Plateaux, Cocody. Horaires, services et réservation en ligne.',
}

export default async function RestaurantsPage() {
  const restaurants = await getRestaurants()
  const points = restaurants
    .filter((r) => r.lat != null && r.lng != null)
    .map((r) => ({ label: r.name, lat: r.lat as number, lng: r.lng as number }))

  return (
    <div className="container-grill section-py">
      <div className="mb-8">
        <p className="eyebrow">Où nous trouver</p>
        <h1 className="display-heading text-5xl sm:text-6xl">
          Nos <span className="text-fire">Restaurants.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          {restaurants.length} adresses Texas Grill à Abidjan, ouvertes au dine-in, à la livraison, au retrait et au traiteur.
        </p>
      </div>

      {points.length > 0 && (
        <div className="mb-10">
          <RestaurantMap points={points} />
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id} restaurant={restaurant} />
        ))}
      </div>
    </div>
  )
}
