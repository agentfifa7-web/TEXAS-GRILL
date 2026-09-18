'use server'

import { prisma } from '@/lib/prisma'
import { getAIProvider, type AIMessage } from '@/lib/services/ai'

export async function askTexasAction(history: AIMessage[], userLocation?: { lat: number; lng: number } | null) {
  const [products, restaurants, promotions] = await Promise.all([
    prisma.product.findMany({
      where: { isAvailable: true },
      select: { id: true, name: true, price: true, description: true, isAvailable: true, category: { select: { name: true } } },
      take: 60,
    }),
    prisma.restaurant.findMany({
      select: { id: true, slug: true, name: true, address: true, lat: true, lng: true, status: true },
    }),
    prisma.promotion.findMany({ where: { isActive: true }, select: { title: true }, take: 5 }),
  ])

  const provider = getAIProvider()
  const reply = await provider.reply(history, {
    menu: products.map((p) => ({ ...p, category: p.category.name })),
    restaurants,
    promotionTitles: promotions.map((p) => p.title),
    userLocation,
  })

  return { reply }
}
