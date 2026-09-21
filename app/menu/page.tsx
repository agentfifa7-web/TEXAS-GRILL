import type { Metadata } from 'next'
import { getServerSession } from '@/lib/auth'
import { getCategories, getProducts } from '@/lib/data/menu'
import { getUserFavoriteIds } from '@/lib/actions/favorites'
import { MenuBrowser } from '@/components/shared/menu-browser'
import { PageHero } from '@/components/shared/page-hero'

export const metadata: Metadata = {
  title: 'Menu',
  description: 'Burgers, grillades, steaks, ribs, poulet, brochettes et plus — découvrez le menu complet de Texas Grill à Abidjan.',
}

export default async function MenuPage({ searchParams }: { searchParams: Promise<{ cat?: string }> }) {
  const params = await searchParams
  const session = await getServerSession()
  const [categories, products, favoriteIds] = await Promise.all([
    getCategories(),
    getProducts({}),
    getUserFavoriteIds(session?.user?.id),
  ])

  return (
    <div className="container-grill section-py">
      <PageHero
        eyebrow="Au grill"
        title={<>Le <span className="text-fire">Menu.</span></>}
        videoSrc="/videos/hero-grill.mp4"
      />
      <MenuBrowser categories={categories} products={products} initialCategory={params.cat} favoriteIds={favoriteIds} />
    </div>
  )
}
