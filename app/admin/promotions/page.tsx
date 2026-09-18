import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { AccessDenied } from '@/components/admin/access-denied'
import { PromotionsManager, type AdminCoupon, type AdminPromotion } from '@/components/admin/promotions-manager'

export default async function AdminPromotionsPage() {
  const session = await getServerSession(authOptions)
  if (!can(session?.user?.role, 'promotions:manage')) return <AccessDenied />

  const [coupons, promotions] = await Promise.all([
    prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.promotion.findMany({ orderBy: { createdAt: 'desc' } }),
  ])

  const couponRows: AdminCoupon[] = coupons.map((c) => ({
    id: c.id,
    code: c.code,
    type: c.type,
    value: c.value,
    minOrderAmount: c.minOrderAmount,
    maxUses: c.maxUses,
    usedCount: c.usedCount,
    perUserLimit: c.perUserLimit,
    isActive: c.isActive,
  }))

  const promotionRows: AdminPromotion[] = promotions.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    type: p.type,
    isActive: p.isActive,
    startsAt: p.startsAt ? p.startsAt.toISOString() : null,
    endsAt: p.endsAt ? p.endsAt.toISOString() : null,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Marketing</p>
        <h1 className="display-heading text-4xl sm:text-5xl">
          Coupons & <span className="text-fire">promotions.</span>
        </h1>
      </div>
      <PromotionsManager coupons={couponRows} promotions={promotionRows} />
    </div>
  )
}
