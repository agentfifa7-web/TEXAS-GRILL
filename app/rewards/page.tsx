import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getOrCreateLoyaltyAccount } from '@/lib/loyalty'
import { LOYALTY_TIER_CONFIG, formatXOF, type LoyaltyTier } from '@/lib/constants'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { RewardRedeemButton } from '@/components/shared/reward-redeem-button'
import { PageHero } from '@/components/shared/page-hero'
import { Flame, Gift, Star, TrendingUp, Trophy } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Texas Grill Rewards',
  description: 'Cumulez des points à chaque commande et débloquez des avantages exclusifs avec Texas Grill Rewards.',
}

const TIER_ORDER: LoyaltyTier[] = ['STARTER', 'GRILL_LOVER', 'GRILL_MASTER', 'TEXAS_LEGEND']

const TRANSACTION_LABELS: Record<string, string> = {
  EARN: 'Points gagnés',
  REDEEM: 'Récompense échangée',
  BONUS: 'Bonus',
  EXPIRE: 'Points expirés',
  REFERRAL: 'Parrainage',
  BIRTHDAY: 'Cadeau anniversaire',
}

export default async function RewardsPage() {
  const session = await getServerSession()

  if (!session?.user?.id) {
    return (
      <div className="container-grill section-py">
        <PageHero
          eyebrow="Le club Texas Grill"
          title={<>Texas Grill <span className="text-fire">Rewards.</span></>}
          description="Gagnez des points à chaque commande, montez en grade et débloquez des réductions permanentes et des cadeaux exclusifs."
          videoSrc="/videos/hero-lifestyle.mp4"
          center
        />
        <div className="-mt-4 mb-10 text-center">
          <Link href="/login" className="btn btn-primary">
            Se connecter
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {TIER_ORDER.map((tier) => {
            const cfg = LOYALTY_TIER_CONFIG[tier]
            return (
              <div key={tier} className="card-grill p-5">
                <Trophy size={20} className="text-fire" />
                <h3 className="mt-3 font-display text-xl uppercase tracking-wide">{cfg.label}</h3>
                <p className="mt-1 text-xs font-bold uppercase text-muted-foreground">Dès {cfg.minPoints.toLocaleString('fr-FR')} pts</p>
                <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">{cfg.description}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  const account = await getOrCreateLoyaltyAccount(session.user.id)
  const [transactions, rewards] = await Promise.all([
    prisma.loyaltyTransaction.findMany({ where: { accountId: account.id }, orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.reward.findMany({ where: { isActive: true } }),
  ])

  const currentTier = account.tier as LoyaltyTier
  const currentIndex = TIER_ORDER.indexOf(currentTier)
  const nextTier = TIER_ORDER[currentIndex + 1]
  const currentMin = LOYALTY_TIER_CONFIG[currentTier].minPoints
  const nextMin = nextTier ? LOYALTY_TIER_CONFIG[nextTier].minPoints : null
  const progress = nextMin
    ? Math.min(100, ((account.totalEarned - currentMin) / (nextMin - currentMin)) * 100)
    : 100

  return (
    <div className="container-grill section-py">
      <PageHero
        eyebrow="Mon compte"
        title={<>Texas Grill <span className="text-fire">Rewards.</span></>}
        videoSrc="/videos/hero-lifestyle.mp4"
      />

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <div className="card-grill p-6">
            <div className="flex items-center justify-between">
              <div>
                <Badge variant="amber" className="gap-1">
                  <Trophy size={11} /> {LOYALTY_TIER_CONFIG[currentTier].label}
                </Badge>
                <p className="mt-3 price-tag text-3xl">{account.points.toLocaleString('fr-FR')} pts</p>
                <p className="mt-1 text-xs text-muted-foreground">{account.totalEarned.toLocaleString('fr-FR')} points gagnés au total</p>
              </div>
              <Flame size={40} className="text-fire" />
            </div>

            <div className="mt-6">
              {nextTier ? (
                <>
                  <div className="mb-1.5 flex justify-between text-xs font-bold uppercase text-muted-foreground">
                    <span>{LOYALTY_TIER_CONFIG[currentTier].label}</span>
                    <span>{LOYALTY_TIER_CONFIG[nextTier].label}</span>
                  </div>
                  <Progress value={progress} />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Encore {Math.max(0, nextMin! - account.totalEarned).toLocaleString('fr-FR')} points avant {LOYALTY_TIER_CONFIG[nextTier].label}
                  </p>
                </>
              ) : (
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-fire">
                  <Star size={14} /> Vous avez atteint le rang le plus élevé !
                </p>
              )}
            </div>

            <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{LOYALTY_TIER_CONFIG[currentTier].description}</p>
          </div>

          <div>
            <h2 className="mb-4 flex items-center gap-2 font-display text-2xl uppercase tracking-wide">
              <TrendingUp size={20} className="text-fire" /> Historique
            </h2>
            {transactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune activité pour le moment. Passez commande pour gagner vos premiers points !</p>
            ) : (
              <div className="card-grill divide-y divide-border">
                {transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-bold">{TRANSACTION_LABELS[t.type] ?? t.type}</p>
                      <p className="text-xs text-muted-foreground">{t.description}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {new Date(t.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <span className={`text-sm font-black ${t.points >= 0 ? 'text-[var(--success)]' : 'text-destructive'}`}>
                      {t.points >= 0 ? '+' : ''}
                      {t.points}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <aside>
          <h2 className="mb-4 flex items-center gap-2 font-display text-2xl uppercase tracking-wide">
            <Gift size={20} className="text-fire" /> À échanger
          </h2>
          <div className="space-y-4">
            {rewards.length === 0 && <p className="text-sm text-muted-foreground">Aucune récompense disponible pour le moment.</p>}
            {rewards.map((reward) => {
              const canAfford = account.points >= reward.pointsCost
              return (
                <div key={reward.id} className="card-grill p-4">
                  <h3 className="font-display text-lg uppercase tracking-wide">{reward.name}</h3>
                  {reward.description && <p className="mt-1 text-xs text-muted-foreground">{reward.description}</p>}
                  <p className="mt-2 text-sm font-black text-fire">{reward.pointsCost.toLocaleString('fr-FR')} pts</p>
                  {reward.type === 'DISCOUNT_FIXED' && reward.value != null && (
                    <p className="text-xs text-muted-foreground">Réduction de {formatXOF(reward.value)}</p>
                  )}
                  {reward.type === 'DISCOUNT_PERCENT' && reward.value != null && (
                    <p className="text-xs text-muted-foreground">Réduction de {reward.value}%</p>
                  )}
                  <div className="mt-3">
                    <RewardRedeemButton userId={session.user.id} rewardId={reward.id} canAfford={canAfford} />
                  </div>
                </div>
              )
            })}
          </div>
        </aside>
      </div>
    </div>
  )
}
