'use client'

import { SessionProvider } from 'next-auth/react'
import type { Session } from 'next-auth'
import { CartProvider, type CartItemView } from '@/components/providers/cart-provider'
import { Toaster } from '@/components/ui/sonner'

export function Providers({
  children,
  initialCart,
  session,
}: {
  children: React.ReactNode
  initialCart: { items: CartItemView[]; subtotal: number; count: number; orderType: 'DELIVERY' | 'PICKUP' | 'DINE_IN' }
  session: Session | null
}) {
  return (
    <SessionProvider session={session}>
      <CartProvider initialCart={initialCart}>
        {children}
        <Toaster />
      </CartProvider>
    </SessionProvider>
  )
}
