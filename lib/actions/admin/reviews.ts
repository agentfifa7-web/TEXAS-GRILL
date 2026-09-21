'use server'

import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'

type ActionResult = { ok: true } | { ok: false; error: string }

async function requireReviewsManage() {
  const session = await getServerSession()
  if (!session?.user || !can(session.user.role, 'reviews:manage')) return null
  return session
}

export async function moderateReviewAction(id: string, status: 'PENDING' | 'PUBLISHED' | 'HIDDEN'): Promise<ActionResult> {
  const session = await requireReviewsManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  await prisma.review.update({ where: { id }, data: { status } })
  revalidatePath('/admin/reviews')
  return { ok: true }
}

export async function replyToReviewAction(id: string, adminReply: string): Promise<ActionResult> {
  const session = await requireReviewsManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  await prisma.review.update({ where: { id }, data: { adminReply } })
  revalidatePath('/admin/reviews')
  return { ok: true }
}
