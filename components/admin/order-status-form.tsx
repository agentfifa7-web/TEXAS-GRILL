'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Select } from '@/components/ui/select'
import { updateOrderStatusAction } from '@/lib/actions/admin/orders'
import { ORDER_STATUS, ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/constants'

export function OrderStatusForm({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const [status, setStatus] = useState(currentStatus)
  const [isPending, startTransition] = useTransition()

  function handleChange(next: string) {
    setStatus(next)
    startTransition(async () => {
      const result = await updateOrderStatusAction(orderId, next)
      if (result.ok) {
        toast.success('Statut de la commande mis à jour')
      } else {
        toast.error(result.error)
        setStatus(currentStatus)
      }
    })
  }

  return (
    <div className="flex items-center gap-3">
      <Select value={status} disabled={isPending} onChange={(e) => handleChange(e.target.value)} className="w-56">
        {Object.values(ORDER_STATUS).map((s) => (
          <option key={s} value={s}>
            {ORDER_STATUS_LABELS[s as OrderStatus]}
          </option>
        ))}
      </Select>
      {isPending && <span className="text-xs text-muted-foreground">Mise à jour…</span>}
    </div>
  )
}
