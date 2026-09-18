'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Flame, Heart, Menu, ShoppingBag, User, X } from 'lucide-react'
import { useCart } from '@/components/providers/cart-provider'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/menu', label: 'Menu' },
  { href: '/build-your-grill', label: 'Build Your Grill' },
  { href: '/restaurants', label: 'Restaurants' },
  { href: '/deals', label: 'Deals' },
  { href: '/rewards', label: 'Rewards' },
  { href: '/events', label: 'Events' },
]

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const { count, openDrawer } = useCart()

  if (pathname?.startsWith('/admin')) return null

  return (
    <header className="relative z-30">
      <div className="bg-ink py-1.5 text-center text-[11px] font-bold uppercase tracking-wide text-cream">
        <Flame size={13} className="mr-1.5 inline-block text-fire" fill="currentColor" /> Fumé lentement. Fini au feu. Livraison
        partout à Abidjan.
      </div>
      <div className="container-grill flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2.5" aria-label="Texas Grill — accueil">
          <span className="grid size-10 place-items-center rounded-full bg-fire text-white">
            <Flame size={22} fill="currentColor" />
          </span>
          <span className="font-display text-xl uppercase leading-[0.8] tracking-wide">
            Texas<br />
            <em className="text-fire not-italic">Grill</em>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 text-[13px] font-bold lg:flex" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn('transition-colors hover:text-fire', pathname === link.href && 'text-fire')}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <Link
            href="/account/favorites"
            className="hidden rounded-full p-2.5 hover:bg-muted focus-ring sm:inline-flex"
            aria-label="Favoris"
          >
            <Heart size={19} />
          </Link>
          <button onClick={openDrawer} className="relative rounded-full p-2.5 hover:bg-muted focus-ring" aria-label="Panier">
            <ShoppingBag size={19} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid size-4.5 place-items-center rounded-full bg-fire text-[10px] font-bold text-white">
                {count}
              </span>
            )}
          </button>
          <Link
            href={session ? '/account' : '/login'}
            className="hidden rounded-full p-2.5 hover:bg-muted focus-ring sm:inline-flex"
            aria-label="Compte"
          >
            <User size={19} />
          </Link>
          <Link href="/menu" className="btn btn-dark ml-1 hidden md:inline-flex">
            <ShoppingBag size={16} /> Commander
          </Link>
          <button
            onClick={() => setMobileOpen((v) => !v)}
            className="rounded-full p-2.5 hover:bg-muted focus-ring lg:hidden"
            aria-label="Ouvrir le menu"
          >
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <nav className="container-grill flex flex-col gap-1 border-t border-border bg-background pb-4 lg:hidden" aria-label="Navigation mobile">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="rounded-lg px-2 py-3 text-sm font-bold hover:bg-muted"
            >
              {link.label}
            </Link>
          ))}
          <Link href="/account" onClick={() => setMobileOpen(false)} className="rounded-lg px-2 py-3 text-sm font-bold hover:bg-muted">
            Compte
          </Link>
        </nav>
      )}
    </header>
  )
}
