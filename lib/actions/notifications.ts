'use server'

import { prisma } from '@/lib/prisma'
import { getServerSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function markNotificationReadAction(id: string) {
  const session = await getServerSession()
  if (!session?.user?.id) return { ok: false as const, error: 'AUTH_REQUIRED' }

  const notification = await prisma.notification.findFirst({ where: { id, userId: session.user.id } })
  if (!notification) return { ok: false as const, error: 'NOT_FOUND' }

  await prisma.notification.update({ where: { id }, data: { isRead: true } })
  revalidatePath('/account/notifications')
  return { ok: true as const }
}
