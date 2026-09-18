import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can, PERMISSIONS } from '@/lib/rbac'
import { ROLES, ROLE_LABELS, type RoleKey } from '@/lib/constants'
import { Info } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AccessDenied } from '@/components/admin/access-denied'

const ROLE_ORDER: RoleKey[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'RESTAURANT_MANAGER',
  'KITCHEN_MANAGER',
  'CASHIER',
  'DELIVERY_MANAGER',
  'MARKETING_MANAGER',
  'CONTENT_MANAGER',
]

export default async function AdminRolesPage() {
  const session = await getServerSession(authOptions)
  if (!can(session?.user?.role, 'roles:manage')) return <AccessDenied />

  const [roles, permissions] = await Promise.all([
    prisma.role.findMany({ include: { permissions: { include: { permission: true } } } }),
    prisma.permission.findMany(),
  ])

  const permissionKeys = Object.keys(PERMISSIONS) as (keyof typeof PERMISSIONS)[]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Sécurité</p>
        <h1 className="display-heading text-4xl sm:text-5xl">
          Rôles & <span className="text-fire">permissions.</span>
        </h1>
      </div>

      <Card>
        <CardContent className="flex items-start gap-3 p-4 text-sm">
          <Info size={18} className="mt-0.5 shrink-0 text-fire" />
          <p className="text-muted-foreground">
            Les permissions sont actuellement définies dans le code (<code className="rounded bg-muted px-1.5 py-0.5 text-xs">lib/rbac.ts</code>) pour
            la sécurité — une interface d&apos;édition sera ajoutée dans une version future.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matrice des permissions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Permission</TableHead>
                {ROLE_ORDER.map((r) => (
                  <TableHead key={r} className="text-center">
                    {ROLE_LABELS[r]}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {permissionKeys.map((key) => (
                <TableRow key={key}>
                  <TableCell className="font-mono text-xs font-bold">{key}</TableCell>
                  {ROLE_ORDER.map((r) => (
                    <TableCell key={r} className="text-center">
                      {(PERMISSIONS[key] as readonly string[]).includes(ROLES[r]) ? (
                        <span className="text-[var(--success)]">●</span>
                      ) : (
                        <span className="text-border">—</span>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Table Role (référence DB)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {roles.map((r) => (
              <div key={r.id} className="rounded-lg border border-border p-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold">{r.label}</p>
                  <Badge variant="outline">{r.key}</Badge>
                </div>
                {r.description && <p className="mt-1 text-xs text-muted-foreground">{r.description}</p>}
                <p className="mt-2 text-xs text-muted-foreground">{r.permissions.length} permission(s) liée(s) en base</p>
              </div>
            ))}
            {roles.length === 0 && <p className="text-sm text-muted-foreground">Aucun rôle en base de données.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Table Permission (référence DB)</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {permissions.map((p) => (
              <Badge key={p.id} variant="outline">
                {p.label}
              </Badge>
            ))}
            {permissions.length === 0 && <p className="text-sm text-muted-foreground">Aucune permission en base de données.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
