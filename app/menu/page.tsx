import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getCategories, getProducts } from '@/lib/data/menu'
import { getUserFavoriteIds } from '@/lib/actions/favorites'
import { MenuBrowser } from '@/components/shared/menu-browser'

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Burgers, grillades, steaks, ribs, poulet, brochettes et plus — découvrez le menu complet de Texas Grill à Abidjan.',
}

export default async function MenuPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const params = await searchParams
  const session = await getServerSession(authOptions)
  const [categories, products, favoriteIds] = await Promise.all([
    getCategories(),
    getProducts({}),
    getUserFavoriteIds(session?.user?.id),
  ])

  return (
    <div className="container-grill section-py">
      <div className="mb-8">
        <p className="eyebrow">Au grill</p>
        <h1 className="display-heading text-5xl sm:text-6xl">
          Le <span className="text-fire">Menu.</span>
        </h1>
      </div>
      <MenuBrowser categories={categories} products={products} initialCategory={params.cat} favoriteIds={favoriteIds} />
    </div>
  )
}
