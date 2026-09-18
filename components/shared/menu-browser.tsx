'use client'

import { useMemo, useState } from 'react'
import { Search, SlidersHorizontal } from 'lucide-react'
import { PillTabs } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { ProductCard, type ProductCardData } from '@/components/shared/product-card'

interface Category {
  id: string
  slug: string
  name: string
}

type SortKey = 'popular' | 'price-asc' | 'price-desc' | 'new'

export function MenuBrowser({
  categories,
  products,
  initialCategory,
  favoriteIds,
}: {
  categories: Category[]
  products: (ProductCardData & { isNew: boolean; isFeatured: boolean; createdAt: Date | string })[]
  initialCategory?: string
  favoriteIds: string[]
}) {
  const [category, setCategory] = useState(initialCategory ?? 'all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('popular')
  const [favoritesOnly, setFavoritesOnly] = useState(false)

  const tabOptions = useMemo(
    () => [{ value: 'all', label: 'Tout' }, ...categories.map((c) => ({ value: c.slug, label: c.name }))],
    [categories]
  )

  const filtered = useMemo(() => {
    let list = products
    if (category !== 'all') list = list.filter((p) => p.category.name === categories.find((c) => c.slug === category)?.name)
    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q))
    }
    if (favoritesOnly) list = list.filter((p) => favoriteIds.includes(p.id))

    const sorted = [...list]
    if (sort === 'price-asc') sorted.sort((a, b) => a.price - b.price)
    else if (sort === 'price-desc') sorted.sort((a, b) => b.price - a.price)
    else if (sort === 'new') sorted.sort((a, b) => (a.isNew === b.isNew ? 0 : a.isNew ? -1 : 1))
    else sorted.sort((a, b) => (a.isFeatured === b.isFeatured ? 0 : a.isFeatured ? -1 : 1))
    return sorted
  }, [products, category, search, sort, favoritesOnly, categories, favoriteIds])

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3.5 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher un burger, un steak…"
            className="pl-10"
            aria-label="Rechercher dans le menu"
          />
        </div>
        <Select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} aria-label="Trier" className="sm:w-52">
          <option value="popular">Popularité</option>
          <option value="new">Nouveautés</option>
          <option value="price-asc">Prix croissant</option>
          <option value="price-desc">Prix décroissant</option>
        </Select>
        <button
          onClick={() => setFavoritesOnly((v) => !v)}
          className={`btn btn-sm ${favoritesOnly ? 'btn-primary' : 'btn-outline'}`}
        >
          <SlidersHorizontal size={14} /> Favoris
        </button>
      </div>

      <PillTabs options={tabOptions} value={category} onChange={setCategory} className="mb-7" />

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-20 text-center text-muted-foreground">
          <p className="font-display text-2xl uppercase">Aucun plat trouvé.</p>
          <p className="mt-1 text-sm">Essayez une autre recherche ou catégorie.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} isFavorited={favoriteIds.includes(product.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
