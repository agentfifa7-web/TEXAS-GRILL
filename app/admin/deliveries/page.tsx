import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AccessDenied } from '@/components/admin/access-denied'
import { DeliveryRowActions } from '@/components/admin/delivery-row-actions'

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'outline' | 'amber' | 'success' | 'destructive'> = {
  PENDING: 'outline',
  ASSIGNED: 'amber',
  PICKED_UP: 'secondary',
  EN_ROUTE: 'default',
  DELIVERED: 'success',
  FAILED: 'destructive',
}

export default async function AdminDeliveriesPage() {
  const session = await getServerSession(authOptions)
  if (!can(session?.user?.role, 'deliveries:manage')) return <AccessDenied />

  const [deliveries, availableDrivers] = await Promise.all([
    prisma.delivery.findMany({
      include: { order: { include: { restaurant: true } }, driver: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.driver.findMany({ where: { status: 'AVAILABLE' }, select: { id: true, name: true } }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Opérations</p>
        <h1 className="display-heading text-4xl sm:text-5xl">
          Les <span className="text-fire">livraisons.</span>
        </h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Commande</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Distance</TableHead>
            <TableHead>ETA</TableHead>
            <TableHead>Livreur</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliveries.map((d) => (
            <TableRow key={d.id}>
              <TableCell className="font-bold">{d.order.orderNumber}</TableCell>
              <TableCell>{d.order.restaurant.name}</TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE[d.status] ?? 'outline'}>{d.status}</Badge>
              </TableCell>
              <TableCell>{d.distanceKm != null ? `${d.distanceKm} km` : '—'}</TableCell>
              <TableCell>{d.estimatedMinutes != null ? `${d.estimatedMinutes} min` : '—'}</TableCell>
              <TableCell>{d.driver?.name ?? 'Non assigné'}</TableCell>
              <TableCell>
                <DeliveryRowActions deliveryId={d.id} status={d.status} driverId={d.driverId} availableDrivers={availableDrivers} />
              </TableCell>
            </TableRow>
          ))}
          {deliveries.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                Aucune livraison enregistrée.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
