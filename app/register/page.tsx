'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { UserPlus } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { registerAction } from '@/lib/actions/auth'
import { mergeCartAfterLogin } from '@/lib/actions/cart'
import type { RegisterInput } from '@/lib/validations'

const INITIAL_FORM: RegisterInput = { name: '', email: '', phone: '', password: '' }

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState<RegisterInput>(INITIAL_FORM)
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof RegisterInput>(key: K, value: RegisterInput[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const result = await registerAction(form)
      if (!result.ok) {
        toast.error(result.error)
        return
      }

      const signInResult = await signIn('credentials', { email: form.email, password: form.password, redirect: false })
      if (!signInResult?.ok) {
        toast.success('Compte créé — connecte-toi pour continuer.')
        router.push('/login')
        return
      }

      await mergeCartAfterLogin()
      toast.success('Bienvenue chez Texas Grill 🔥')
      router.push('/account')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue — vérifie les champs du formulaire')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container-grill section-py max-w-md">
      <p className="eyebrow">Rejoins le club</p>
      <h1 className="display-heading mb-8 text-4xl sm:text-5xl">
        Créer un <span className="text-fire">compte.</span>
      </h1>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="name">Nom complet</Label>
          <Input id="name" autoComplete="name" required minLength={2} value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="Votre nom" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            placeholder="vous@exemple.com"
          />
        </div>
        <div>
          <Label htmlFor="phone">Téléphone (optionnel)</Label>
          <Input id="phone" type="tel" autoComplete="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+225 07 00 00 00 00" />
        </div>
        <div>
          <Label htmlFor="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update('password', e.target.value)}
            placeholder="8 caractères minimum"
          />
        </div>
        <button type="submit" disabled={submitting} className="btn btn-primary w-full disabled:opacity-60">
          <UserPlus size={16} /> {submitting ? 'Création…' : 'Créer mon compte'}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Déjà client ?{' '}
        <Link href="/login" className="font-bold text-fire">
          Se connecter
        </Link>
      </p>
    </div>
  )
}
