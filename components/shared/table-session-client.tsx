'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { setTableSession } from '@/lib/table-session'
import { useCart } from '@/components/providers/cart-provider'

export function TableSessionClient({
  tableId,
  tableNumber,
  restaurantId,
  restaurantName,
}: {
  tableId: string
  tableNumber: number
  restaurantId: string
  restaurantName: string
}) {
  const { setOrderType } = useCart()

  useEffect(() => {
    setTableSession({ tableId, tableNumber, restaurantId, restaurantName })
    setOrderType('DINE_IN', restaurantId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableId])

  return (
    <div className="container-grill section-py flex flex-col items-center text-center">
      <CheckCircle2 size={48} className="text-[var(--success)]" />
      <h1 className="display-heading mt-4 text-4xl sm:text-5xl">
        Table {tableNumber} — <span className="text-fire">{restaurantName}</span>
      </h1>
      <p className="mt-3 max-w-sm text-muted-foreground">
        Vous êtes connecté à votre table. Parcourez le menu, commandez et payez directement depuis votre téléphone — votre commande
        part en cuisine dès validation.
      </p>
      <Link href="/menu" className="btn btn-primary mt-6">
        Voir le menu <ArrowRight size={16} />
      </Link>
    </div>
  )
}
