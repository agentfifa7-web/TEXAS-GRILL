'use client'

import { Suspense, useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from 'next-auth/react'
import { toast } from 'sonner'
import { LogIn } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { mergeCartAfterLogin } from '@/lib/actions/cart'

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const result = await signIn('credentials', { email, password, redirect: false })
      if (!result || !result.ok) {
        toast.error('Email ou mot de passe incorrect')
        return
      }
      await mergeCartAfterLogin()
      toast.success('Bon retour parmi nous 🔥')
      router.push(callbackUrl ?? '/account')
      router.refresh()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="vous@exemple.com"
        />
      </div>
      <div>
        <Label htmlFor="password">Mot de passe</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
        />
      </div>
      <button type="submit" disabled={submitting} className="btn btn-primary w-full disabled:opacity-60">
        <LogIn size={16} /> {submitting ? 'Connexion…' : 'Se connecter'}
      </button>
    </form>
  )
}

export default function LoginPage() {
  return (
    <div className="container-grill section-py max-w-md">
      <p className="eyebrow">Bon retour</p>
      <h1 className="display-heading mb-8 text-4xl sm:text-5xl">
        Se <span className="text-fire">connecter.</span>
      </h1>

      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>

      <p className="mt-5 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{' '}
        <Link href="/register" className="font-bold text-fire">
          Créer un compte
        </Link>
      </p>

      <div className="mt-8 rounded-xl border border-border bg-muted/40 p-4 text-xs text-muted-foreground">
        <p className="mb-2 font-bold uppercase tracking-wide text-foreground">Comptes de démonstration</p>
        <ul className="space-y-1">
          <li>
            <strong className="text-foreground">Admin</strong> — admin@texasgrill.demo / TexasAdmin#2026
          </li>
          <li>
            <strong className="text-foreground">Manager</strong> — manager@texasgrill.demo / Manager#2026
          </li>
          <li>
            <strong className="text-foreground">Client</strong> — client@texasgrill.demo / Customer#2026
          </li>
        </ul>
      </div>
    </div>
  )
}
