'use server'

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'

const movementSchema = z.object({
  itemId: z.string().min(1),
  type: z.enum(['IN', 'OUT', 'ADJUSTMENT', 'WASTE']),
  quantity: z.coerce.number(),
  reason: z.string().trim().max(280).optional().or(z.literal('')),
})

export type StockMovementInput = z.infer<typeof movementSchema>
export type ActionResult = { ok: true } | { ok: false; error: string }

export async function adjustStockAction(input: StockMovementInput): Promise<ActionResult> {
  const session = await getServerSession(authOptions)
  if (!session?.user || !can(session.user.role, 'stock:manage')) {
    return { ok: false, error: 'Permission refusée' }
  }

  const parsed = movementSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Formulaire invalide' }
  const { itemId, type, quantity, reason } = parsed.data

  if (type !== 'ADJUSTMENT' && quantity <= 0) {
    return { ok: false, error: 'La quantité doit être positive' }
  }

  const item = await prisma.inventoryItem.findUnique({ where: { id: itemId } })
  if (!item) return { ok: false, error: 'Article introuvable' }

  let newQuantity = item.quantity
  if (type === 'IN') newQuantity = item.quantity + quantity
  else if (type === 'OUT' || type === 'WASTE') newQuantity = Math.max(0, item.quantity - quantity)
  else if (type === 'ADJUSTMENT') newQuantity = quantity

  await prisma.$transaction([
    prisma.stockMovement.create({
      data: { itemId, type, quantity, reason: reason || null, createdBy: session.user.id },
    }),
    prisma.inventoryItem.update({ where: { id: itemId }, data: { quantity: newQuantity } }),
  ])

  revalidatePath('/admin/stock')
  return { ok: true }
}
