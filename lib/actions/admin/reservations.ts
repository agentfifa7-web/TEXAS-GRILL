'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { RESERVATION_STATUS } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

type ActionResult = { ok: true } | { ok: false; error: string }

export async function updateReservationStatusAction(id: string, status: string): Promise<ActionResult> {
  const session = await getServerSession(authOptions)
  if (!session?.user || !can(session.user.role, 'reservations:manage')) {
    return { ok: false, error: 'Permission refusée' }
  }

  const validStatuses = Object.values(RESERVATION_STATUS) as string[]
  if (!validStatuses.includes(status)) return { ok: false, error: 'Statut invalide' }

  await prisma.reservation.update({ where: { id }, data: { status } })

  revalidatePath('/admin/reservations')
  return { ok: true }
}
