import 'server-only'
import { prisma } from '@/lib/prisma'
import { LOYALTY_TIER_CONFIG, POINTS_PER_XOF, type LoyaltyTier } from '@/lib/constants'
import { randomUUID } from 'crypto'

export function computeTier(totalEarned: number): LoyaltyTier {
  const tiers = Object.entries(LOYALTY_TIER_CONFIG).sort((a, b) => b[1].minPoints - a[1].minPoints)
  const match = tiers.find(([, cfg]) => totalEarned >= cfg.minPoints)
  return (match?.[0] as LoyaltyTier) ?? 'STARTER'
}

export async function getOrCreateLoyaltyAccount(userId: string) {
  const existing = await prisma.loyaltyAccount.findUnique({ where: { userId } })
  if (existing) return existing
  return prisma.loyaltyAccount.create({ data: { userId, referralCode: `TG-${randomUUID().slice(0, 6).toUpperCase()}` } })
}

export async function awardPointsForOrder(userId: string, orderId: string, amountSpent: number) {
  const account = await getOrCreateLoyaltyAccount(userId)
  const points = Math.round(amountSpent * POINTS_PER_XOF)
  const totalEarned = account.totalEarned + points
  const tier = computeTier(totalEarned)

  await prisma.loyaltyAccount.update({
    where: { id: account.id },
    data: { points: account.points + points, totalEarned, tier },
  })
  await prisma.loyaltyTransaction.create({
    data: { accountId: account.id, type: 'EARN', points, orderId, description: `Commande ${orderId}` },
  })
  return points
}

export async function redeemReward(userId: string, rewardId: string) {
  const account = await getOrCreateLoyaltyAccount(userId)
  const reward = await prisma.reward.findUnique({ where: { id: rewardId } })
  if (!reward || !reward.isActive) throw new Error('Récompense indisponible')
  if (account.points < reward.pointsCost) throw new Error('Points insuffisants')

  await prisma.loyaltyAccount.update({
    where: { id: account.id },
    data: { points: account.points - reward.pointsCost, totalRedeemed: account.totalRedeemed + reward.pointsCost },
  })
  await prisma.loyaltyTransaction.create({
    data: { accountId: account.id, type: 'REDEEM', points: -reward.pointsCost, description: reward.name },
  })
  return reward
}
