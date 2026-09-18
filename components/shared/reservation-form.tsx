'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Calendar, Check, PartyPopper, Users } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { submitReservationAction } from '@/lib/actions/reservation'
import type { ReservationInput } from '@/lib/validations'
import { cn } from '@/lib/utils'

interface Restaurant {
  id: string
  slug: string
  name: string
}

export function ReservationForm({ restaurants, defaultSlug }: { restaurants: Restaurant[]; defaultSlug?: string }) {
  const defaultRestaurant = restaurants.find((r) => r.slug === defaultSlug) ?? restaurants[0]

  const [form, setForm] = useState<ReservationInput>({
    restaurantId: defaultRestaurant?.id ?? '',
    date: '',
    time: '',
    partySize: 2,
    name: '',
    phone: '',
    email: '',
    specialRequest: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confirmation, setConfirmation] = useState<{ code: string } | null>(null)

  function update<K extends keyof ReservationInput>(key: K, value: ReservationInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.restaurantId || !form.date || !form.time || !form.name.trim() || !form.phone.trim()) {
      setError('Merci de remplir tous les champs obligatoires.')
      return
    }

    setSubmitting(true)
    try {
      const result = await submitReservationAction(form)
      if (result.ok) {
        setConfirmation({ code: result.code })
        toast.success('Réservation envoyée avec succès !')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue, réessayez.'
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmation) {
    return (
      <div className="card-grill mx-auto max-w-lg p-8 text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-[var(--success)] text-white">
          <Check size={28} />
        </div>
        <h2 className="display-heading text-3xl">
          Réservation <span className="text-fire">confirmée.</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Votre demande a été transmise au restaurant. Votre code de réservation :
        </p>
        <p className="price-tag mt-4 text-2xl tracking-wide">{confirmation.code}</p>
        <p className="mt-3 text-xs text-muted-foreground">
          Vous recevrez une confirmation par téléphone. Présentez ce code à votre arrivée.
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link href="/menu" className="btn btn-outline">
            Voir le menu
          </Link>
          <Link href="/" className="btn btn-primary">
            Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card-grill mx-auto max-w-2xl space-y-5 p-6 sm:p-8">
      <div>
        <Label htmlFor="restaurant">Restaurant *</Label>
        <Select
          id="restaurant"
          value={form.restaurantId}
          onChange={(e) => update('restaurantId', e.target.value)}
          required
        >
          <option value="" disabled>
            Choisissez un restaurant
          </option>
          {restaurants.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <Label htmlFor="date">
            <Calendar size={12} className="mr-1 inline" /> Date *
          </Label>
          <Input
            id="date"
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={form.date}
            onChange={(e) => update('date', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="time">Heure *</Label>
          <Input id="time" type="time" value={form.time} onChange={(e) => update('time', e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="partySize">
            <Users size={12} className="mr-1 inline" /> Convives *
          </Label>
          <Input
            id="partySize"
            type="number"
            min={1}
            max={40}
            value={form.partySize}
            onChange={(e) => update('partySize', Number(e.target.value))}
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Nom complet *</Label>
          <Input id="name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="phone">Téléphone *</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+225 07 00 00 00 00"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
      </div>

      <div>
        <Label htmlFor="specialRequest">
          <PartyPopper size={12} className="mr-1 inline" /> Demande spéciale
        </Label>
        <Textarea
          id="specialRequest"
          placeholder="Anniversaire, allergie, table en terrasse..."
          value={form.specialRequest}
          onChange={(e) => update('specialRequest', e.target.value)}
        />
      </div>

      {error && <p className="text-sm font-bold text-destructive">{error}</p>}

      <button type="submit" disabled={submitting} className={cn('btn btn-primary w-full justify-center', submitting && 'opacity-60')}>
        {submitting ? 'Envoi en cours...' : 'Confirmer la réservation'}
      </button>
    </form>
  )
}
