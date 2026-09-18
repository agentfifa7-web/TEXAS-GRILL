'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Gift } from 'lucide-react'
import { redeemReward } from '@/lib/actions/loyalty'
import { cn } from '@/lib/utils'

export function RewardRedeemButton({ userId, rewardId, canAfford }: { userId: string; rewardId: string; canAfford: boolean }) {
  const [isPending, startTransition] = useTransition()
  const [done, setDone] = useState(false)

  function handleRedeem() {
    startTransition(async () => {
      const result = await redeemReward(userId, rewardId)
      if (!result.ok) {
        toast.error(result.error === 'AUTH_REQUIRED' ? 'Connectez-vous pour échanger vos points.' : result.error)
        return
      }
      setDone(true)
      toast.success('Récompense échangée avec succès !')
    })
  }

  return (
    <button
      onClick={handleRedeem}
      disabled={!canAfford || isPending || done}
      className={cn('btn btn-primary btn-sm w-full justify-center', (!canAfford || isPending || done) && 'opacity-50')}
    >
      <Gift size={14} />
      {done ? 'Échangé' : isPending ? 'Échange...' : canAfford ? 'Échanger' : 'Points insuffisants'}
    </button>
  )
}
