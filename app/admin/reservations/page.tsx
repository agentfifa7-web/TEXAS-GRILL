import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { AccessDenied } from '@/components/admin/access-denied'
import { ReservationsTable, type AdminReservationRow } from '@/components/admin/reservations-table'

export default async function AdminReservationsPage() {
  const session = await getServerSession(authOptions)
  if (!can(session?.user?.role, 'reservations:manage')) return <AccessDenied />

  const [reservations, restaurants] = await Promise.all([
    prisma.reservation.findMany({ include: { restaurant: true }, orderBy: { date: 'asc' } }),
    prisma.restaurant.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
  ])

  const rows: AdminReservationRow[] = reservations.map((r) => ({
    id: r.id,
    code: r.code,
    restaurantId: r.restaurantId,
    restaurantName: r.restaurant.name,
    name: r.name,
    phone: r.phone,
    date: r.date.toISOString().slice(0, 10),
    time: r.time,
    partySize: r.partySize,
    status: r.status,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Salle</p>
        <h1 className="display-heading text-4xl sm:text-5xl">
          Les <span className="text-fire">réservations.</span>
        </h1>
      </div>
      <ReservationsTable reservations={rows} restaurants={restaurants} />
    </div>
  )
}
