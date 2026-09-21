import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from '@/lib/auth'
import { getProducts } from '@/lib/data/menu'
import { getUserFavoriteIds } from '@/lib/actions/favorites'
import { ProductCard } from '@/components/shared/product-card'
import { PageHero } from '@/components/shared/page-hero'
import { Baby, Cake, PartyPopper, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Texas Grill Family',
  description: 'Menus familiaux, menus enfants et packs pour anniversaires et événements en famille chez Texas Grill Abidjan.',
}

export default async function FamilyPage() {
  const session = await getServerSession()
  const [products, favoriteIds] = await Promise.all([
    getProducts({ categorySlug: 'family-deals' }),
    getUserFavoriteIds(session?.user?.id),
  ])

  return (
    <div className="container-grill section-py">
      <PageHero
        eyebrow="En famille"
        title={<>Texas Grill <span className="text-fire">Family.</span></>}
        description="Des formules pensées pour les grandes tablées : menus familiaux, menus enfants, et packs pour vos moments à partager."
        videoSrc="/videos/hero-lifestyle.mp4"
        center
      />

      <div className="mb-14 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card-grill p-5">
          <Baby size={22} className="text-fire" />
          <h3 className="mt-3 font-display text-lg uppercase tracking-wide">Menus enfants</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Portions adaptées, cadeau surprise et recette douce pour les plus jeunes gourmets.
          </p>
        </div>
        <div className="card-grill p-5">
          <Cake size={22} className="text-fire" />
          <h3 className="mt-3 font-display text-lg uppercase tracking-wide">Anniversaires</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Réservez une table pour célébrer un anniversaire — décoration et attention spéciale sur demande.
          </p>
        </div>
        <div className="card-grill p-5">
          <Users size={22} className="text-fire" />
          <h3 className="mt-3 font-display text-lg uppercase tracking-wide">Événements en famille</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
            Baptêmes, retrouvailles, fêtes de fin d&apos;année : organisons votre événement sur mesure.
          </p>
        </div>
      </div>

      <div className="mb-14">
        <h2 className="mb-6 font-display text-3xl uppercase tracking-wide">
          Nos formules <span className="text-fire">familiales.</span>
        </h2>
        {products.length === 0 ? (
          <p className="text-sm text-muted-foreground">Les formules familiales arrivent bientôt.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} isFavorited={favoriteIds.includes(product.id)} />
            ))}
          </div>
        )}
      </div>

      <div className="card-grill flex flex-col items-center gap-4 p-8 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <h3 className="flex items-center gap-2 font-display text-2xl uppercase tracking-wide">
            <PartyPopper size={22} className="text-fire" /> Un événement à organiser ?
          </h3>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Anniversaire, baptême ou fête en famille — laissez-nous vous aider à tout organiser.
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2.5 sm:flex-row">
          <Link href="/reservation" className="btn btn-outline">
            Réserver une table
          </Link>
          <Link href="/events" className="btn btn-primary">
            Organiser un événement
          </Link>
        </div>
      </div>
    </div>
  )
}
