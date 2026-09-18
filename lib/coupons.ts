import 'server-only'
import { prisma } from '@/lib/prisma'

export interface CouponResult {
  valid: boolean
  error?: string
  discount: number
  freeDelivery: boolean
  code?: string
}

export async function validateCoupon(code: string | undefined, subtotal: number, userId?: string): Promise<CouponResult> {
  if (!code) return { valid: false, discount: 0, freeDelivery: false }

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (!coupon || !coupon.isActive) return { valid: false, error: 'Coupon introuvable', discount: 0, freeDelivery: false }

  const now = new Date()
  if (coupon.startsAt && now < coupon.startsAt) return { valid: false, error: 'Coupon pas encore actif', discount: 0, freeDelivery: false }
  if (coupon.endsAt && now > coupon.endsAt) return { valid: false, error: 'Coupon expiré', discount: 0, freeDelivery: false }
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return { valid: false, error: 'Coupon épuisé', discount: 0, freeDelivery: false }
  if (coupon.minOrderAmount && subtotal < coupon.minOrderAmount) {
    return { valid: false, error: `Minimum de commande: ${coupon.minOrderAmount} FCFA`, discount: 0, freeDelivery: false }
  }

  if (userId) {
    const usageCount = await prisma.order.count({ where: { userId, couponCode: coupon.code } })
    if (usageCount >= coupon.perUserLimit) {
      return { valid: false, error: 'Vous avez déjà utilisé ce coupon', discount: 0, freeDelivery: false }
    }
  }

  if (coupon.type === 'FREE_DELIVERY') {
    return { valid: true, discount: 0, freeDelivery: true, code: coupon.code }
  }
  if (coupon.type === 'PERCENT') {
    return { valid: true, discount: Math.round((subtotal * coupon.value) / 100), freeDelivery: false, code: coupon.code }
  }
  return { valid: true, discount: Math.min(coupon.value, subtotal), freeDelivery: false, code: coupon.code }
}
