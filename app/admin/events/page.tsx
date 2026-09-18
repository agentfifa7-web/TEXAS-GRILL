import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AccessDenied } from '@/components/admin/access-denied'
import { GenericStatusSelect } from '@/components/admin/generic-status-select'
import { updateEventStatusAction } from '@/lib/actions/admin/events'
import { EVENT_TYPES, formatXOF } from '@/lib/constants'

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'Nouveau' },
  { value: 'CONTACTED', label: 'Contacté' },
  { value: 'CONFIRMED', label: 'Confirmé' },
  { value: 'DECLINED', label: 'Refusé' },
]

const STATUS_BADGE: Record<string, 'outline' | 'amber' | 'success' | 'destructive'> = {
  NEW: 'outline',
  CONTACTED: 'amber',
  CONFIRMED: 'success',
  DECLINED: 'destructive',
}

export default async function AdminEventsPage() {
  const session = await getServerSession(authOptions)
  if (!can(session?.user?.role, 'events:manage')) return <AccessDenied />

  const events = await prisma.event.findMany({ include: { restaurant: true }, orderBy: { date: 'asc' } })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Demandes</p>
        <h1 className="display-heading text-4xl sm:text-5xl">
          Les <span className="text-fire">événements.</span>
        </h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Contact</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Invités</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((e) => (
            <TableRow key={e.id}>
              <TableCell>
                <p className="font-bold">{e.name}</p>
                <p className="text-xs text-muted-foreground">
                  {e.phone} · {e.email}
                </p>
              </TableCell>
              <TableCell>{EVENT_TYPES[e.type as keyof typeof EVENT_TYPES] ?? e.type}</TableCell>
              <TableCell>{e.date.toLocaleDateString('fr-FR')}</TableCell>
              <TableCell>{e.guestCount}</TableCell>
              <TableCell>{e.budget != null ? formatXOF(e.budget) : '—'}</TableCell>
              <TableCell>{e.restaurant?.name ?? 'Non précisé'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_BADGE[e.status] ?? 'outline'}>{e.status}</Badge>
                  <GenericStatusSelect id={e.id} status={e.status} options={STATUS_OPTIONS} action={updateEventStatusAction} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {events.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                Aucune demande d&apos;événement.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
