'use server'

import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'

type ActionResult = { ok: true } | { ok: false; error: string }

const VALID_STATUSES = ['NEW', 'QUOTED', 'CONFIRMED', 'DECLINED']

export async function updateCorporateStatusAction(id: string, status: string): Promise<ActionResult> {
  const session = await getServerSession()
  if (!session?.user || !can(session.user.role, 'corporate:manage')) {
    return { ok: false, error: 'Permission refusée' }
  }
  if (!VALID_STATUSES.includes(status)) return { ok: false, error: 'Statut invalide' }

  await prisma.corporateRequest.update({ where: { id }, data: { status } })
  revalidatePath('/admin/corporate')
  return { ok: true }
}
