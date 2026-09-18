'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Sheet } from '@/components/ui/sheet'
import { useCart } from '@/components/providers/cart-provider'
import { formatXOF } from '@/lib/constants'
import { parseJson } from '@/lib/json'

export function CartDrawer() {
  const { items, subtotal, isDrawerOpen, closeDrawer, updateItem, removeItem } = useCart()

  return (
    <Sheet open={isDrawerOpen} onClose={closeDrawer} title="Votre panier">
      {items.length === 0 ? (
        <div className="flex h-full flex-col items-center justify-center gap-3 p-10 text-center">
          <ShoppingBag size={40} className="text-muted-foreground" />
          <p className="font-display text-2xl uppercase">Ton panier est encore vide.</p>
          <p className="text-sm text-muted-foreground">Explore le menu et compose ton grill parfait.</p>
          <Link href="/menu" onClick={closeDrawer} className="btn btn-primary mt-2">
            Voir le menu
          </Link>
        </div>
      ) : (
        <div className="flex h-full flex-col">
          <div className="flex-1 divide-y divide-border overflow-auto px-5">
            {items.map((item) => {
              const images = parseJson<string[]>(item.product.imagesJson, [])
              return (
                <div key={item.id} className="flex gap-3 py-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {images[0] && <Image src={images[0]} alt={item.product.name} fill className="object-cover" sizes="64px" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-display text-base uppercase leading-tight">{item.product.name}</p>
                      <button onClick={() => removeItem(item.id)} aria-label="Supprimer" className="text-muted-foreground hover:text-destructive">
                        <Trash2 size={15} />
                      </button>
                    </div>
                    {item.selectedOptions.length > 0 && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{item.selectedOptions.map((o) => o.label).join(' · ')}</p>
                    )}
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center gap-2 rounded-full border border-border px-2 py-1">
                        <button onClick={() => updateItem(item.id, item.quantity - 1)} aria-label="Diminuer" className="p-0.5">
                          <Minus size={13} />
                        </button>
                        <span className="w-4 text-center text-xs font-bold">{item.quantity}</span>
                        <button onClick={() => updateItem(item.id, item.quantity + 1)} aria-label="Augmenter" className="p-0.5">
                          <Plus size={13} />
                        </button>
                      </div>
                      <strong className="price-tag text-sm">{formatXOF(item.subtotal)}</strong>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
          <div className="border-t border-border p-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <strong className="price-tag text-lg">{formatXOF(subtotal)}</strong>
            </div>
            <Link href="/cart" onClick={closeDrawer} className="btn btn-primary w-full">
              Voir le panier
            </Link>
            <Link href="/checkout" onClick={closeDrawer} className="btn btn-dark mt-2 w-full">
              Commander maintenant
            </Link>
          </div>
        </div>
      )}
    </Sheet>
  )
}
