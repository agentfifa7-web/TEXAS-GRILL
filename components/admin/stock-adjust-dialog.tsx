'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { PackagePlus } from 'lucide-react'
import { Dialog } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { adjustStockAction } from '@/lib/actions/admin/stock'

export function StockAdjustDialog({ itemId, itemName, unit }: { itemId: string; itemName: string; unit: string }) {
  const [open, setOpen] = useState(false)
  const [type, setType] = useState<'IN' | 'OUT' | 'ADJUSTMENT' | 'WASTE'>('IN')
  const [quantity, setQuantity] = useState('')
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await adjustStockAction({ itemId, type, quantity: Number(quantity) || 0, reason })
      if (result.ok) {
        toast.success('Mouvement de stock enregistré')
        setOpen(false)
        setQuantity('')
        setReason('')
      } else {
        toast.error(result.error)
      }
    })
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn btn-outline btn-sm">
        <PackagePlus size={14} /> Mouvement
      </button>
      <Dialog open={open} onClose={() => setOpen(false)} title={`Mouvement — ${itemName}`}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <Label htmlFor="type">Type de mouvement</Label>
            <Select id="type" value={type} onChange={(e) => setType(e.target.value as typeof type)}>
              <option value="IN">Entrée (approvisionnement)</option>
              <option value="OUT">Sortie (utilisation)</option>
              <option value="WASTE">Perte / gaspillage</option>
              <option value="ADJUSTMENT">Ajustement (valeur exacte)</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="quantity">Quantité ({unit})</Label>
            <Input id="quantity" type="number" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="reason">Motif (optionnel)</Label>
            <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Ex : livraison fournisseur" />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" className="btn btn-outline btn-sm" onClick={() => setOpen(false)}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
              {isPending ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </Dialog>
    </>
  )
}
