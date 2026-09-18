import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { serializeProduct } from '@/lib/data/menu'
import { ProductCard } from '@/components/shared/product-card'
import { ArrowRight, Heart } from 'lucide-react'

export default async function AccountFavoritesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login?callbackUrl=/account/favorites')
  const userId = session.user.id

  const favorites = await prisma.favorite.findMany({
    where: { userId },
    include: { product: { include: { category: true } } },
    orderBy: { createdAt: 'desc' },
  })

  const products = favorites.map((f) => serializeProduct(f.product))

  return (
    <div>
      <p className="eyebrow">Mes envies</p>
      <h1 className="display-heading text-4xl sm:text-5xl">
        Mes <span className="text-fire">favoris.</span>
      </h1>

      {products.length === 0 ? (
        <div className="mt-8 flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
          <Heart size={32} className="text-muted-foreground" />
          <p className="text-muted-foreground">Tu n&apos;as pas encore de favori.</p>
          <Link href="/menu" className="btn btn-primary mt-2">
            Voir le menu <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} isFavorited />
          ))}
        </div>
      )}
    </div>
  )
}
