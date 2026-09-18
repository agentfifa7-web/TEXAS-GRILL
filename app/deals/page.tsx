import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { PromotionCard } from '@/components/shared/promotion-card'
import { CouponPill } from '@/components/shared/coupon-pill'

export const metadata: Metadata = {
  title: 'Deals',
  description: 'Promotions, happy hours et codes promo actifs chez Texas Grill Abidjan.',
}

export default async function DealsPage() {
  const [promotions, coupons] = await Promise.all([
    prisma.promotion.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }),
    prisma.coupon.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }),
  ])

  return (
    <div className="container-grill section-py">
      <div className="mb-8">
        <p className="eyebrow">Bons plans</p>
        <h1 className="display-heading text-5xl sm:text-6xl">
          Nos <span className="text-fire">Deals.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Promotions en cours et codes promo à utiliser dès maintenant sur votre prochaine commande.
        </p>
      </div>

      {coupons.length > 0 && (
        <section className="mb-12">
          <h2 className="mb-4 font-display text-2xl uppercase tracking-wide">
            Codes <span className="text-fire">promo.</span>
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map((coupon) => (
              <CouponPill key={coupon.id} coupon={coupon} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-4 font-display text-2xl uppercase tracking-wide">
          Promotions <span className="text-fire">actives.</span>
        </h2>
        {promotions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucune promotion active pour le moment. Revenez bientôt !</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {promotions.map((promotion) => (
              <PromotionCard key={promotion.id} promotion={promotion} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
