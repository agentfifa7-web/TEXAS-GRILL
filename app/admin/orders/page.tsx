import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { AccessDenied } from '@/components/admin/access-denied'
import { OrdersTable, type AdminOrderRow } from '@/components/admin/orders-table'

export default async function AdminOrdersPage() {
  const session = await getServerSession()
  if (!can(session?.user?.role, 'orders:manage')) return <AccessDenied />

  const [orders, restaurants] = await Promise.all([
    prisma.order.findMany({
      include: { restaurant: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.restaurant.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  const rows: AdminOrderRow[] = orders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    contactName: o.contactName,
    restaurantId: o.restaurantId,
    restaurantName: o.restaurant.name,
    type: o.type,
    total: o.total,
    status: o.status,
    createdAt: o.createdAt.toISOString(),
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Opérations</p>
        <h1 className="display-heading text-4xl sm:text-5xl">
          Les <span className="text-fire">commandes.</span>
        </h1>
      </div>
      <OrdersTable orders={rows} restaurants={restaurants} />
    </div>
  )
}
