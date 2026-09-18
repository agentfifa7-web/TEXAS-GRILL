'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Calendar, Check, PartyPopper, Users, Wallet } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { submitEventRequestAction } from '@/lib/actions/events-corporate'
import { EVENT_TYPES } from '@/lib/constants'
import type { EventRequestInput } from '@/lib/validations'
import { cn } from '@/lib/utils'

interface Restaurant {
  id: string
  name: string
}

const EMPTY_FORM: EventRequestInput = {
  type: 'BIRTHDAY',
  date: '',
  guestCount: 10,
  budget: undefined,
  restaurantId: '',
  message: '',
  name: '',
  phone: '',
  email: '',
}

export function EventRequestForm({ restaurants }: { restaurants: Restaurant[] }) {
  const [form, setForm] = useState<EventRequestInput>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function update<K extends keyof EventRequestInput>(key: K, value: EventRequestInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.date || !form.guestCount || !form.name.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Merci de remplir tous les champs obligatoires.')
      return
    }

    setSubmitting(true)
    try {
      const result = await submitEventRequestAction({
        ...form,
        restaurantId: form.restaurantId || undefined,
        budget: form.budget || undefined,
        message: form.message || undefined,
      })
      if (result.ok) {
        setSubmitted(true)
        toast.success('Demande envoyée avec succès !')
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue, réessayez.'
      setError(message)
      toast.error(message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="card-grill mx-auto max-w-lg p-8 text-center">
        <div className="mx-auto mb-4 grid size-14 place-items-center rounded-full bg-[var(--success)] text-white">
          <Check size={28} />
        </div>
        <h2 className="display-heading text-3xl">
          Demande <span className="text-fire">envoyée.</span>
        </h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Votre demande a été transmise, notre équipe vous recontactera sous 24h.
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link href="/restaurants" className="btn btn-outline">
            Voir les restaurants
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="type">
            <PartyPopper size={12} className="mr-1 inline" /> Type d&apos;événement *
          </Label>
          <Select id="type" value={form.type} onChange={(e) => update('type', e.target.value as EventRequestInput['type'])} required>
            {Object.entries(EVENT_TYPES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="restaurant">Restaurant souhaité</Label>
          <Select id="restaurant" value={form.restaurantId ?? ''} onChange={(e) => update('restaurantId', e.target.value)}>
            <option value="">Pas de préférence</option>
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </Select>
        </div>
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
          <Label htmlFor="guestCount">
            <Users size={12} className="mr-1 inline" /> Nombre d&apos;invités *
          </Label>
          <Input
            id="guestCount"
            type="number"
            min={1}
            max={1000}
            value={form.guestCount}
            onChange={(e) => update('guestCount', Number(e.target.value))}
            required
          />
        </div>
        <div>
          <Label htmlFor="budget">
            <Wallet size={12} className="mr-1 inline" /> Budget (FCFA)
          </Label>
          <Input
            id="budget"
            type="number"
            min={0}
            placeholder="Optionnel"
            value={form.budget ?? ''}
            onChange={(e) => update('budget', e.target.value ? Number(e.target.value) : undefined)}
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
        <Label htmlFor="email">Email *</Label>
        <Input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="message">Votre demande</Label>
        <Textarea
          id="message"
          placeholder="Précisez vos attentes : décoration, menu, horaires, animation..."
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
        />
      </div>

      {error && <p className="text-sm font-bold text-destructive">{error}</p>}

      <button type="submit" disabled={submitting} className={cn('btn btn-primary w-full justify-center', submitting && 'opacity-60')}>
        {submitting ? 'Envoi en cours...' : 'Envoyer ma demande'}
      </button>
    </form>
  )
}
