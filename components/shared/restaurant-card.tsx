import Image from 'next/image'
import Link from 'next/link'
import { Clock, MapPin, Phone } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { isOpenNow } from '@/lib/data/restaurants'
import { RESTAURANT_SERVICE_LABELS } from '@/lib/constants'

export interface RestaurantCardData {
  id: string
  slug: string
  name: string
  address: string
  phone: string | null
  heroImage: string | null
  status: string
  services: string[]
  hours: { dayOfWeek: number; openTime: string; closeTime: string; isClosed: boolean }[]
}

export function RestaurantCard({ restaurant }: { restaurant: RestaurantCardData }) {
  const open = restaurant.status === 'OPEN' && isOpenNow(restaurant.hours)

  return (
    <div className="card-grill group overflow-hidden">
      <Link href={`/restaurants/${restaurant.slug}`} className="relative block h-48 overflow-hidden bg-muted sm:h-56">
        {restaurant.heroImage && (
          <Image
            src={restaurant.heroImage}
            alt={restaurant.name}
            fill
            sizes="(max-width: 640px) 100vw, 400px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        <Badge variant={open ? 'success' : 'dark'} className="absolute left-3 top-3">
          {open ? 'Ouvert maintenant' : restaurant.status === 'COMING_SOON' ? 'Bientôt' : 'Fermé'}
        </Badge>
      </Link>
      <div className="p-5">
        <h3 className="font-display text-xl uppercase leading-tight tracking-wide">
          <Link href={`/restaurants/${restaurant.slug}`}>{restaurant.name}</Link>
        </h3>
        <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
          <MapPin size={14} className="mt-0.5 shrink-0 text-fire" />
          {restaurant.address}
        </p>
        {restaurant.phone && (
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone size={14} className="shrink-0 text-fire" />
            {restaurant.phone}
          </p>
        )}
        {restaurant.services.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {restaurant.services.map((s) => (
              <Badge key={s} variant="outline" className="gap-1">
                <Clock size={10} />
                {RESTAURANT_SERVICE_LABELS[s as keyof typeof RESTAURANT_SERVICE_LABELS] ?? s}
              </Badge>
            ))}
          </div>
        )}
        <div className="mt-4 flex gap-2">
          <Link href={`/reservation?restaurant=${restaurant.slug}`} className="btn btn-outline btn-sm flex-1 justify-center">
            Réserver
          </Link>
          <Link href="/menu" className="btn btn-primary btn-sm flex-1 justify-center">
            Commander
          </Link>
        </div>
      </div>
    </div>
  )
}
