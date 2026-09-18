'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState, useTransition } from 'react'
import { toast } from 'sonner'
import {
  addToCartAction,
  updateCartItemAction,
  removeCartItemAction,
  setCartOrderTypeAction,
  getCartSummary,
} from '@/lib/actions/cart'
import type { AddToCartInput } from '@/lib/validations'

export interface CartItemView {
  id: string
  productId: string
  quantity: number
  unitPrice: number
  subtotal: number
  note?: string | null
  selectedOptions: { label: string; priceDelta: number }[]
  selectedAddons: { name: string; price: number; quantity: number }[]
  product: { id: string; name: string; slug: string; imagesJson: string; category: { name: string } }
}

interface CartState {
  items: CartItemView[]
  subtotal: number
  count: number
  orderType: 'DELIVERY' | 'PICKUP' | 'DINE_IN'
}

interface CartContextValue extends CartState {
  isDrawerOpen: boolean
  isPending: boolean
  openDrawer: () => void
  closeDrawer: () => void
  addItem: (input: AddToCartInput) => Promise<void>
  updateItem: (itemId: string, quantity: number) => Promise<void>
  removeItem: (itemId: string) => Promise<void>
  setOrderType: (type: CartState['orderType'], restaurantId?: string) => Promise<void>
  refresh: () => Promise<void>
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({
  initialCart,
  children,
}: {
  initialCart: CartState
  children: React.ReactNode
}) {
  const [state, setState] = useState<CartState>(initialCart)
  const [isDrawerOpen, setDrawerOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  const refresh = useCallback(async () => {
    const summary = await getCartSummary()
    setState({
      items: summary.items as unknown as CartItemView[],
      subtotal: summary.subtotal,
      count: summary.count,
      orderType: summary.cart.orderType as CartState['orderType'],
    })
  }, [])

  const addItem = useCallback(
    async (input: AddToCartInput) => {
      const result = await addToCartAction(input)
      if (!result.ok) {
        toast.error(result.error ?? "Impossible d'ajouter ce produit")
        return
      }
      await refresh()
      toast.success('Ajouté au panier 🔥')
      setDrawerOpen(true)
    },
    [refresh]
  )

  const updateItem = useCallback(
    async (itemId: string, quantity: number) => {
      startTransition(async () => {
        await updateCartItemAction(itemId, quantity)
        await refresh()
      })
    },
    [refresh]
  )

  const removeItem = useCallback(
    async (itemId: string) => {
      await removeCartItemAction(itemId)
      await refresh()
    },
    [refresh]
  )

  const setOrderType = useCallback(
    async (type: CartState['orderType'], restaurantId?: string) => {
      await setCartOrderTypeAction(type, restaurantId)
      await refresh()
    },
    [refresh]
  )

  useEffect(() => {
    // Reconciles with the authoritative cart on mount — this runs as a real
    // Server Action invocation (unlike the layout's read-only SSR fetch), so
    // it can safely create the guest cart cookie on a visitor's first load.
    refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<CartContextValue>(
    () => ({
      ...state,
      isDrawerOpen,
      isPending,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
      addItem,
      updateItem,
      removeItem,
      setOrderType,
      refresh,
    }),
    [state, isDrawerOpen, isPending, addItem, updateItem, removeItem, setOrderType, refresh]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
