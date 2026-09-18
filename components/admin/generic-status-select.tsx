'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Select } from '@/components/ui/select'

export function GenericStatusSelect({
  id,
  status,
  options,
  action,
}: {
  id: string
  status: string
  options: { value: string; label: string }[]
  action: (id: string, status: string) => Promise<{ ok: boolean; error?: string }>
}) {
  const [current, setCurrent] = useState(status)
  const [isPending, startTransition] = useTransition()

  function handleChange(next: string) {
    setCurrent(next)
    startTransition(async () => {
      const result = await action(id, next)
      if (result.ok) {
        toast.success('Statut mis à jour')
      } else {
        toast.error(result.error ?? 'Une erreur est survenue')
        setCurrent(status)
      }
    })
  }

  return (
    <Select value={current} disabled={isPending} onChange={(e) => handleChange(e.target.value)} className="w-44">
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </Select>
  )
}
