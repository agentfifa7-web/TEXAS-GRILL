import 'server-only'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { randomUUID } from 'crypto'

const CART_COOKIE = 'tg_cart_session'

/**
 * Resolves the current cart for the signed-in user, or a guest cart
 * identified by an httpOnly cookie. Creates one on first use. When a guest
 * later logs in, the guest cart is merged into their account cart by
 * `mergeGuestCartIntoUser` (called from the login server action).
 */
export async function getOrCreateCart() {
  const session = await getServerSession()
  const cookieStore = await cookies()

  if (session?.user?.id) {
    const existing = await prisma.cart.findFirst({ where: { userId: session.user.id }, orderBy: { updatedAt: 'desc' } })
    if (existing) return existing
    return prisma.cart.create({ data: { userId: session.user.id } })
  }

  let token = cookieStore.get(CART_COOKIE)?.value
  if (token) {
    const existing = await prisma.cart.findUnique({ where: { sessionToken: token } })
    if (existing) return existing
  }

  token = randomUUID()
  cookieStore.set(CART_COOKIE, token, { httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30, path: '/' })
  return prisma.cart.create({ data: { sessionToken: token } })
}

/**
 * Read-only lookup safe to call during Server Component rendering (e.g. the
 * root layout), where Next.js forbids setting cookies. Returns null instead
 * of creating a cart/cookie when none exists yet — the client-side
 * CartProvider reconciles with the real `getOrCreateCart` (a Server Action,
 * which is allowed to set cookies) right after mount.
 */
export async function peekCart() {
  const session = await getServerSession()
  if (session?.user?.id) {
    return prisma.cart.findFirst({ where: { userId: session.user.id }, orderBy: { updatedAt: 'desc' } })
  }
  const cookieStore = await cookies()
  const token = cookieStore.get(CART_COOKIE)?.value
  if (!token) return null
  return prisma.cart.findUnique({ where: { sessionToken: token } })
}

export async function mergeGuestCartIntoUser(userId: string) {
  const cookieStore = await cookies()
  const token = cookieStore.get(CART_COOKIE)?.value
  if (!token) return

  const guestCart = await prisma.cart.findUnique({ where: { sessionToken: token }, include: { items: true } })
  if (!guestCart || guestCart.items.length === 0) return

  const userCart = await prisma.cart.findFirst({ where: { userId } })
  if (!userCart) {
    await prisma.cart.update({ where: { id: guestCart.id }, data: { userId, sessionToken: null } })
    return
  }

  for (const item of guestCart.items) {
    await prisma.cartItem.create({
      data: {
        cartId: userCart.id,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        selectedOptionsJson: item.selectedOptionsJson,
        selectedAddonsJson: item.selectedAddonsJson,
        note: item.note,
        subtotal: item.subtotal,
      },
    })
  }
  await prisma.cart.delete({ where: { id: guestCart.id } })
}
