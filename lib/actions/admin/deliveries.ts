'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { DELIVERY_STATUS } from '@/lib/constants'
import { revalidatePath } from 'next/cache'

type ActionResult = { ok: true } | { ok: false; error: string }

async function requireDeliveriesManage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !can(session.user.role, 'deliveries:manage')) return null
  return session
}

export async function assignDriverAction(deliveryId: string, driverId: string): Promise<ActionResult> {
  const session = await requireDeliveriesManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  const driver = await prisma.driver.findUnique({ where: { id: driverId } })
  if (!driver) return { ok: false, error: 'Livreur introuvable' }

  await prisma.$transaction([
    prisma.delivery.update({
      where: { id: deliveryId },
      data: { driverId, status: DELIVERY_STATUS.ASSIGNED, assignedAt: new Date() },
    }),
    prisma.driver.update({ where: { id: driverId }, data: { status: 'ON_DELIVERY' } }),
  ])

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'DELIVERY_DRIVER_ASSIGNED',
      entityType: 'Delivery',
      entityId: deliveryId,
      metadataJson: JSON.stringify({ driverId }),
    },
  })

  revalidatePath('/admin/deliveries')
  return { ok: true }
}

export async function updateDeliveryStatusAction(deliveryId: string, status: string): Promise<ActionResult> {
  const session = await requireDeliveriesManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  const validStatuses = Object.values(DELIVERY_STATUS) as string[]
  if (!validStatuses.includes(status)) return { ok: false, error: 'Statut invalide' }

  const data: Record<string, unknown> = { status }
  if (status === 'PICKED_UP') data.pickedUpAt = new Date()
  if (status === 'DELIVERED') data.deliveredAt = new Date()

  const delivery = await prisma.delivery.update({ where: { id: deliveryId }, data })

  if (status === 'DELIVERED' && delivery.driverId) {
    await prisma.driver.update({ where: { id: delivery.driverId }, data: { status: 'AVAILABLE' } })
  }

  revalidatePath('/admin/deliveries')
  return { ok: true }
}
