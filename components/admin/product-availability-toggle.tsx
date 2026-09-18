'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Switch } from '@/components/ui/checkbox'
import { toggleProductAvailabilityAction } from '@/lib/actions/admin/products'

export function ProductAvailabilityToggle({ id, initial }: { id: string; initial: boolean }) {
  const [checked, setChecked] = useState(initial)
  const [isPending, startTransition] = useTransition()

  function handleChange(next: boolean) {
    setChecked(next)
    startTransition(async () => {
      const result = await toggleProductAvailabilityAction(id, next)
      if (!result.ok) {
        toast.error(result.error)
        setChecked(!next)
      }
    })
  }

  return <Switch checked={checked} disabled={isPending} onChange={(e) => handleChange(e.target.checked)} />
}
