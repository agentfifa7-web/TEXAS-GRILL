import Link from 'next/link'
import { Flame, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-grill flex min-h-[70vh] flex-col items-center justify-center gap-4 py-20 text-center">
      <div className="grid size-16 place-items-center rounded-full bg-fire text-white">
        <Flame size={28} fill="currentColor" />
      </div>
      <h1 className="display-heading text-5xl sm:text-6xl">
        Looks like your grill <span className="text-fire">got lost.</span>
      </h1>
      <p className="max-w-sm text-muted-foreground">
        Cette page n&apos;existe pas ou a été déplacée. Pas de panique, le menu vous attend toujours.
      </p>
      <Link href="/menu" className="btn btn-primary mt-3">
        Retourner au menu <ArrowRight size={16} />
      </Link>
    </div>
  )
}
