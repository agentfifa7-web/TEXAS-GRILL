'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { ROLE_LABELS, type RoleKey } from '@/lib/constants'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { SignOutButton } from './sign-out-button'

export interface AdminNavItem {
  label: string
  href: string
}

export function AdminSidebar({ nav, userName, role }: { nav: AdminNavItem[]; userName: string; role: string }) {
  const pathname = usePathname()

  return (
    <aside className="border-b border-border bg-card lg:min-h-screen lg:border-b-0 lg:border-r">
      <div className="flex flex-col gap-4 p-5 lg:sticky lg:top-0">
        <div>
          <p className="font-display text-2xl uppercase tracking-wide text-fire">Texas Grill</p>
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Administration</p>
        </div>

        <div className="flex items-center gap-3 rounded-lg border border-border p-3">
          <Avatar name={userName} />
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{userName}</p>
            <Badge variant="outline" className="mt-1">
              {ROLE_LABELS[role as RoleKey] ?? role}
            </Badge>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {nav.map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-lg px-3 py-2.5 text-sm font-bold transition-colors',
                  active ? 'bg-ink text-cream' : 'text-foreground/80 hover:bg-muted'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="mt-2 flex flex-col gap-2 border-t border-border pt-4">
          <Link href="/" className="btn btn-outline btn-sm w-full">
            <ArrowLeft size={14} /> Retour au site
          </Link>
          <SignOutButton />
        </div>
      </div>
    </aside>
  )
}
