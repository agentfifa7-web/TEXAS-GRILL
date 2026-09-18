'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { deleteRestaurantAction } from '@/lib/actions/admin/restaurants'

export function RestaurantDeleteButton({ id, name }: { id: string; name: string }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteRestaurantAction(id)
      if (result.ok) {
        toast.success('Restaurant supprimé')
        setOpen(false)
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Supprimer" className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
        <Trash2 size={16} />
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Supprimer ce restaurant ?">
        <p className="text-sm text-muted-foreground">
          Vous êtes sur le point de supprimer <strong>{name}</strong>. Cette action est irréversible.
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>
            Annuler
          </button>
          <button type="button" className="btn btn-primary btn-sm" disabled={isPending} onClick={handleDelete}>
            Supprimer
          </button>
        </div>
      </Dialog>
    </>
  )
}
