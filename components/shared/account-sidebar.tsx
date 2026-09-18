'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { LayoutDashboard, Package, Heart, CalendarClock, MapPin, Wallet, Gift, Bell, LogOut, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AccountNavLink {
  href: string
  label: string
  icon: LucideIcon
  exact?: boolean
}

const LINKS: AccountNavLink[] = [
  { href: '/account', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { href: '/account/orders', label: 'Commandes', icon: Package },
  { href: '/account/favorites', label: 'Favoris', icon: Heart },
  { href: '/account/reservations', label: 'Réservations', icon: CalendarClock },
  { href: '/account/addresses', label: 'Adresses', icon: MapPin },
  { href: '/account/payment-methods', label: 'Moyens de paiement', icon: Wallet },
  { href: '/account/coupons', label: 'Coupons & Récompenses', icon: Gift },
  { href: '/account/notifications', label: 'Notifications', icon: Bell },
]

export function AccountSidebar({ userName }: { userName: string }) {
  const pathname = usePathname()

  return (
    <aside className="h-fit rounded-xl border border-border bg-card p-4 shadow-sm lg:sticky lg:top-24">
      <div className="mb-4 border-b border-border px-2 pb-4">
        <p className="text-xs font-bold uppercase text-muted-foreground">Bonjour</p>
        <p className="truncate font-display text-lg uppercase leading-tight">{userName}</p>
      </div>
      <nav className="space-y-1">
        {LINKS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors',
                active ? 'bg-fire/10 text-fire' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon size={16} /> {label}
            </Link>
          )
        })}
      </nav>
      <button
        onClick={() => signOut({ callbackUrl: '/' })}
        className="mt-4 flex w-full items-center gap-2.5 rounded-lg border-t border-border px-3 pt-4 text-sm font-semibold text-muted-foreground transition-colors hover:text-destructive"
      >
        <LogOut size={16} /> Se déconnecter
      </button>
    </aside>
  )
}
