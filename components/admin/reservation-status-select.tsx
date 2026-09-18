'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Select } from '@/components/ui/select'
import { updateReservationStatusAction } from '@/lib/actions/admin/reservations'
import { RESERVATION_STATUS } from '@/lib/constants'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  CANCELLED: 'Annulée',
  COMPLETED: 'Terminée',
  NO_SHOW: 'Non présenté',
}

export function ReservationStatusSelect({ id, status }: { id: string; status: string }) {
  const [current, setCurrent] = useState(status)
  const [isPending, startTransition] = useTransition()

  function handleChange(next: string) {
    setCurrent(next)
    startTransition(async () => {
      const result = await updateReservationStatusAction(id, next)
      if (result.ok) {
        toast.success('Statut de la réservation mis à jour')
      } else {
        toast.error(result.error)
        setCurrent(status)
      }
    })
  }

  return (
    <Select value={current} disabled={isPending} onChange={(e) => handleChange(e.target.value)} className="w-40">
      {Object.values(RESERVATION_STATUS).map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s] ?? s}
        </option>
      ))}
    </Select>
  )
}
