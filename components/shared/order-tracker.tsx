'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CheckCircle2, Circle } from 'lucide-react'
import { ORDER_STATUS_FLOW, ORDER_STATUS_LABELS, type OrderStatus } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function OrderTracker({ status, isDelivery }: { status: OrderStatus; isDelivery: boolean }) {
  const router = useRouter()

  useEffect(() => {
    if (status === 'DELIVERED' || status === 'COMPLETED' || status === 'CANCELLED') return
    const interval = setInterval(() => router.refresh(), 20000)
    return () => clearInterval(interval)
  }, [status, router])

  const flow = isDelivery ? ORDER_STATUS_FLOW : ORDER_STATUS_FLOW.filter((s) => !['DRIVER_ASSIGNED', 'OUT_FOR_DELIVERY', 'DELIVERED'].includes(s))
  const currentIndex = flow.indexOf(status)

  if (status === 'CANCELLED') {
    return <p className="rounded-lg bg-destructive/10 p-4 text-sm font-semibold text-destructive">Cette commande a été annulée.</p>
  }

  return (
    <ol className="space-y-0">
      {flow.map((s, i) => {
        const done = i <= currentIndex
        return (
          <li key={s} className="relative flex gap-3 pb-7 last:pb-0">
            {i < flow.length - 1 && <span className={cn('absolute left-[9px] top-6 h-full w-0.5', done ? 'bg-fire' : 'bg-border')} />}
            {done ? <CheckCircle2 size={20} className="shrink-0 text-fire" /> : <Circle size={20} className="shrink-0 text-border" />}
            <div>
              <p className={cn('text-sm font-bold', done ? 'text-foreground' : 'text-muted-foreground')}>{ORDER_STATUS_LABELS[s]}</p>
              {s === status && <p className="text-xs text-fire">En cours</p>}
            </div>
          </li>
        )
      })}
    </ol>
  )
}
