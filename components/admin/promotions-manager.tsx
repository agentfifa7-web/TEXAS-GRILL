'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Trash2 } from 'lucide-react'
import { PillTabs } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Switch } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { formatXOF, PROMOTION_TYPES } from '@/lib/constants'
import {
  createCouponAction,
  toggleCouponActiveAction,
  deleteCouponAction,
  createPromotionAction,
  togglePromotionActiveAction,
  deletePromotionAction,
  type CouponInput,
  type PromotionInput,
} from '@/lib/actions/admin/promotions'

export interface AdminCoupon {
  id: string
  code: string
  type: string
  value: number
  minOrderAmount: number | null
  maxUses: number | null
  usedCount: number
  perUserLimit: number
  isActive: boolean
}

export interface AdminPromotion {
  id: string
  title: string
  description: string | null
  type: string
  isActive: boolean
  startsAt: string | null
  endsAt: string | null
}

const TABS = [
  { value: 'coupons' as const, label: 'Coupons' },
  { value: 'promotions' as const, label: 'Promotions' },
]

export function PromotionsManager({ coupons, promotions }: { coupons: AdminCoupon[]; promotions: AdminPromotion[] }) {
  const [tab, setTab] = useState<'coupons' | 'promotions'>('coupons')

  return (
    <div className="flex flex-col gap-5">
      <PillTabs options={TABS} value={tab} onChange={setTab} />
      {tab === 'coupons' ? <CouponsPanel coupons={coupons} /> : <PromotionsPanel promotions={promotions} />}
    </div>
  )
}

function CouponsPanel({ coupons }: { coupons: AdminCoupon[] }) {
  const [code, setCode] = useState('')
  const [type, setType] = useState<CouponInput['type']>('PERCENT')
  const [value, setValue] = useState('')
  const [minOrderAmount, setMinOrderAmount] = useState('')
  const [maxUses, setMaxUses] = useState('')
  const [perUserLimit, setPerUserLimit] = useState('1')
  const [isPending, startTransition] = useTransition()

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createCouponAction({
        code,
        type,
        value: Number(value) || 0,
        minOrderAmount: minOrderAmount ? Number(minOrderAmount) : null,
        maxUses: maxUses ? Number(maxUses) : null,
        perUserLimit: Number(perUserLimit) || 1,
        isActive: true,
      })
      if (result.ok) {
        toast.success('Coupon créé')
        setCode('')
        setValue('')
        setMinOrderAmount('')
        setMaxUses('')
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleToggle(id: string, next: boolean) {
    startTransition(async () => {
      const result = await toggleCouponActiveAction(id, next)
      if (!result.ok) toast.error(result.error)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteCouponAction(id)
      if (result.ok) toast.success('Coupon supprimé')
      else toast.error(result.error)
    })
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Nouveau coupon</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div>
              <Label htmlFor="code">Code</Label>
              <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="couponType">Type</Label>
              <Select id="couponType" value={type} onChange={(e) => setType(e.target.value as CouponInput['type'])}>
                <option value="PERCENT">Pourcentage</option>
                <option value="FIXED">Montant fixe</option>
                <option value="FREE_DELIVERY">Livraison offerte</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="value">Valeur {type === 'PERCENT' ? '(%)' : type === 'FIXED' ? '(FCFA)' : ''}</Label>
              <Input id="value" type="number" value={value} onChange={(e) => setValue(e.target.value)} disabled={type === 'FREE_DELIVERY'} required={type !== 'FREE_DELIVERY'} />
            </div>
            <div>
              <Label htmlFor="minOrderAmount">Commande minimum (FCFA)</Label>
              <Input id="minOrderAmount" type="number" value={minOrderAmount} onChange={(e) => setMinOrderAmount(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="maxUses">Utilisations max (total)</Label>
              <Input id="maxUses" type="number" value={maxUses} onChange={(e) => setMaxUses(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="perUserLimit">Limite par client</Label>
              <Input id="perUserLimit" type="number" value={perUserLimit} onChange={(e) => setPerUserLimit(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm mt-1" disabled={isPending}>
              <Plus size={14} /> Créer le coupon
            </button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Code</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Valeur</TableHead>
            <TableHead>Utilisations</TableHead>
            <TableHead>Actif</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {coupons.map((c) => (
            <TableRow key={c.id}>
              <TableCell className="font-mono font-bold">{c.code}</TableCell>
              <TableCell>{c.type}</TableCell>
              <TableCell>{c.type === 'PERCENT' ? `${c.value}%` : c.type === 'FIXED' ? formatXOF(c.value) : '—'}</TableCell>
              <TableCell>
                {c.usedCount}
                {c.maxUses ? ` / ${c.maxUses}` : ''}
              </TableCell>
              <TableCell>
                <Switch checked={c.isActive} disabled={isPending} onChange={(e) => handleToggle(c.id, e.target.checked)} />
              </TableCell>
              <TableCell className="text-right">
                <button type="button" onClick={() => handleDelete(c.id)} aria-label="Supprimer" className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 size={16} />
                </button>
              </TableCell>
            </TableRow>
          ))}
          {coupons.length === 0 && (
            <TableRow>
              <TableCell colSpan={6} className="py-10 text-center text-sm text-muted-foreground">
                Aucun coupon pour le moment.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}

function PromotionsPanel({ promotions }: { promotions: AdminPromotion[] }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<PromotionInput['type']>('PERCENT')
  const [startsAt, setStartsAt] = useState('')
  const [endsAt, setEndsAt] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const result = await createPromotionAction({ title, description, type, isActive: true, startsAt, endsAt })
      if (result.ok) {
        toast.success('Promotion créée')
        setTitle('')
        setDescription('')
        setStartsAt('')
        setEndsAt('')
      } else {
        toast.error(result.error)
      }
    })
  }

  function handleToggle(id: string, next: boolean) {
    startTransition(async () => {
      const result = await togglePromotionActiveAction(id, next)
      if (!result.ok) toast.error(result.error)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deletePromotionAction(id)
      if (result.ok) toast.success('Promotion supprimée')
      else toast.error(result.error)
    })
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_1fr]">
      <Card className="h-fit">
        <CardHeader>
          <CardTitle>Nouvelle promotion</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="flex flex-col gap-3">
            <div>
              <Label htmlFor="title">Titre</Label>
              <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="promoType">Type</Label>
              <Select id="promoType" value={type} onChange={(e) => setType(e.target.value as PromotionInput['type'])}>
                {Object.keys(PROMOTION_TYPES).map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="startsAt">Début</Label>
              <Input id="startsAt" type="date" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="endsAt">Fin</Label>
              <Input id="endsAt" type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm mt-1" disabled={isPending}>
              <Plus size={14} /> Créer la promotion
            </button>
          </form>
        </CardContent>
      </Card>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Titre</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Période</TableHead>
            <TableHead>Actif</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {promotions.map((p) => (
            <TableRow key={p.id}>
              <TableCell>
                <p className="font-bold">{p.title}</p>
                {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
              </TableCell>
              <TableCell>
                <Badge variant="outline">{p.type}</Badge>
              </TableCell>
              <TableCell className="text-xs text-muted-foreground">
                {p.startsAt ? new Date(p.startsAt).toLocaleDateString('fr-FR') : '—'} → {p.endsAt ? new Date(p.endsAt).toLocaleDateString('fr-FR') : '—'}
              </TableCell>
              <TableCell>
                <Switch checked={p.isActive} disabled={isPending} onChange={(e) => handleToggle(p.id, e.target.checked)} />
              </TableCell>
              <TableCell className="text-right">
                <button type="button" onClick={() => handleDelete(p.id)} aria-label="Supprimer" className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive">
                  <Trash2 size={16} />
                </button>
              </TableCell>
            </TableRow>
          ))}
          {promotions.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                Aucune promotion pour le moment.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
