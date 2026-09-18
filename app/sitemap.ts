import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'
import { getSiteUrl } from '@/lib/constants'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl()

  const staticRoutes = [
    '', '/menu', '/build-your-grill', '/restaurants', '/reservation', '/rewards', '/deals',
    '/family', '/events', '/corporate', '/stories', '/tv', '/login', '/register',
  ].map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: path === '' ? 1 : 0.7,
  }))

  const [products, restaurants, videos] = await Promise.all([
    prisma.product.findMany({ where: { isAvailable: true }, select: { slug: true, updatedAt: true } }),
    prisma.restaurant.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.video.findMany({ where: { isPublished: true }, select: { slug: true } }),
  ])

  return [
    ...staticRoutes,
    ...products.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: p.updatedAt, changeFrequency: 'weekly' as const, priority: 0.6 })),
    ...restaurants.map((r) => ({ url: `${base}/restaurants/${r.slug}`, lastModified: r.updatedAt, changeFrequency: 'weekly' as const, priority: 0.6 })),
    ...videos.map((v) => ({ url: `${base}/tv/${v.slug}`, changeFrequency: 'monthly' as const, priority: 0.4 })),
  ]
}
