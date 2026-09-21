import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { formatXOF, ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/constants'
import { startOfDay, subDays, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Wallet, ShoppingBag, Users, Receipt, Truck, CalendarClock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AccessDenied } from '@/components/admin/access-denied'
import { KpiCard } from '@/components/admin/kpi-card'
import { SalesChart, type SalesPoint } from '@/components/admin/charts/sales-chart'
import { StatusChart, type StatusSlice } from '@/components/admin/charts/status-chart'
import { TopProductsChart, type TopProduct } from '@/components/admin/charts/top-products-chart'

export default async function AdminDashboardPage() {
  const session = await getServerSession()
  const role = session?.user?.role

  if (!can(role, 'dashboard:view')) {
    return <AccessDenied />
  }

  const today = startOfDay(new Date())
  const sevenDaysAgo = subDays(today, 6)

  const [
    todaysOrders,
    customersCount,
    activeDeliveries,
    upcomingReservations,
    recentOrders,
    ordersByStatus,
    topProductsRaw,
  ] = await Promise.all([
    prisma.order.findMany({ where: { createdAt: { gte: today } }, select: { total: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.delivery.count({ where: { status: { in: ['ASSIGNED', 'PICKED_UP', 'EN_ROUTE'] } } }),
    prisma.reservation.count({ where: { date: { gte: today }, status: { in: ['PENDING', 'CONFIRMED'] } } }),
    prisma.order.findMany({ where: { createdAt: { gte: sevenDaysAgo } }, select: { createdAt: true, total: true } }),
    prisma.order.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.orderItem.groupBy({ by: ['productName'], _sum: { quantity: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5 }),
  ])

  const caDuJour = todaysOrders.reduce((sum, o) => sum + o.total, 0)
  const commandesDuJour = todaysOrders.length
  const panierMoyen = commandesDuJour > 0 ? Math.round(caDuJour / commandesDuJour) : 0

  const salesByDay: SalesPoint[] = []
  for (let i = 6; i >= 0; i--) {
    const day = subDays(today, i)
    const dayKey = format(day, 'yyyy-MM-dd')
    const total = recentOrders
      .filter((o) => format(o.createdAt, 'yyyy-MM-dd') === dayKey)
      .reduce((sum, o) => sum + o.total, 0)
    salesByDay.push({ date: dayKey, label: format(day, 'EEE dd', { locale: fr }), total })
  }

  const statusData: StatusSlice[] = ordersByStatus
    .map((s) => ({
      status: s.status,
      label: ORDER_STATUS_LABELS[s.status as OrderStatus] ?? s.status,
      count: s._count._all,
    }))
    .sort((a, b) => b.count - a.count)

  const topProducts: TopProduct[] = topProductsRaw.map((p) => ({ name: p.productName, quantity: p._sum.quantity ?? 0 }))

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow">Vue d&apos;ensemble</p>
        <h1 className="display-heading text-4xl sm:text-5xl">
          Tableau de <span className="text-fire">bord.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="CA du jour" value={formatXOF(caDuJour)} icon={Wallet} accent="fire" />
        <KpiCard label="Commandes du jour" value={String(commandesDuJour)} icon={ShoppingBag} accent="amber" />
        <KpiCard label="Clients" value={String(customersCount)} icon={Users} accent="ink" />
        <KpiCard label="Panier moyen" value={formatXOF(panierMoyen)} icon={Receipt} accent="fire" />
        <KpiCard label="Livraisons en cours" value={String(activeDeliveries)} icon={Truck} accent="success" />
        <KpiCard label="Réservations à venir" value={String(upcomingReservations)} icon={CalendarClock} accent="amber" />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Ventes — 7 derniers jours</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={salesByDay} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commandes par statut</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <StatusChart data={statusData} />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">Aucune commande pour le moment.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top 5 produits</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts.length > 0 ? (
            <TopProductsChart data={topProducts} />
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">Pas encore de données de vente.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
