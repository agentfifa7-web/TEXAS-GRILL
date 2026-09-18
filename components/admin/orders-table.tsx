'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Select } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatXOF, ORDER_STATUS, ORDER_STATUS_LABELS, ORDER_TYPE_LABELS, type OrderStatus, type OrderType } from '@/lib/constants'

export interface AdminOrderRow {
  id: string
  orderNumber: string
  contactName: string
  restaurantId: string
  restaurantName: string
  type: string
  total: number
  status: string
  createdAt: string
}

const STATUS_BADGE: Record<string, 'default' | 'secondary' | 'outline' | 'amber' | 'success' | 'destructive' | 'dark'> = {
  RECEIVED: 'outline',
  PREPARING: 'amber',
  COOKING: 'amber',
  READY: 'secondary',
  DRIVER_ASSIGNED: 'secondary',
  OUT_FOR_DELIVERY: 'default',
  DELIVERED: 'success',
  COMPLETED: 'success',
  CANCELLED: 'destructive',
}

export function OrdersTable({ orders, restaurants }: { orders: AdminOrderRow[]; restaurants: { id: string; name: string }[] }) {
  const [status, setStatus] = useState('ALL')
  const [restaurantId, setRestaurantId] = useState('ALL')

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (status !== 'ALL' && o.status !== status) return false
      if (restaurantId !== 'ALL' && o.restaurantId !== restaurantId) return false
      return true
    })
  }, [orders, status, restaurantId])

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="w-full sm:w-56">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="ALL">Tous les statuts</option>
            {Object.values(ORDER_STATUS).map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s as OrderStatus]}
              </option>
            ))}
          </Select>
        </div>
        <div className="w-full sm:w-56">
          <Select value={restaurantId} onChange={(e) => setRestaurantId(e.target.value)}>
            <option value="ALL">Tous les restaurants</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </div>
        <p className="text-xs text-muted-foreground sm:ml-auto">{filtered.length} commande(s)</p>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N°</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Restaurant</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.map((o) => (
            <TableRow key={o.id} className="cursor-pointer">
              <TableCell>
                <Link href={`/admin/orders/${o.id}`} className="font-bold text-fire hover:underline">
                  {o.orderNumber}
                </Link>
              </TableCell>
              <TableCell>{o.contactName}</TableCell>
              <TableCell>{o.restaurantName}</TableCell>
              <TableCell>{ORDER_TYPE_LABELS[o.type as OrderType] ?? o.type}</TableCell>
              <TableCell className="price-tag">{formatXOF(o.total)}</TableCell>
              <TableCell>
                <Badge variant={STATUS_BADGE[o.status] ?? 'outline'}>{ORDER_STATUS_LABELS[o.status as OrderStatus] ?? o.status}</Badge>
              </TableCell>
              <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                {new Date(o.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}
              </TableCell>
            </TableRow>
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="py-10 text-center text-sm text-muted-foreground">
                Aucune commande ne correspond à ces filtres.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
