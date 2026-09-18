import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle2, MapPin, ArrowRight } from 'lucide-react'
import { getOrderById } from '@/lib/data/orders'
import { formatXOF, ORDER_TYPE_LABELS } from '@/lib/constants'

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await getOrderById(id)
  if (!order) notFound()

  return (
    <div className="container-grill section-py max-w-xl">
      <div className="text-center">
        <CheckCircle2 size={56} className="mx-auto text-[var(--success)]" />
        <h1 className="display-heading mt-4 text-4xl sm:text-5xl">Commande confirmée !</h1>
        <p className="mt-2 text-muted-foreground">
          Numéro de commande <strong className="text-foreground">{order.orderNumber}</strong>
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2 text-sm">
          <MapPin size={16} className="text-fire" />
          <span>
            {ORDER_TYPE_LABELS[order.type as keyof typeof ORDER_TYPE_LABELS]} — {order.restaurant.name}
          </span>
        </div>
        <div className="mt-4 divide-y divide-border">
          {order.items.map((item) => (
            <div key={item.id} className="flex justify-between py-2.5 text-sm">
              <span>
                {item.quantity}× {item.productName}
              </span>
              <span className="font-semibold">{formatXOF(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sous-total</span>
            <span>{formatXOF(order.subtotal)}</span>
          </div>
          {order.deliveryFee > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Livraison</span>
              <span>{formatXOF(order.deliveryFee)}</span>
            </div>
          )}
          {order.discount > 0 && (
            <div className="flex justify-between text-[var(--success)]">
              <span>Réduction</span>
              <span>-{formatXOF(order.discount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 text-base">
            <strong>Total</strong>
            <strong className="price-tag text-fire">{formatXOF(order.total)}</strong>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        {order.type === 'DELIVERY' ? (
          <Link href={`/order/${order.id}/tracking`} className="btn btn-primary flex-1">
            Suivre ma commande <ArrowRight size={16} />
          </Link>
        ) : (
          <Link href="/menu" className="btn btn-primary flex-1">
            Retour au menu
          </Link>
        )}
        <Link href="/account/orders" className="btn btn-outline flex-1">
          Mes commandes
        </Link>
      </div>
    </div>
  )
}
