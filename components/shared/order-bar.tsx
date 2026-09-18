'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, MapPin } from 'lucide-react'
import { useCart } from '@/components/providers/cart-provider'
import { ORDER_TYPE_LABELS, type OrderType } from '@/lib/constants'
import { cn } from '@/lib/utils'

const MODES: OrderType[] = ['DELIVERY', 'PICKUP', 'DINE_IN']

export function OrderBar({ restaurants }: { restaurants: { id: string; slug: string; name: string }[] }) {
  const { orderType, setOrderType } = useCart()
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <section className="container-grill relative mb-20 flex flex-col gap-3.5 rounded-lg bg-ink px-5 py-4 text-white sm:flex-row sm:items-center" aria-label="Options de commande">
      <div className="flex items-center gap-2 text-sm font-extrabold sm:mr-auto">
        <span className="size-2 rounded-full bg-[var(--success)] shadow-[0_0_0_4px_rgba(47,167,104,0.25)]" />
        Une petite faim ?
      </div>
      <div className="flex rounded-full bg-white/10 p-1">
        {MODES.map((mode) => (
          <button
            key={mode}
            onClick={() => setOrderType(mode)}
            className={cn(
              'rounded-full px-3.5 py-2 text-[11px] font-bold text-white/60 transition-colors sm:px-4',
              orderType === mode && 'bg-fire text-white'
            )}
          >
            {ORDER_TYPE_LABELS[mode]}
          </button>
        ))}
      </div>
      <div className="relative">
        <button onClick={() => setPickerOpen((v) => !v)} className="flex items-center gap-1.5 text-[11px] font-bold">
          <MapPin size={16} /> Choisissez un restaurant <ChevronDown size={15} />
        </button>
        {pickerOpen && (
          <div className="absolute right-0 top-full z-10 mt-2 w-64 overflow-hidden rounded-lg border border-white/10 bg-ink-soft shadow-2xl">
            {restaurants.map((r) => (
              <Link
                key={r.id}
                href={`/restaurants/${r.slug}`}
                onClick={() => setPickerOpen(false)}
                className="block px-4 py-3 text-xs font-semibold text-white/80 hover:bg-white/10"
              >
                {r.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
