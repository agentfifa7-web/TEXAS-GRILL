import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { TvBrowser } from '@/components/shared/tv-browser'
import type { VIDEO_CATEGORIES } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'Texas Grill TV',
  description: 'Behind the grill, recettes, interviews et nouveautés — toutes les vidéos Texas Grill en un seul endroit.',
}

export default async function TvPage() {
  const videos = await prisma.video.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
  })

  return (
    <div className="container-grill section-py">
      <div className="mb-8">
        <p className="eyebrow">Texas Grill TV</p>
        <h1 className="display-heading text-5xl sm:text-6xl">
          Le grill en <span className="text-fire">images.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Behind the grill, recettes maison, interviews et actualités — toute la vidéo Texas Grill sur une seule
          plateforme.
        </p>
      </div>

      <TvBrowser
        videos={videos.map((v) => ({
          id: v.id,
          slug: v.slug,
          title: v.title,
          description: v.description,
          category: v.category as keyof typeof VIDEO_CATEGORIES,
          thumbnailUrl: v.thumbnailUrl,
          durationSeconds: v.durationSeconds,
          viewCount: v.viewCount,
        }))}
      />
    </div>
  )
}
