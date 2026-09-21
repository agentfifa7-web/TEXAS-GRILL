import { redirect } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrCreateLoyaltyAccount } from '@/lib/loyalty'
import { formatXOF, LOYALTY_TIER_CONFIG, type LoyaltyTier } from '@/lib/constants'
import { Gift, TrendingDown, TrendingUp } from 'lucide-react'
import { CouponPill } from './coupon-pill'

const COUPON_TYPE_LABELS: Record<string, string> = {
  PERCENT: 'Réduction %',
  FIXED: 'Réduction fixe',
  FREE_DELIVERY: 'Livraison offerte',
}

const TX_TYPE_LABELS: Record<string, string> = {
  EARN: 'Gagné',
  REDEEM: 'Échangé',
  BONUS: 'Bonus',
  EXPIRE: 'Expiré',
  REFERRAL: 'Parrainage',
  BIRTHDAY: 'Anniversaire',
}

export default async function AccountCouponsPage() {
  const session = await getServerSession()
  if (!session?.user?.id) redirect('/login?callbackUrl=/account/coupons')
  const userId = session.user.id

  const [coupons, loyaltyAccount, transactions] = await Promise.all([
    prisma.coupon.findMany({ where: { isActive: true }, orderBy: { createdAt: 'desc' } }),
    getOrCreateLoyaltyAccount(userId),
    prisma.loyaltyTransaction.findMany({ where: { account: { userId } }, orderBy: { createdAt: 'desc' }, take: 30 }),
  ])

  const now = new Date()
  const availableCoupons = coupons.filter(
    (c) => (!c.maxUses || c.usedCount < c.maxUses) && (!c.endsAt || c.endsAt > now) && (!c.startsAt || c.startsAt <= now)
  )

  const tierConfig = LOYALTY_TIER_CONFIG[loyaltyAccount.tier as LoyaltyTier]

  return (
    <div>
      <p className="eyebrow">Récompenses</p>
      <h1 className="display-heading text-4xl sm:text-5xl">
        Coupons & <span className="text-fire">fidélité.</span>
      </h1>

      <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border bg-card p-6 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase text-muted-foreground">Niveau {tierConfig.label}</p>
          <p className="price-tag text-3xl text-fire">{loyaltyAccount.points.toLocaleString('fr-FR')} pts</p>
          <p className="mt-1 text-xs text-muted-foreground">{tierConfig.description}</p>
        </div>
        <Gift size={40} className="text-fire" />
      </div>

      <div className="mt-10">
        <p className="mb-4 font-display text-xl uppercase">Coupons disponibles</p>
        {availableCoupons.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Aucun coupon actif pour le moment.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {availableCoupons.map((c) => (
              <div key={c.id} className="card-grill flex flex-col gap-2 p-4">
                <CouponPill code={c.code} />
                <p className="text-xs text-muted-foreground">
                  {COUPON_TYPE_LABELS[c.type] ?? c.type} ·{' '}
                  {c.type === 'FIXED' ? formatXOF(c.value) : c.type === 'PERCENT' ? `${c.value}%` : 'Livraison gratuite'}
                  {c.minOrderAmount ? ` · Dès ${formatXOF(c.minOrderAmount)}` : ''}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-10">
        <p className="mb-4 font-display text-xl uppercase">Historique de points</p>
        {transactions.length === 0 ? (
          <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Aucune transaction pour le moment.
          </p>
        ) : (
          <div className="divide-y divide-border rounded-xl border border-border">
            {transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between gap-3 p-4 text-sm">
                <div className="flex items-center gap-3">
                  {tx.points >= 0 ? (
                    <TrendingUp size={16} className="text-[var(--success)]" />
                  ) : (
                    <TrendingDown size={16} className="text-destructive" />
                  )}
                  <div>
                    <p className="font-semibold">{tx.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {TX_TYPE_LABELS[tx.type] ?? tx.type} · {new Date(tx.createdAt).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
                <strong className={tx.points >= 0 ? 'text-[var(--success)]' : 'text-destructive'}>
                  {tx.points >= 0 ? '+' : ''}
                  {tx.points} pts
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
