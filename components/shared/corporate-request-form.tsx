'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Building2, Check, Mail, Phone, Truck, Users, Wallet } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { submitCorporateRequestAction } from '@/lib/actions/events-corporate'
import type { CorporateRequestInput } from '@/lib/validations'
import { cn } from '@/lib/utils'

const DELIVERY_FREQUENCIES = ['Ponctuel', 'Hebdomadaire', 'Mensuel'] as const

const EMPTY_FORM: CorporateRequestInput = {
  companyName: '',
  contactName: '',
  phone: '',
  email: '',
  employeeCount: undefined,
  deliveryFrequency: DELIVERY_FREQUENCIES[0],
  budget: undefined,
  message: '',
}

export function CorporateRequestForm() {
  const [form, setForm] = useState<CorporateRequestInput>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function update<K extends keyof CorporateRequestInput>(key: K, value: CorporateRequestInput[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!form.companyName.trim() || !form.contactName.trim() || !form.phone.trim() || !form.email.trim()) {
      setError('Merci de remplir tous les champs obligatoires.')
      return
    }

    setSubmitting(true)
    try {
      const result = await submitCorporateRequestAction({
        ...form,
        employeeCount: form.employeeCount || undefined,
        budget: form.budget || undefined,
        message: form.message || undefined,
      })
      if (result.ok) {
        setSubmitted(true)
        toast.success('Demande de devis envoyée avec succès !')
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="companyName">
            <Building2 size={12} className="mr-1 inline" /> Nom de l&apos;entreprise *
          </Label>
          <Input id="companyName" value={form.companyName} onChange={(e) => update('companyName', e.target.value)} required />
        </div>
        <div>
          <Label htmlFor="contactName">Nom du contact *</Label>
          <Input id="contactName" value={form.contactName} onChange={(e) => update('contactName', e.target.value)} required />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">
            <Phone size={12} className="mr-1 inline" /> Téléphone *
          </Label>
          <Input
            id="phone"
            type="tel"
            placeholder="+225 07 00 00 00 00"
            value={form.phone}
            onChange={(e) => update('phone', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="email">
            <Mail size={12} className="mr-1 inline" /> Email *
          </Label>
          <Input id="email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div>
          <Label htmlFor="employeeCount">
            <Users size={12} className="mr-1 inline" /> Nombre d&apos;employés
          </Label>
          <Input
            id="employeeCount"
            type="number"
            min={1}
            placeholder="Optionnel"
            value={form.employeeCount ?? ''}
            onChange={(e) => update('employeeCount', e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
        <div>
          <Label htmlFor="deliveryFrequency">
            <Truck size={12} className="mr-1 inline" /> Fréquence de livraison
          </Label>
          <Select
            id="deliveryFrequency"
            value={form.deliveryFrequency ?? ''}
            onChange={(e) => update('deliveryFrequency', e.target.value)}
          >
            {DELIVERY_FREQUENCIES.map((freq) => (
              <option key={freq} value={freq}>
                {freq}
              </option>
            ))}
          </Select>
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

      <div>
        <Label htmlFor="message">Votre demande</Label>
        <Textarea
          id="message"
          placeholder="Décrivez votre besoin : commande entreprise, devis, livraison groupée, facturation..."
          value={form.message}
          onChange={(e) => update('message', e.target.value)}
        />
      </div>

      {error && <p className="text-sm font-bold text-destructive">{error}</p>}

      <button type="submit" disabled={submitting} className={cn('btn btn-primary w-full justify-center', submitting && 'opacity-60')}>
        {submitting ? 'Envoi en cours...' : 'Demander un devis'}
      </button>
    </form>
  )
}
