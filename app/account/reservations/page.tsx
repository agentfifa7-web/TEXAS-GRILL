import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { CalendarClock, Clock, Users } from 'lucide-react'
import type { BadgeProps } from '@/components/ui/badge'
import type { ReservationStatus } from '@/lib/constants'

const STATUS_LABELS: Record<ReservationStatus, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée',
  NO_SHOW: 'Non présenté',
}

const STATUS_VARIANT: Record<ReservationStatus, NonNullable<BadgeProps['variant']>> = {
  PENDING: 'amber',
  CONFIRMED: 'success',
  CANCELLED: 'destructive',
  COMPLETED: 'outline',
  NO_SHOW: 'dark',
}

export default async function AccountReservationsPage() {
  const session = await getServerSession()
  if (!session?.user?.id) redirect('/login?callbackUrl=/account/reservations')
  const userId = session.user.id

  const reservations = await prisma.reservation.findMany({
    where: { userId },
    include: { restaurant: true },
    orderBy: { date: 'desc' },
  })

  return (
    <div>
      <p className="eyebrow">Vos tables</p>
      <h1 className="display-heading text-4xl sm:text-5xl">
        Mes <span className="text-fire">réservations.</span>
      </h1>

      {reservations.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
          <CalendarClock size={32} className="text-muted-foreground" />
          <p className="text-muted-foreground">Aucune réservation.</p>
          <Link href="/reservation" className="btn btn-primary mt-2">
            Réserver une table
          </Link>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {reservations.map((r) => (
            <div key={r.id} className="card-grill flex flex-wrap items-center justify-between gap-4 p-5">
              <div>
                <p className="font-display text-lg uppercase">{r.restaurant.name}</p>
                <p className="text-xs text-muted-foreground">Réf. {r.code}</p>
                <div className="mt-2 flex flex-wrap gap-4 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock size={13} />
                    {new Date(r.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock size={13} /> {r.time}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Users size={13} /> {r.partySize} pers.
                  </span>
                </div>
              </div>
              <Badge variant={STATUS_VARIANT[r.status as ReservationStatus]}>{STATUS_LABELS[r.status as ReservationStatus]}</Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
