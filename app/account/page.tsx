import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrCreateLoyaltyAccount } from '@/lib/loyalty'
import { formatXOF, ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Package, Heart, CalendarClock, Flame, ArrowRight, type LucideIcon } from 'lucide-react'

export default async function AccountDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login?callbackUrl=/account')
  const userId = session.user.id

  const [orderCount, recentOrders, favoriteCount, loyaltyAccount, upcomingReservationCount, user] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.order.findMany({ where: { userId }, include: { restaurant: true }, orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.favorite.count({ where: { userId } }),
    getOrCreateLoyaltyAccount(userId),
    prisma.reservation.count({ where: { userId, date: { gte: new Date() }, status: { in: ['PENDING', 'CONFIRMED'] } } }),
    prisma.user.findUnique({ where: { id: userId } }),
  ])

  const firstName = user?.name?.split(' ')[0] ?? 'Client'

  return (
    <div>
      <p className="eyebrow">Espace client</p>
      <h1 className="display-heading text-4xl sm:text-5xl">
        Bonjour <span className="text-fire">{firstName}.</span>
      </h1>

      <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard href="/account/orders" icon={Package} label="Commandes" value={orderCount} />
        <StatCard href="/account/favorites" icon={Heart} label="Favoris" value={favoriteCount} />
        <StatCard href="/account/reservations" icon={CalendarClock} label="Réservations à venir" value={upcomingReservationCount} />
        <StatCard href="/account/coupons" icon={Flame} label="Points fidélité" value={loyaltyAccount.points} />
      </div>

      <div className="mt-10">
        <div className="mb-4 flex items-center justify-between">
          <p className="font-display text-xl uppercase">Commandes récentes</p>
          <Link href="/account/orders" className="inline-flex items-center gap-1 text-xs font-bold text-fire">
            Voir tout <ArrowRight size={12} />
          </Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Aucune commande pour le moment.
          </p>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/order/${order.id}/tracking`}
                className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm transition-colors hover:bg-muted/40"
              >
                <div>
                  <p className="font-bold">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {order.restaurant.name} · {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline">{ORDER_STATUS_LABELS[order.status as OrderStatus]}</Badge>
                  <strong className="price-tag">{formatXOF(order.total)}</strong>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ href, icon: Icon, label, value }: { href: string; icon: LucideIcon; label: string; value: number }) {
  return (
    <Link href={href} className="card-grill flex flex-col gap-2 p-4 transition-transform hover:-translate-y-0.5">
      <Icon size={18} className="text-fire" />
      <strong className="price-tag text-2xl">{value.toLocaleString('fr-FR')}</strong>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
    </Link>
  )
}
