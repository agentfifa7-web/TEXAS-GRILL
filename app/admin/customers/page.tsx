import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { AccessDenied } from '@/components/admin/access-denied'
import { CustomersTable, type AdminCustomerRow } from '@/components/admin/customers-table'

export default async function AdminCustomersPage() {
  const session = await getServerSession()
  if (!can(session?.user?.role, 'customers:manage')) return <AccessDenied />

  const customers = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    include: { orders: { select: { total: true, createdAt: true } }, loyaltyAccount: true },
    orderBy: { createdAt: 'desc' },
  })

  const rows: AdminCustomerRow[] = customers.map((c) => {
    const totalSpent = c.orders.reduce((sum, o) => sum + o.total, 0)
    const lastOrder = c.orders.reduce<Date | null>((latest, o) => (!latest || o.createdAt > latest ? o.createdAt : latest), null)
    return {
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      createdAt: c.createdAt.toISOString(),
      orderCount: c.orders.length,
      totalSpent,
      points: c.loyaltyAccount?.points ?? 0,
      tier: c.loyaltyAccount?.tier ?? null,
      lastOrderAt: lastOrder ? lastOrder.toISOString() : null,
    }
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Relation client</p>
        <h1 className="display-heading text-4xl sm:text-5xl">
          Clients <span className="text-fire">/ CRM.</span>
        </h1>
      </div>
      <CustomersTable customers={rows} />
    </div>
  )
}
