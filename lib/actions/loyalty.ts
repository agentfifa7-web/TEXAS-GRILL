'use server'

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redeemReward as redeemRewardService } from '@/lib/loyalty'
import { revalidatePath } from 'next/cache'

export async function redeemReward(userId: string, rewardId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id || session.user.id !== userId) {
    return { ok: false as const, error: 'AUTH_REQUIRED' }
  }

  try {
    await redeemRewardService(userId, rewardId)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Impossible de récupérer cette récompense.'
    return { ok: false as const, error: message }
  }

  revalidatePath('/rewards')
  return { ok: true as const }
}
