import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatXOF, ORDER_STATUS_LABELS, ORDER_TYPE_LABELS, type OrderStatus, type OrderType } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { ArrowRight, Package } from 'lucide-react'
import { OrderReviewForm } from './order-review-form'

function statusVariant(status: OrderStatus): 'success' | 'destructive' | 'amber' | 'outline' {
  if (status === 'COMPLETED' || status === 'DELIVERED') return 'success'
  if (status === 'CANCELLED') return 'destructive'
  if (status === 'RECEIVED') return 'outline'
  return 'amber'
}

export default async function AccountOrdersPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login?callbackUrl=/account/orders')
  const userId = session.user.id

  const orders = await prisma.order.findMany({
    where: { userId },
    include: { restaurant: true, items: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <div>
      <p className="eyebrow">Historique</p>
      <h1 className="display-heading text-4xl sm:text-5xl">
        Mes <span className="text-fire">commandes.</span>
      </h1>

      {orders.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
          <Package size={32} className="text-muted-foreground" />
          <p className="text-muted-foreground">Tu n&apos;as pas encore passé de commande.</p>
          <Link href="/menu" className="btn btn-primary mt-2">
            Voir le menu <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card-grill p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg uppercase">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.restaurant.name} · {ORDER_TYPE_LABELS[order.type as OrderType]} ·{' '}
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <Badge variant={statusVariant(order.status as OrderStatus)}>{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                <p className="text-xs text-muted-foreground">
                  {order.items.length} article{order.items.length > 1 ? 's' : ''}
                </p>
                <strong className="price-tag text-lg">{formatXOF(order.total)}</strong>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Link href={`/order/${order.id}/tracking`} className="btn btn-outline btn-sm">
                  Suivi de commande
                </Link>
                {order.status === 'COMPLETED' && <OrderReviewForm orderId={order.id} />}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
