import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getProductBySlug, getRelatedProducts } from '@/lib/data/menu'
import { getUserFavoriteIds } from '@/lib/actions/favorites'
import { ProductDetail } from '@/components/shared/product-detail'
import { ProductCard } from '@/components/shared/product-card'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return {
    title: product.name,
    description: product.description,
    openGraph: { title: product.name, description: product.description, images: product.images },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await getServerSession(authOptions)
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const [related, favoriteIds] = await Promise.all([
    getRelatedProducts(product.categoryId, product.id),
    getUserFavoriteIds(session?.user?.id),
  ])

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.images,
    offers: { '@type': 'Offer', priceCurrency: 'XOF', price: product.price, availability: product.isAvailable ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock' },
  }

  return (
    <div className="container-grill section-py">
      {/* eslint-disable-next-line react/no-danger */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ProductDetail product={product} isFavorited={favoriteIds.includes(product.id)} />

      {related.length > 0 && (
        <section className="mt-20">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="display-heading text-3xl sm:text-4xl">
              Complétez votre <span className="text-fire">repas.</span>
            </h2>
            <Link href="/menu" className="inline-flex items-center gap-2 text-xs font-black uppercase text-fire">
              Voir le menu <ArrowRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} isFavorited={favoriteIds.includes(p.id)} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
