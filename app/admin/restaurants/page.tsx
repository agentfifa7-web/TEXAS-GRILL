import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { Plus, Pencil } from 'lucide-react'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AccessDenied } from '@/components/admin/access-denied'
import { RestaurantDeleteButton } from '@/components/admin/restaurant-delete-button'
import { RESTAURANT_SERVICE_LABELS } from '@/lib/constants'

const STATUS_LABEL: Record<string, string> = { OPEN: 'Ouvert', CLOSED: 'Fermé', COMING_SOON: 'Bientôt' }
const STATUS_BADGE: Record<string, 'success' | 'destructive' | 'amber'> = { OPEN: 'success', CLOSED: 'destructive', COMING_SOON: 'amber' }

export default async function AdminRestaurantsPage() {
  const session = await getServerSession(authOptions)
  if (!can(session?.user?.role, 'restaurants:manage')) return <AccessDenied />

  const restaurants = await prisma.restaurant.findMany({ orderBy: { name: 'asc' } })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Réseau</p>
          <h1 className="display-heading text-4xl sm:text-5xl">
            Les <span className="text-fire">restaurants.</span>
          </h1>
        </div>
        <Link href="/admin/restaurants/new" className="btn btn-primary">
          <Plus size={16} /> Nouveau restaurant
        </Link>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Ville</TableHead>
            <TableHead>Services</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {restaurants.map((r) => {
            let services: string[] = []
            try {
              services = JSON.parse(r.servicesJson)
            } catch {
              services = []
            }
            return (
              <TableRow key={r.id}>
                <TableCell>
                  <p className="font-bold">{r.name}</p>
                  <p className="text-xs text-muted-foreground">{r.address}</p>
                </TableCell>
                <TableCell>{r.city}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {services.map((s) => (
                      <Badge key={s} variant="outline">
                        {RESTAURANT_SERVICE_LABELS[s as keyof typeof RESTAURANT_SERVICE_LABELS] ?? s}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE[r.status] ?? 'outline'}>{STATUS_LABEL[r.status] ?? r.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Link href={`/admin/restaurants/${r.id}/edit`} aria-label="Modifier" className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-fire">
                      <Pencil size={16} />
                    </Link>
                    <RestaurantDeleteButton id={r.id} name={r.name} />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
