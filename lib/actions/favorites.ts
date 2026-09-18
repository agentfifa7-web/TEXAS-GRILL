'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function toggleFavoriteAction(productId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { ok: false as const, error: 'AUTH_REQUIRED' }

  const existing = await prisma.favorite.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  })

  if (existing) {
    await prisma.favorite.delete({ where: { id: existing.id } })
    revalidatePath('/account/favorites')
    return { ok: true as const, favorited: false }
  }

  await prisma.favorite.create({ data: { userId: session.user.id, productId } })
  revalidatePath('/account/favorites')
  return { ok: true as const, favorited: true }
}

export async function getUserFavoriteIds(userId?: string) {
  if (!userId) return []
  const favorites = await prisma.favorite.findMany({ where: { userId }, select: { productId: true } })
  return favorites.map((f) => f.productId)
}
