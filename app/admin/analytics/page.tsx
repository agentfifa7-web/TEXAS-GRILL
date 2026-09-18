import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { subDays } from 'date-fns'
import { Wallet, ShoppingBag, Receipt, TrendingUp, UserPlus, Repeat } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { AccessDenied } from '@/components/admin/access-denied'
import { KpiCard } from '@/components/admin/kpi-card'
import { TopProductsChart, type TopProduct } from '@/components/admin/charts/top-products-chart'
import { formatXOF } from '@/lib/constants'

export default async function AdminAnalyticsPage() {
  const session = await getServerSession(authOptions)
  if (!can(session?.user?.role, 'analytics:view')) return <AccessDenied />

  const thirtyDaysAgo = subDays(new Date(), 30)

  const [orders, newCustomers, topProductsRaw, restaurants, ordersWithAddress, coupons, allCustomerOrderCounts] = await Promise.all([
    prisma.order.findMany({ select: { total: true, restaurantId: true, status: true } }),
    prisma.user.count({ where: { role: 'CUSTOMER', createdAt: { gte: thirtyDaysAgo } } }),
    prisma.orderItem.groupBy({ by: ['productName'], _sum: { quantity: true }, orderBy: { _sum: { quantity: 'desc' } }, take: 5 }),
    prisma.restaurant.findMany({ select: { id: true, name: true } }),
    prisma.order.findMany({
      where: { addressId: { not: null } },
      select: { total: true, address: { select: { commune: true, city: true } } },
    }),
    prisma.coupon.findMany({ orderBy: { usedCount: 'desc' }, take: 5 }),
    prisma.order.groupBy({ by: ['userId'], _count: { _all: true }, where: { userId: { not: null } } }),
  ])

  const totalRevenue = orders.filter((o) => o.status !== 'CANCELLED').reduce((sum, o) => sum + o.total, 0)
  const orderCount = orders.length
  const avgBasket = orderCount > 0 ? Math.round(totalRevenue / orderCount) : 0
  const recurringCustomers = allCustomerOrderCounts.filter((g) => g._count._all > 1).length

  const revenueByRestaurant = new Map<string, number>()
  for (const o of orders) {
    if (o.status === 'CANCELLED') continue
    revenueByRestaurant.set(o.restaurantId, (revenueByRestaurant.get(o.restaurantId) ?? 0) + o.total)
  }
  const topRestaurants = restaurants
    .map((r) => ({ name: r.name, revenue: revenueByRestaurant.get(r.id) ?? 0 }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const revenueByZone = new Map<string, number>()
  for (const o of ordersWithAddress) {
    const zone = o.address?.commune || o.address?.city || 'Non précisé'
    revenueByZone.set(zone, (revenueByZone.get(zone) ?? 0) + o.total)
  }
  const topZones = Array.from(revenueByZone.entries())
    .map(([zone, revenue]) => ({ zone, revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)

  const topProducts: TopProduct[] = topProductsRaw.map((p) => ({ name: p.productName, quantity: p._sum.quantity ?? 0 }))

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="eyebrow">Pilotage</p>
        <h1 className="display-heading text-4xl sm:text-5xl">
          <span className="text-fire">Analytics.</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <KpiCard label="CA total" value={formatXOF(totalRevenue)} icon={Wallet} accent="fire" />
        <KpiCard label="Commandes" value={String(orderCount)} icon={ShoppingBag} accent="amber" />
        <KpiCard label="Panier moyen" value={formatXOF(avgBasket)} icon={Receipt} accent="ink" />
        <KpiCard label="Taux de conversion" value="≈ 3,2 %" icon={TrendingUp} accent="success" hint="Estimation (pas de suivi de funnel)" />
        <KpiCard label="Nouveaux clients (30j)" value={String(newCustomers)} icon={UserPlus} accent="fire" />
        <KpiCard label="Clients récurrents" value={String(recurringCustomers)} icon={Repeat} accent="amber" />
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top restaurants</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {topRestaurants.map((r) => (
              <div key={r.name} className="flex items-center justify-between text-sm">
                <span className="font-medium">{r.name}</span>
                <span className="price-tag font-bold">{formatXOF(r.revenue)}</span>
              </div>
            ))}
            {topRestaurants.every((r) => r.revenue === 0) && <p className="text-sm text-muted-foreground">Pas encore de données.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top zones de livraison</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {topZones.length > 0 ? (
              topZones.map((z) => (
                <div key={z.zone} className="flex items-center justify-between text-sm">
                  <span className="font-medium">{z.zone}</span>
                  <span className="price-tag font-bold">{formatXOF(z.revenue)}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Pas encore de données de livraison.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Performance des promotions</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Utilisations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-xs font-bold">{c.code}</TableCell>
                    <TableCell>
                      {c.usedCount}
                      {c.maxUses ? ` / ${c.maxUses}` : ''}
                    </TableCell>
                  </TableRow>
                ))}
                {coupons.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="py-6 text-center text-sm text-muted-foreground">
                      Aucun coupon.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
