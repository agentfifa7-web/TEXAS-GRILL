'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Check, Copy, Ticket } from 'lucide-react'
import { formatXOF } from '@/lib/constants'
import { cn } from '@/lib/utils'

export interface CouponCardData {
  id: string
  code: string
  type: string
  value: number
  minOrderAmount: number | null
  endsAt: Date | string | null
}

export function CouponPill({ coupon }: { coupon: CouponCardData }) {
  const [copied, setCopied] = useState(false)

  const discountLabel =
    coupon.type === 'PERCENT'
      ? `-${coupon.value}%`
      : coupon.type === 'FIXED'
        ? `-${formatXOF(coupon.value)}`
        : 'Livraison offerte'

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(coupon.code)
      setCopied(true)
      toast.success(`Code ${coupon.code} copié !`)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier le code')
    }
  }

  return (
    <div className="card-grill flex flex-col justify-between p-5">
      <div>
        <div className="flex items-center gap-2 text-fire">
          <Ticket size={18} />
          <span className="font-display text-2xl uppercase tracking-wide">{discountLabel}</span>
        </div>
        {coupon.minOrderAmount != null && (
          <p className="mt-1.5 text-xs text-muted-foreground">Dès {formatXOF(coupon.minOrderAmount)} d&apos;achat</p>
        )}
        {coupon.endsAt && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            Valable jusqu&apos;au {new Date(coupon.endsAt).toLocaleDateString('fr-FR')}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleCopy}
        className={cn(
          'mt-4 flex items-center justify-between gap-2 rounded-full border border-dashed border-fire bg-accent/40 px-4 py-2.5 text-left text-sm font-black tracking-wide transition-colors hover:bg-accent/70'
        )}
      >
        <span>{coupon.code}</span>
        {copied ? <Check size={16} className="text-[var(--success)]" /> : <Copy size={16} />}
      </button>
    </div>
  )
}
