'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Select } from '@/components/ui/select'
import { assignDriverAction, updateDeliveryStatusAction } from '@/lib/actions/admin/deliveries'
import { DELIVERY_STATUS } from '@/lib/constants'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  ASSIGNED: 'Assignée',
  PICKED_UP: 'Récupérée',
  EN_ROUTE: 'En route',
  DELIVERED: 'Livrée',
  FAILED: 'Échec',
}

export function DeliveryRowActions({
  deliveryId,
  status,
  driverId,
  availableDrivers,
}: {
  deliveryId: string
  status: string
  driverId: string | null
  availableDrivers: { id: string; name: string }[]
}) {
  const [currentStatus, setCurrentStatus] = useState(status)
  const [isPending, startTransition] = useTransition()

  function handleAssign(newDriverId: string) {
    if (!newDriverId) return
    startTransition(async () => {
      const result = await assignDriverAction(deliveryId, newDriverId)
      if (result.ok) {
        toast.success('Livreur assigné')
        setCurrentStatus('ASSIGNED')
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleStatus(next: string) {
    setCurrentStatus(next)
    startTransition(async () => {
      const result = await updateDeliveryStatusAction(deliveryId, next)
      if (result.ok) {
        toast.success('Statut mis à jour')
      } else {
        toast.error(result.error)
        setCurrentStatus(status)
      }
    })
  }

  return (
    <div className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
      {!driverId && (
        <Select defaultValue="" disabled={isPending} onChange={(e) => handleAssign(e.target.value)} className="w-44">
          <option value="">Assigner un livreur…</option>
          {availableDrivers.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </Select>
      )}
      <Select value={currentStatus} disabled={isPending} onChange={(e) => handleStatus(e.target.value)} className="w-40">
        {Object.values(DELIVERY_STATUS).map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s] ?? s}
          </option>
        ))}
      </Select>
    </div>
  )
}
