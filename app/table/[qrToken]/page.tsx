import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { TableSessionClient } from '@/components/shared/table-session-client'

export default async function TableQrPage({ params }: { params: Promise<{ qrToken: string }> }) {
  const { qrToken } = await params
  const table = await prisma.table.findUnique({ where: { qrToken }, include: { restaurant: true } })
  if (!table || !table.isActive || table.restaurant.status !== 'OPEN') notFound()

  return (
    <TableSessionClient
      tableId={table.id}
      tableNumber={table.number}
      restaurantId={table.restaurantId}
      restaurantName={table.restaurant.name}
    />
  )
}
