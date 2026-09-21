import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { serializeProduct } from '@/lib/data/menu'
import { BuildYourGrill } from '@/components/shared/build-your-grill'
import { PageHero } from '@/components/shared/page-hero'

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
      <PageHero
        eyebrow="Votre assiette, vos règles"
        title={<>Build Your <span className="text-fire">Grill.</span></>}
        description="Choisissez votre base, ajoutez votre accompagnement, votre sauce et vos extras. Le prix se met à jour en temps réel."
        videoSrc="/videos/hero-grill.mp4"
      />
      <BuildYourGrill
        bases={bases.map(serializeProduct).map((p) => ({ id: p.id, name: p.name, price: p.price, image: p.images[0] }))}
        accompaniments={accompaniments.map(serializeProduct).map((p) => ({ id: p.id, name: p.name, price: p.price }))}
      />
    </div>
  )
}
