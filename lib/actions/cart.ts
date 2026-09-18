'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getOrCreateCart, peekCart, mergeGuestCartIntoUser } from '@/lib/cart-session'
import { addToCartSchema, updateCartItemSchema, type AddToCartInput } from '@/lib/validations'
import { parseJson, toJson } from '@/lib/json'

function computeItemSubtotal(unitPrice: number, quantity: number, addons: AddToCartInput['selectedAddons']) {
  const addonsTotal = addons.reduce((sum, a) => sum + a.price * a.quantity, 0)
  return (unitPrice + addonsTotal) * quantity
}

export async function addToCartAction(input: AddToCartInput) {
  const parsed = addToCartSchema.parse(input)
  const product = await prisma.product.findUnique({ where: { id: parsed.productId } })
  if (!product || !product.isAvailable) return { ok: false, error: 'Produit indisponible' }

  const cart = await getOrCreateCart()
  const optionsDelta = parsed.selectedOptions.reduce((sum, o) => sum + o.priceDelta, 0)
  const unitPrice = product.price + optionsDelta
  const subtotal = computeItemSubtotal(unitPrice, parsed.quantity, parsed.selectedAddons)

  await prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId: product.id,
      quantity: parsed.quantity,
      unitPrice,
      selectedOptionsJson: toJson(parsed.selectedOptions),
      selectedAddonsJson: toJson(parsed.selectedAddons),
      note: parsed.note,
      subtotal,
    },
  })
  await prisma.cart.update({ where: { id: cart.id }, data: { restaurantId: cart.restaurantId ?? undefined } })

  revalidatePath('/cart')
  revalidatePath('/menu')
  return { ok: true }
}

export async function updateCartItemAction(itemId: string, quantity: number) {
  const parsed = updateCartItemSchema.parse({ itemId, quantity })
  if (parsed.quantity === 0) {
    await prisma.cartItem.delete({ where: { id: parsed.itemId } })
  } else {
    const item = await prisma.cartItem.findUnique({ where: { id: parsed.itemId } })
    if (!item) return { ok: false }
    const addons = parseJson<{ price: number; quantity: number }[]>(item.selectedAddonsJson, [])
    const addonsTotal = addons.reduce((sum, a) => sum + a.price * a.quantity, 0)
    await prisma.cartItem.update({
      where: { id: parsed.itemId },
      data: { quantity: parsed.quantity, subtotal: (item.unitPrice + addonsTotal) * parsed.quantity },
    })
  }
  revalidatePath('/cart')
  return { ok: true }
}

export async function removeCartItemAction(itemId: string) {
  await prisma.cartItem.delete({ where: { id: itemId } }).catch(() => null)
  revalidatePath('/cart')
  return { ok: true }
}

export async function setCartOrderTypeAction(orderType: 'DELIVERY' | 'PICKUP' | 'DINE_IN', restaurantId?: string) {
  const cart = await getOrCreateCart()
  await prisma.cart.update({ where: { id: cart.id }, data: { orderType, restaurantId } })
  revalidatePath('/cart')
  revalidatePath('/checkout')
  return { ok: true }
}

async function summarizeCart(cartId: string | null) {
  if (!cartId) return { items: [], subtotal: 0, count: 0 }

  const items = await prisma.cartItem.findMany({
    where: { cartId },
    include: { product: { include: { category: true } } },
    orderBy: { id: 'asc' },
  })

  const enrichedItems = items.map((item) => ({
    ...item,
    selectedOptions: parseJson<{ label: string; priceDelta: number }[]>(item.selectedOptionsJson, []),
    selectedAddons: parseJson<{ name: string; price: number; quantity: number }[]>(item.selectedAddonsJson, []),
  }))

  const subtotal = enrichedItems.reduce((sum, item) => sum + item.subtotal, 0)
  return { items: enrichedItems, subtotal, count: enrichedItems.reduce((n, i) => n + i.quantity, 0) }
}

/** Used by client-side CartProvider (real Server Action — may set cookies). */
export async function getCartSummary() {
  const cart = await getOrCreateCart()
  const summary = await summarizeCart(cart.id)
  return { cart, ...summary }
}

/**
 * Used by the root layout during Server Component rendering, where cookies
 * cannot be set. Never creates a cart — returns an empty snapshot when the
 * visitor has none yet; CartProvider reconciles on mount.
 */
/**
 * Called client-side right after a successful next-auth signIn() — folds
 * the guest (cookie-based) cart into the now-authenticated user's cart.
 * Must run as a real Server Action (not during RSC render) since it may
 * need to clear the guest cart cookie.
 */
export async function mergeCartAfterLogin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { ok: false as const }
  await mergeGuestCartIntoUser(session.user.id)
  return { ok: true as const }
}

export async function getCartSummaryReadOnly() {
  const cart = await peekCart()
  const summary = await summarizeCart(cart?.id ?? null)
  return { cart, orderType: (cart?.orderType ?? 'DELIVERY') as 'DELIVERY' | 'PICKUP' | 'DINE_IN', ...summary }
}
