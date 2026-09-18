'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Heart, Minus, Plus, Star } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/components/providers/cart-provider'
import { toggleFavoriteAction } from '@/lib/actions/favorites'
import { formatXOF } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface OptionValue {
  id: string
  label: string
  priceDelta: number
}
interface Option {
  id: string
  name: string
  type: string
  isRequired: boolean
  values: OptionValue[]
}
interface Addon {
  id: string
  name: string
  price: number
  maxQuantity: number
}

export interface ProductDetailData {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  ingredients: string[]
  allergens: string[]
  isAvailable: boolean
  spiceLevel: number | null
  prepTimeMinutes: number | null
  options: Option[]
  addons: Addon[]
  reviews: { id: string; overallRating: number; comment: string | null; user: { name: string } }[]
}

export function ProductDetail({ product, isFavorited }: { product: ProductDetailData; isFavorited: boolean }) {
  const { addItem } = useCart()
  const [activeImage, setActiveImage] = useState(0)
  const [favorited, setFavorited] = useState(isFavorited)
  const [quantity, setQuantity] = useState(1)
  const [selectedSingle, setSelectedSingle] = useState<Record<string, OptionValue>>(() => {
    const initial: Record<string, OptionValue> = {}
    for (const opt of product.options.filter((o) => o.type === 'SINGLE' && o.isRequired)) {
      if (opt.values[0]) initial[opt.id] = opt.values[0]
    }
    return initial
  })
  const [selectedMulti, setSelectedMulti] = useState<Record<string, OptionValue[]>>({})
  const [addonQty, setAddonQty] = useState<Record<string, number>>({})
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const avgRating = useMemo(() => {
    if (product.reviews.length === 0) return null
    return product.reviews.reduce((sum, r) => sum + r.overallRating, 0) / product.reviews.length
  }, [product.reviews])

  const optionsDelta = useMemo(() => {
    const singleTotal = Object.values(selectedSingle).reduce((sum, v) => sum + v.priceDelta, 0)
    const multiTotal = Object.values(selectedMulti)
      .flat()
      .reduce((sum, v) => sum + v.priceDelta, 0)
    return singleTotal + multiTotal
  }, [selectedSingle, selectedMulti])

  const addonsTotal = useMemo(
    () => product.addons.reduce((sum, addon) => sum + addon.price * (addonQty[addon.id] ?? 0), 0),
    [product.addons, addonQty]
  )

  const unitPrice = product.price + optionsDelta
  const total = unitPrice * quantity + addonsTotal * quantity

  async function handleFavorite() {
    const result = await toggleFavoriteAction(product.id)
    if (!result.ok) {
      toast.error('Connectez-vous pour ajouter des favoris')
      return
    }
    setFavorited(result.favorited)
  }

  async function handleAdd() {
    const missingRequired = product.options.find((o) => o.isRequired && o.type === 'SINGLE' && !selectedSingle[o.id])
    if (missingRequired) {
      toast.error(`Choisissez une option pour "${missingRequired.name}"`)
      return
    }
    setSubmitting(true)
    try {
      const selectedOptions = [
        ...Object.entries(selectedSingle).map(([optionId, v]) => ({
          optionId,
          optionName: product.options.find((o) => o.id === optionId)?.name ?? '',
          valueId: v.id,
          label: v.label,
          priceDelta: v.priceDelta,
        })),
        ...Object.entries(selectedMulti).flatMap(([optionId, values]) =>
          values.map((v) => ({
            optionId,
            optionName: product.options.find((o) => o.id === optionId)?.name ?? '',
            valueId: v.id,
            label: v.label,
            priceDelta: v.priceDelta,
          }))
        ),
      ]
      const selectedAddons = product.addons
        .filter((a) => (addonQty[a.id] ?? 0) > 0)
        .map((a) => ({ addonId: a.id, name: a.name, price: a.price, quantity: addonQty[a.id] }))

      await addItem({ productId: product.id, quantity, selectedOptions, selectedAddons, note: note || undefined })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      <div>
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-muted">
          {product.images[activeImage] && (
            <Image src={product.images[activeImage]} alt={product.name} fill priority className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
          )}
          {!product.isAvailable && (
            <div className="absolute inset-0 grid place-items-center bg-ink/60 text-white">
              <Badge variant="destructive">Indisponible</Badge>
            </div>
          )}
        </div>
        {product.images.length > 1 && (
          <div className="mt-3 flex gap-2">
            {product.images.map((img, i) => (
              <button
                key={img + i}
                onClick={() => setActiveImage(i)}
                className={cn('relative size-16 overflow-hidden rounded-lg border-2', activeImage === i ? 'border-fire' : 'border-transparent')}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="64px" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="flex items-start justify-between gap-3">
          <h1 className="display-heading text-4xl sm:text-5xl">{product.name}</h1>
          <button onClick={handleFavorite} aria-label="Favoris" className="mt-1 shrink-0 rounded-full border border-border p-2.5 text-fire hover:bg-muted">
            <Heart size={19} fill={favorited ? 'currentColor' : 'none'} />
          </button>
        </div>
        {avgRating && (
          <div className="mt-2 flex items-center gap-1.5 text-sm">
            <Star size={15} className="text-amber" fill="currentColor" />
            <strong>{avgRating.toFixed(1)}</strong>
            <span className="text-muted-foreground">({product.reviews.length} avis)</span>
          </div>
        )}
        <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">{product.description}</p>
        <p className="price-tag mt-4 text-3xl text-fire">{formatXOF(product.price)}</p>

        {product.ingredients.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Ingrédients</p>
            <p className="mt-1 text-sm">{product.ingredients.join(', ')}</p>
          </div>
        )}
        {product.allergens.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Allergènes</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {product.allergens.map((a) => (
                <Badge key={a} variant="outline">
                  {a}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {product.options.map((option) => (
          <div key={option.id} className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wide">
              {option.name} {option.isRequired && <span className="text-fire">*</span>}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              {option.values.map((value) => {
                const active =
                  option.type === 'SINGLE'
                    ? selectedSingle[option.id]?.id === value.id
                    : (selectedMulti[option.id] ?? []).some((v) => v.id === value.id)
                return (
                  <button
                    key={value.id}
                    onClick={() => {
                      if (option.type === 'SINGLE') {
                        setSelectedSingle((prev) => ({ ...prev, [option.id]: value }))
                      } else {
                        setSelectedMulti((prev) => {
                          const current = prev[option.id] ?? []
                          const exists = current.some((v) => v.id === value.id)
                          return { ...prev, [option.id]: exists ? current.filter((v) => v.id !== value.id) : [...current, value] }
                        })
                      }
                    }}
                    className={cn(
                      'rounded-full border px-3.5 py-2 text-xs font-bold transition-colors',
                      active ? 'border-ink bg-ink text-cream' : 'border-border hover:border-fire hover:text-fire'
                    )}
                  >
                    {value.label}
                    {value.priceDelta > 0 && ` (+${formatXOF(value.priceDelta)})`}
                  </button>
                )
              })}
            </div>
          </div>
        ))}

        {product.addons.length > 0 && (
          <div className="mt-6">
            <p className="text-xs font-bold uppercase tracking-wide">Extras</p>
            <div className="mt-2 space-y-2">
              {product.addons.map((addon) => (
                <div key={addon.id} className="flex items-center justify-between rounded-lg border border-border px-3.5 py-2.5">
                  <div>
                    <p className="text-sm font-semibold">{addon.name}</p>
                    <p className="text-xs text-muted-foreground">{formatXOF(addon.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAddonQty((p) => ({ ...p, [addon.id]: Math.max(0, (p[addon.id] ?? 0) - 1) }))}
                      className="rounded-full border border-border p-1.5"
                      aria-label="Diminuer"
                    >
                      <Minus size={13} />
                    </button>
                    <span className="w-4 text-center text-sm font-bold">{addonQty[addon.id] ?? 0}</span>
                    <button
                      onClick={() => setAddonQty((p) => ({ ...p, [addon.id]: Math.min(addon.maxQuantity, (p[addon.id] ?? 0) + 1) }))}
                      className="rounded-full border border-border p-1.5"
                      aria-label="Augmenter"
                    >
                      <Plus size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6">
          <label htmlFor="note" className="text-xs font-bold uppercase tracking-wide">
            Note pour la cuisine (optionnel)
          </label>
          <textarea
            id="note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex : sans oignon, bien épicé…"
            maxLength={280}
            className="mt-2 w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm focus-visible:border-primary focus-visible:outline-none"
            rows={2}
          />
        </div>

        <div className="sticky bottom-4 z-20 mt-7 flex items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-lg">
          <div className="flex items-center gap-2 rounded-full border border-border px-2.5 py-1.5">
            <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Diminuer la quantité" className="p-1">
              <Minus size={15} />
            </button>
            <span className="w-5 text-center text-sm font-bold">{quantity}</span>
            <button onClick={() => setQuantity((q) => Math.min(20, q + 1))} aria-label="Augmenter la quantité" className="p-1">
              <Plus size={15} />
            </button>
          </div>
          <button onClick={handleAdd} disabled={!product.isAvailable || submitting} className="btn btn-primary flex-1">
            Ajouter au panier — {formatXOF(total)}
          </button>
        </div>

        {product.reviews.length > 0 && (
          <div className="mt-10">
            <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Avis clients</p>
            <div className="mt-3 space-y-4">
              {product.reviews.map((review) => (
                <div key={review.id} className="border-b border-border pb-4">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm">{review.user.name}</strong>
                    <span className="flex items-center gap-0.5 text-amber">
                      {Array.from({ length: review.overallRating }).map((_, i) => (
                        <Star key={i} size={12} fill="currentColor" />
                      ))}
                    </span>
                  </div>
                  {review.comment && <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
