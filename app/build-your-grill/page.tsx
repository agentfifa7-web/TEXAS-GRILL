import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { serializeProduct } from '@/lib/data/menu'
import { BuildYourGrill } from '@/components/shared/build-your-grill'

export const metadata: Metadata = {
  title: 'Build Your Grill',
  description: 'Composez votre assiette Texas Grill : choisissez votre base, votre accompagnement, votre sauce et vos extras.',
}

const BASE_SLUGS = ['classic-cheeseburger', 'ribeye-steak', 'poulet-braise', 'baby-back-ribs', 'brochettes-boeuf', 'mix-grill-texas']

export default async function BuildYourGrillPage() {
  const [bases, accompaniments] = await Promise.all([
    prisma.product.findMany({ where: { slug: { in: BASE_SLUGS }, isAvailable: true } }),
    prisma.product.findMany({ where: { category: { slug: 'accompagnements' }, isAvailable: true } }),
  ])

  return (
    <div className="container-grill section-py">
      <div className="mb-10 max-w-xl">
        <p className="eyebrow">Votre assiette, vos règles</p>
        <h1 className="display-heading text-5xl sm:text-6xl">
          Build Your <span className="text-fire">Grill.</span>
        </h1>
        <p className="mt-4 text-[15px] text-muted-foreground">
          Choisissez votre base, ajoutez votre accompagnement, votre sauce et vos extras. Le prix se met à jour en temps réel.
        </p>
      </div>
      <BuildYourGrill
        bases={bases.map(serializeProduct).map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.images[0] }))}
        accompaniments={accompaniments.map(serializeProduct).map((p) => ({ id: p.id, name: p.name, price: p.price }))}
      />
    </div>
  )
}
