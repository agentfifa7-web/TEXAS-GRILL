import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AccessDenied } from '@/components/admin/access-denied'
import { StockAdjustDialog } from '@/components/admin/stock-adjust-dialog'

export default async function AdminStockPage() {
  const session = await getServerSession()
  if (!can(session?.user?.role, 'stock:manage')) return <AccessDenied />

  const items = await prisma.inventoryItem.findMany({
    include: { restaurant: true },
    orderBy: [{ restaurant: { name: 'asc' } }, { name: 'asc' }],
  })

  const lowStockCount = items.filter((i) => i.quantity < i.threshold).length

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="eyebrow">Opérations</p>
          <h1 className="display-heading text-4xl sm:text-5xl">
            Gestion du <span className="text-fire">stock.</span>
          </h1>
        </div>
        {lowStockCount > 0 && <Badge variant="destructive">{lowStockCount} article(s) en stock faible</Badge>}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Article</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Seuil</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => {
            const isOut = item.quantity <= 0
            const isLow = !isOut && item.quantity < item.threshold
            return (
              <TableRow key={item.id}>
                <TableCell className="font-bold">{item.name}</TableCell>
                <TableCell>{item.restaurant.name}</TableCell>
                <TableCell>
                  {item.quantity} {item.unit}
                </TableCell>
                <TableCell>
                  {item.threshold} {item.unit}
                </TableCell>
                <TableCell>
                  {isOut ? (
                    <Badge variant="destructive">RUPTURE</Badge>
                  ) : isLow ? (
                    <Badge variant="destructive">STOCK FAIBLE</Badge>
                  ) : (
                    <Badge variant="success">OK</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <StockAdjustDialog itemId={item.id} itemName={item.name} unit={item.unit} />
                </TableCell>
              </TableRow>
            )
          })}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                Aucun article en stock.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
