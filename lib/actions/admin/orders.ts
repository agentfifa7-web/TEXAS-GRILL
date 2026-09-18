'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { ORDER_STATUS } from '@/lib/constants'
import { getPaymentProvider } from '@/lib/services/payment'
import { revalidatePath } from 'next/cache'

type ActionResult = { ok: true } | { ok: false; error: string }

async function requireOrdersManage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !can(session.user.role, 'orders:manage')) {
    return { session: null, error: 'Permission refusée' as const }
  }
  return { session, error: null }
}

export async function updateOrderStatusAction(orderId: string, status: string): Promise<ActionResult> {
  const { session, error } = await requireOrdersManage()
  if (!session) return { ok: false, error: error ?? 'Permission refusée' }

  const validStatuses = Object.values(ORDER_STATUS) as string[]
  if (!validStatuses.includes(status)) {
    return { ok: false, error: 'Statut invalide' }
  }

  const existing = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } })
  if (!existing) return { ok: false, error: 'Commande introuvable' }

  await prisma.order.update({ where: { id: orderId }, data: { status } })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'ORDER_STATUS_UPDATE',
      entityType: 'Order',
      entityId: orderId,
      metadataJson: JSON.stringify({ from: existing.status, to: status }),
    },
  })

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  return { ok: true }
}

export async function cancelOrderAction(orderId: string, reason?: string): Promise<ActionResult> {
  const { session, error } = await requireOrdersManage()
  if (!session) return { ok: false, error: error ?? 'Permission refusée' }

  const existing = await prisma.order.findUnique({ where: { id: orderId }, select: { status: true } })
  if (!existing) return { ok: false, error: 'Commande introuvable' }

  await prisma.order.update({ where: { id: orderId }, data: { status: ORDER_STATUS.CANCELLED } })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'ORDER_CANCELLED',
      entityType: 'Order',
      entityId: orderId,
      metadataJson: JSON.stringify({ from: existing.status, reason: reason ?? null }),
    },
  })

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  return { ok: true }
}

export async function refundOrderAction(orderId: string): Promise<ActionResult> {
  const { session, error } = await requireOrdersManage()
  if (!session) return { ok: false, error: error ?? 'Permission refusée' }

  const payment = await prisma.payment.findUnique({ where: { orderId } })
  if (!payment) return { ok: false, error: 'Aucun paiement associé à cette commande' }
  if (!payment.transactionRef) return { ok: false, error: 'Référence de transaction manquante' }
  if (payment.status === 'REFUNDED') return { ok: false, error: 'Ce paiement a déjà été remboursé' }

  const provider = getPaymentProvider()
  try {
    await provider.refundPayment(payment.transactionRef, payment.amount)
  } catch {
    return { ok: false, error: 'Le remboursement a échoué auprès du fournisseur de paiement' }
  }

  await prisma.payment.update({ where: { orderId }, data: { status: 'REFUNDED' } })

  await prisma.auditLog.create({
    data: {
      actorId: session.user.id,
      action: 'ORDER_REFUNDED',
      entityType: 'Order',
      entityId: orderId,
      metadataJson: JSON.stringify({ transactionRef: payment.transactionRef, amount: payment.amount }),
    },
  })

  revalidatePath('/admin/orders')
  revalidatePath(`/admin/orders/${orderId}`)
  return { ok: true }
}
