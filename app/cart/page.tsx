'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '@/components/providers/cart-provider'
import { formatXOF, ORDER_TYPE_LABELS, type OrderType } from '@/lib/constants'

const MODES: OrderType[] = ['DELIVERY', 'PICKUP', 'DINE_IN']

export default function CartPage() {
  const { items, subtotal, orderType, setOrderType, updateItem, removeItem } = useCart()

  if (items.length === 0) {
    return (
      <div className="container-grill section-py flex flex-col items-center gap-4 text-center">
        <ShoppingBag size={48} className="text-muted-foreground" />
        <h1 className="display-heading text-4xl">Ton panier est encore vide.</h1>
        <p className="text-muted-foreground">Explore le menu et compose ton grill parfait.</p>
        <Link href="/menu" className="btn btn-primary mt-2">
          Voir le menu <ArrowRight size={16} />
        </Link>
      </div>
    )
  }

  return (
    <div className="container-grill section-py">
      <h1 className="display-heading mb-8 text-5xl">
        Votre <span className="text-fire">Panier.</span>
      </h1>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-6 flex rounded-full bg-muted p-1 w-fit">
            {MODES.map((mode) => (
              <button
                key={mode}
                onClick={() => setOrderType(mode)}
                className={`rounded-full px-4 py-2 text-xs font-bold transition-colors ${orderType === mode ? 'bg-ink text-cream' : 'text-muted-foreground'}`}
              >
                {ORDER_TYPE_LABELS[mode]}
              </button>
            ))}
          </div>

          <div className="divide-y divide-border rounded-xl border border-border">
            {items.map((item) => {
              let images: string[] = []
              try {
                images = JSON.parse(item.product.imagesJson)
              } catch {
                images = []
              }
              return (
                <div key={item.id} className="flex gap-4 p-4">
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {images[0] && <Image src={images[0]} alt={item.product.name} fill className="object-cover" sizes="80px" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg uppercase leading-tight">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">{item.product.category.name}</p>
                      </div>
                      <button onClick={() => removeItem(item.id)} aria-label="Supprimer" className="text-muted-foreground hover:text-destructive">
                        <Trash2 size={16} />
                      </button>
                    </div>
                    {(item.selectedOptions.length > 0 || item.selectedAddons.length > 0) && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {[...item.selectedOptions.map((o) => o.label), ...item.selectedAddons.map((a) => `${a.name} x${a.quantity}`)].join(' · ')}
                      </p>
                    )}
                    {item.note && <p className="mt-1 text-xs italic text-muted-foreground">« {item.note} »</p>}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-border px-2.5 py-1.5">
                        <button onClick={() => updateItem(item.id, item.quantity - 1)} aria-label="Diminuer" className="p-1">
                          <Minus size={14} />
                        </button>
                        <span className="w-5 text-center text-sm font-bold">{item.quantity}</span>
                        <button onClick={() => updateItem(item.id, item.quantity + 1)} aria-label="Augmenter" className="p-1">
                          <Plus size={14} />
                        </button>
                      </div>
                      <strong className="price-tag text-lg">{formatXOF(item.subtotal)}</strong>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <aside className="h-fit rounded-xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-24">
          <p className="font-display text-xl uppercase">Résumé</p>
          <div className="mt-4 flex justify-between text-sm">
            <span className="text-muted-foreground">Sous-total</span>
            <strong>{formatXOF(subtotal)}</strong>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">Frais de livraison et réductions calculés au checkout.</p>
          <Link href="/checkout" className="btn btn-primary mt-5 w-full">
            Passer au checkout <ArrowRight size={16} />
          </Link>
          <Link href="/menu" className="btn btn-outline mt-2 w-full">
            Continuer mes achats
          </Link>
        </aside>
      </div>
    </div>
  )
}
