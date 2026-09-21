import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { TvBrowser } from '@/components/shared/tv-browser'
import { PageHero } from '@/components/shared/page-hero'
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
      <PageHero
        eyebrow="Texas Grill TV"
        title={<>Le grill en <span className="text-fire">images.</span></>}
        description="Behind the grill, recettes maison, interviews et actualités — toute la vidéo Texas Grill sur une seule plateforme."
        videoSrc="/videos/hero-grill.mp4"
      />

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
