'use client'

import { usePathname } from 'next/navigation'
import { ShoppingBag } from 'lucide-react'
import { useCart } from '@/components/providers/cart-provider'

export function FloatingOrderButton() {
  const { count, openDrawer } = useCart()
  const pathname = usePathname()

  if (pathname?.startsWith('/admin') || pathname === '/cart' || pathname === '/checkout') return null

  return (
    <button
      onClick={openDrawer}
      className="btn btn-primary fixed bottom-4 left-1/2 z-40 -translate-x-1/2 shadow-2xl lg:hidden"
      aria-label="Ouvrir le panier"
    >
      <ShoppingBag size={17} /> Commander {count > 0 && <b className="grid size-[19px] place-items-center rounded-full bg-ink text-[10px]">{count}</b>}
    </button>
  )
}
