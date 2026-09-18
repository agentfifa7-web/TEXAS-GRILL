'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Heart, Plus } from 'lucide-react'
import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { useCart } from '@/components/providers/cart-provider'
import { toggleFavoriteAction } from '@/lib/actions/favorites'
import { formatXOF } from '@/lib/constants'
import { cn } from '@/lib/utils'

export interface ProductCardData {
  id: string
  slug: string
  name: string
  description: string
  price: number
  images: string[]
  badge?: string | null
  isNew?: boolean
  category: { name: string }
}

export function ProductCard({ product, isFavorited = false }: { product: ProductCardData; isFavorited?: boolean }) {
  const { addItem } = useCart()
  const [favorited, setFavorited] = useState(isFavorited)
  const [isPending, startTransition] = useTransition()

  async function handleFavorite(e: React.MouseEvent) {
    e.preventDefault()
    const result = await toggleFavoriteAction(product.id)
    if (!result.ok) {
      toast.error('Connectez-vous pour ajouter des favoris')
      return
    }
    setFavorited(result.favorited)
  }

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault()
    startTransition(() => addItem({ productId: product.id, quantity: 1, selectedOptions: [], selectedAddons: [] }))
  }

  return (
    <Link href={`/product/${product.slug}`} className="card-grill group block overflow-hidden transition-transform hover:-translate-y-1">
      <div className="relative h-48 overflow-hidden bg-muted sm:h-56">
        {product.images[0] && (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, 280px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        {(product.badge || product.isNew) && (
          <Badge variant="amber" className="absolute left-3 top-3">
            {product.isNew ? 'Nouveau' : product.badge}
          </Badge>
        )}
        <button
          onClick={handleFavorite}
          aria-label={`Ajouter ${product.name} aux favoris`}
          className="absolute right-2.5 top-2.5 grid size-8 place-items-center rounded-full bg-white/90 text-fire shadow-sm backdrop-blur-sm transition-transform hover:scale-110"
        >
          <Heart size={16} fill={favorited ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="p-4">
        <h3 className="font-display text-lg uppercase leading-tight tracking-wide">{product.name}</h3>
        <p className="mt-1 line-clamp-2 min-h-[2.4em] text-xs leading-relaxed text-muted-foreground">{product.description}</p>
        <div className="mt-3.5 flex items-center justify-between">
          <strong className="price-tag text-lg">{formatXOF(product.price)}</strong>
          <button
            onClick={handleAdd}
            disabled={isPending}
            className={cn('btn btn-outline btn-sm', isPending && 'opacity-60')}
            aria-label={`Ajouter ${product.name} au panier`}
          >
            <Plus size={15} /> Ajouter
          </button>
        </div>
      </div>
    </Link>
  )
}
