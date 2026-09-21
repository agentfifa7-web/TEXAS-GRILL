import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AccessDenied } from '@/components/admin/access-denied'
import { GenericStatusSelect } from '@/components/admin/generic-status-select'
import { updateCorporateStatusAction } from '@/lib/actions/admin/corporate'
import { formatXOF } from '@/lib/constants'

const STATUS_OPTIONS = [
  { value: 'NEW', label: 'Nouveau' },
  { value: 'QUOTED', label: 'Devis envoyé' },
  { value: 'CONFIRMED', label: 'Confirmé' },
  { value: 'DECLINED', label: 'Refusé' },
]

const STATUS_BADGE: Record<string, 'outline' | 'amber' | 'success' | 'destructive'> = {
  NEW: 'outline',
  QUOTED: 'amber',
  CONFIRMED: 'success',
  DECLINED: 'destructive',
}

export default async function AdminCorporatePage() {
  const session = await getServerSession()
  if (!can(session?.user?.role, 'corporate:manage')) return <AccessDenied />

  const requests = await prisma.corporateRequest.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">B2B</p>
        <h1 className="display-heading text-4xl sm:text-5xl">
          Demandes <span className="text-fire">entreprises.</span>
        </h1>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Entreprise</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Effectif</TableHead>
            <TableHead>Fréquence</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Statut</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="font-bold">{r.companyName}</TableCell>
              <TableCell>
                <p>{r.contactName}</p>
                <p className="text-xs text-muted-foreground">
                  {r.phone} · {r.email}
                </p>
              </TableCell>
              <TableCell>{r.employeeCount ?? '—'}</TableCell>
              <TableCell>{r.deliveryFrequency ?? '—'}</TableCell>
              <TableCell>{r.budget != null ? formatXOF(r.budget) : '—'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant={STATUS_BADGE[r.status] ?? 'outline'}>{r.status}</Badge>
                  <GenericStatusSelect id={r.id} status={r.status} options={STATUS_OPTIONS} action={updateCorporateStatusAction} />
                </div>
              </TableCell>
            </TableRow>
          ))}
          {requests.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                Aucune demande d&apos;entreprise.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
