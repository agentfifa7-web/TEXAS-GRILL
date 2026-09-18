'use server'

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'

type ActionResult = { ok: true } | { ok: false; error: string }

async function requirePromotionsManage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !can(session.user.role, 'promotions:manage')) return null
  return session
}

const couponSchema = z.object({
  code: z.string().trim().toUpperCase().min(3),
  type: z.enum(['PERCENT', 'FIXED', 'FREE_DELIVERY']),
  value: z.coerce.number().int().min(0),
  minOrderAmount: z.coerce.number().int().min(0).optional().nullable(),
  maxUses: z.coerce.number().int().min(1).optional().nullable(),
  perUserLimit: z.coerce.number().int().min(1).default(1),
  isActive: z.boolean().default(true),
})
export type CouponInput = z.infer<typeof couponSchema>

export async function createCouponAction(input: CouponInput): Promise<ActionResult> {
  const session = await requirePromotionsManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  const parsed = couponSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Formulaire invalide' }

  const existing = await prisma.coupon.findUnique({ where: { code: parsed.data.code } })
  if (existing) return { ok: false, error: 'Ce code coupon existe déjà' }

  await prisma.coupon.create({
    data: {
      code: parsed.data.code,
      type: parsed.data.type,
      value: parsed.data.value,
      minOrderAmount: parsed.data.minOrderAmount ?? null,
      maxUses: parsed.data.maxUses ?? null,
      perUserLimit: parsed.data.perUserLimit,
      isActive: parsed.data.isActive,
    },
  })

  revalidatePath('/admin/promotions')
  return { ok: true }
}

export async function toggleCouponActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const session = await requirePromotionsManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  await prisma.coupon.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/promotions')
  return { ok: true }
}

export async function deleteCouponAction(id: string): Promise<ActionResult> {
  const session = await requirePromotionsManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  await prisma.coupon.delete({ where: { id } })
  revalidatePath('/admin/promotions')
  return { ok: true }
}

const promotionSchema = z.object({
  title: z.string().trim().min(2),
  description: z.string().trim().optional().or(z.literal('')),
  type: z.enum(['PRODUCT', 'PERCENT', 'FIXED', 'COMBO', 'HAPPY_HOUR', 'BIRTHDAY', 'LOYALTY', 'RESTAURANT_SPECIFIC']),
  isActive: z.boolean().default(true),
  startsAt: z.string().optional().or(z.literal('')),
  endsAt: z.string().optional().or(z.literal('')),
})
export type PromotionInput = z.infer<typeof promotionSchema>

export async function createPromotionAction(input: PromotionInput): Promise<ActionResult> {
  const session = await requirePromotionsManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  const parsed = promotionSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Formulaire invalide' }

  await prisma.promotion.create({
    data: {
      title: parsed.data.title,
      description: parsed.data.description || null,
      type: parsed.data.type,
      isActive: parsed.data.isActive,
      startsAt: parsed.data.startsAt ? new Date(parsed.data.startsAt) : null,
      endsAt: parsed.data.endsAt ? new Date(parsed.data.endsAt) : null,
    },
  })

  revalidatePath('/admin/promotions')
  return { ok: true }
}

export async function togglePromotionActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const session = await requirePromotionsManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  await prisma.promotion.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/promotions')
  return { ok: true }
}

export async function deletePromotionAction(id: string): Promise<ActionResult> {
  const session = await requirePromotionsManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  await prisma.promotion.delete({ where: { id } })
  revalidatePath('/admin/promotions')
  return { ok: true }
}
