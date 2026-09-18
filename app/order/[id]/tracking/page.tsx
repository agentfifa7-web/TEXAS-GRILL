import { notFound } from 'next/navigation'
import { Phone } from 'lucide-react'
import { getOrderById } from '@/lib/data/orders'
import { OrderTracker } from '@/components/shared/order-tracker'
import { RestaurantMap } from '@/components/shared/restaurant-map'
import { formatXOF } from '@/lib/constants'
import type { OrderStatus } from '@/lib/constants'

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrderById(id)
  if (!order) notFound()

  const points = []
  if (order.restaurant.lat && order.restaurant.lng) points.push({ label: order.restaurant.name, lat: order.restaurant.lat, lng: order.restaurant.lng })
  if (order.address?.lat && order.address?.lng) points.push({ label: 'Vous', lat: order.address.lat, lng: order.address.lng, variant: 'destination' as const })

  return (
    <div className="container-grill section-py max-w-2xl">
      <p className="eyebrow">Commande {order.orderNumber}</p>
      <h1 className="display-heading text-4xl sm:text-5xl">
        Suivi de <span className="text-fire">commande.</span>
      </h1>

      {points.length > 0 && (
        <div className="mt-6">
          <RestaurantMap points={points} />
        </div>
      )}

      <div className="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-[1fr_260px]">
        <OrderTracker status={order.status as OrderStatus} isDelivery={order.type === 'DELIVERY'} />

        <aside className="h-fit rounded-xl border border-border bg-card p-5">
          <p className="text-xs font-bold uppercase text-muted-foreground">Restaurant préparateur</p>
          <p className="mt-1 font-display text-xl uppercase">{order.restaurant.name}</p>
          <p className="text-xs text-muted-foreground">{order.restaurant.address}</p>
          {order.delivery?.driver && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs font-bold uppercase text-muted-foreground">Votre livreur</p>
              <p className="mt-1 font-semibold">{order.delivery.driver.name}</p>
              <a href={`tel:${order.delivery.driver.phone}`} className="mt-1 inline-flex items-center gap-1.5 text-xs text-fire">
                <Phone size={12} /> {order.delivery.driver.phone}
              </a>
            </div>
          )}
          {order.delivery?.estimatedMinutes && (
            <div className="mt-4 border-t border-border pt-4">
              <p className="text-xs font-bold uppercase text-muted-foreground">Temps estimé</p>
              <p className="mt-1 font-semibold">{order.delivery.estimatedMinutes} min</p>
            </div>
          )}
          <div className="mt-4 border-t border-border pt-4">
            <p className="text-xs font-bold uppercase text-muted-foreground">Total</p>
            <p className="price-tag mt-1 text-xl text-fire">{formatXOF(order.total)}</p>
          </div>
        </aside>
      </div>
    </div>
  )
}
