'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error('[texas-grill] unhandled error:', error)
  }, [error])

  return (
    <div className="container-grill flex min-h-[70vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-destructive text-white">
        <AlertTriangle size={28} />
      </div>
      <h1 className="display-heading text-4xl sm:text-5xl">Un imprévu en cuisine.</h1>
      <p className="max-w-sm text-muted-foreground">
        Une erreur inattendue est survenue. Notre équipe a été notifiée — réessayez ou retournez à l&apos;accueil.
      </p>
      <div className="mt-3 flex gap-3">
        <button onClick={reset} className="btn btn-primary">
          <RotateCcw size={16} /> Réessayer
        </button>
        <Link href="/" className="btn btn-outline">
          Accueil
        </Link>
      </div>
    </div>
  )
}
