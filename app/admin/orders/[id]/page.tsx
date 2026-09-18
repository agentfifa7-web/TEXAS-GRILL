import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AccessDenied } from '@/components/admin/access-denied'
import { OrderStatusForm } from '@/components/admin/order-status-form'
import { OrderActions } from '@/components/admin/order-actions'
import {
  formatXOF,
  ORDER_STATUS_LABELS,
  ORDER_TYPE_LABELS,
  PAYMENT_METHOD_LABELS,
  type OrderStatus,
  type OrderType,
} from '@/lib/constants'

export default async function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!can(session?.user?.role, 'orders:manage')) return <AccessDenied />

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      restaurant: true,
      table: true,
      address: true,
      user: true,
      items: true,
      payment: true,
      delivery: { include: { driver: true } },
    },
  })

  if (!order) notFound()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/admin/orders" className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted-foreground hover:text-fire">
          <ArrowLeft size={14} /> Retour aux commandes
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="display-heading text-3xl sm:text-4xl">
            Commande <span className="text-fire">{order.orderNumber}</span>
          </h1>
          <Badge variant="outline">{ORDER_STATUS_LABELS[order.status as OrderStatus] ?? order.status}</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {order.restaurant.name} · {ORDER_TYPE_LABELS[order.type as OrderType] ?? order.type} ·{' '}
          {order.createdAt.toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short' })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Articles</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col divide-y divide-border p-0">
              {order.items.map((item) => {
                let options: { label: string }[] = []
                let addons: { name: string; quantity: number }[] = []
                try {
                  options = JSON.parse(item.selectedOptionsJson)
                } catch {
                  options = []
                }
                try {
                  addons = JSON.parse(item.selectedAddonsJson)
                } catch {
                  addons = []
                }
                return (
                  <div key={item.id} className="flex items-start justify-between gap-4 px-5 py-4">
                    <div>
                      <p className="font-bold">
                        {item.quantity}× {item.productName}
                      </p>
                      {(options.length > 0 || addons.length > 0) && (
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {[...options.map((o) => o.label), ...addons.map((a) => `${a.name} x${a.quantity}`)].join(' · ')}
                        </p>
                      )}
                      {item.note && <p className="mt-0.5 text-xs italic text-muted-foreground">« {item.note} »</p>}
                    </div>
                    <p className="price-tag shrink-0 font-bold">{formatXOF(item.subtotal)}</p>
                  </div>
                )
              })}
            </CardContent>
          </Card>

          {order.delivery && (
            <Card>
              <CardHeader>
                <CardTitle>Livraison</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Statut</p>
                  <p className="font-bold">{order.delivery.status}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Distance</p>
                  <p className="font-bold">{order.delivery.distanceKm != null ? `${order.delivery.distanceKm} km` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">ETA</p>
                  <p className="font-bold">{order.delivery.estimatedMinutes != null ? `${order.delivery.estimatedMinutes} min` : '—'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Livreur</p>
                  <p className="font-bold">{order.delivery.driver?.name ?? 'Non assigné'}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {order.address && (
            <Card>
              <CardHeader>
                <CardTitle>Adresse de livraison</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>{order.address.line1}</p>
                {order.address.line2 && <p>{order.address.line2}</p>}
                <p className="text-muted-foreground">
                  {order.address.commune ? `${order.address.commune}, ` : ''}
                  {order.address.city}
                </p>
              </CardContent>
            </Card>
          )}

          {order.table && (
            <Card>
              <CardHeader>
                <CardTitle>Table</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">Table n°{order.table.number}</CardContent>
            </Card>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <Card>
            <CardHeader>
              <CardTitle>Statut</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <OrderStatusForm orderId={order.id} currentStatus={order.status} />
              <OrderActions
                orderId={order.id}
                isCancelled={order.status === 'CANCELLED'}
                canRefund={order.payment != null && order.payment.status === 'PAID'}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Client</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm">
              <p className="font-bold">{order.contactName}</p>
              <p className="text-muted-foreground">{order.contactPhone}</p>
              {order.contactEmail && <p className="text-muted-foreground">{order.contactEmail}</p>}
              {order.user && (
                <Link href="/admin/customers" className="mt-2 text-xs font-bold text-fire hover:underline">
                  Voir dans le CRM
                </Link>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paiement</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-sm">
              {order.payment ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Méthode</span>
                    <span className="font-bold">{PAYMENT_METHOD_LABELS[order.payment.method as keyof typeof PAYMENT_METHOD_LABELS] ?? order.payment.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Statut</span>
                    <Badge variant={order.payment.status === 'PAID' ? 'success' : order.payment.status === 'REFUNDED' ? 'destructive' : 'outline'}>
                      {order.payment.status}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Référence</span>
                    <span className="font-mono text-xs">{order.payment.transactionRef ?? '—'}</span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground">Aucun paiement enregistré.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Résumé</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span>{formatXOF(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span>{formatXOF(order.deliveryFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[var(--success)]">
                  <span>Réduction{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                  <span>-{formatXOF(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between border-t border-border pt-1.5 font-bold">
                <span>Total</span>
                <span className="price-tag">{formatXOF(order.total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
