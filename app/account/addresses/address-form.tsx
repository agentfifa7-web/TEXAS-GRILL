'use client'

import { useState, useTransition, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Plus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createAddressAction } from '@/lib/actions/addresses'

export function AddressForm() {
  const [label, setLabel] = useState('Maison')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [commune, setCommune] = useState('')
  const [isDefault, setIsDefault] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createAddressAction({
        label: label || 'Maison',
        line1,
        line2: line2 || undefined,
        commune: commune || undefined,
        isDefault,
      })
      if (!result.ok) {
        toast.error('Connecte-toi pour enregistrer une adresse')
        return
      }
      toast.success('Adresse ajoutée')
      setLabel('Maison')
      setLine1('')
      setLine2('')
      setCommune('')
      setIsDefault(false)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="card-grill space-y-4 p-5">
      <p className="font-display text-lg uppercase">Ajouter une adresse</p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="address-label">Libellé</Label>
          <Input id="address-label" value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Maison, Bureau…" />
        </div>
        <div>
          <Label htmlFor="address-commune">Commune</Label>
          <Input id="address-commune" value={commune} onChange={(e) => setCommune(e.target.value)} placeholder="Cocody, Riviera…" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="address-line1">Adresse</Label>
          <Input id="address-line1" required value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Rue, quartier, repère…" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="address-line2">Complément (optionnel)</Label>
          <Input id="address-line2" value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Étage, porte, bâtiment…" />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <Checkbox checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} /> Définir comme adresse par défaut
      </label>
      <button type="submit" disabled={isPending || line1.trim().length < 4} className="btn btn-primary disabled:opacity-60">
        <Plus size={16} /> {isPending ? 'Ajout…' : "Ajouter l'adresse"}
      </button>
    </form>
  )
}
