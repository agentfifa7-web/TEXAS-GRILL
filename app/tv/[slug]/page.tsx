import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Eye, Play } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { VIDEO_CATEGORIES } from '@/lib/constants'

function toEmbedUrl(url: string): string {
  try {
    const parsed = new URL(url)
    if (parsed.hostname.includes('youtu.be')) {
      const id = parsed.pathname.replace('/', '')
      return `https://www.youtube.com/embed/${id}`
    }
    const id = parsed.searchParams.get('v')
    if (id) return `https://www.youtube.com/embed/${id}`
    return url
  } catch {
    return url
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const video = await prisma.video.findUnique({ where: { slug } })
  if (!video) return {}
  return {
    title: video.title,
    description: video.description ?? `${video.title} — Texas Grill TV`,
    openGraph: {
      title: video.title,
      description: video.description ?? undefined,
      images: [video.thumbnailUrl],
    },
  }
}

export default async function VideoDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const video = await prisma.video.findUnique({ where: { slug } })
  if (!video || !video.isPublished) notFound()

  await prisma.video.update({ where: { id: video.id }, data: { viewCount: { increment: 1 } } })

  const sameCategory = await prisma.video.findMany({
    where: { isPublished: true, id: { not: video.id }, category: video.category },
    orderBy: { publishedAt: 'desc' },
    take: 4,
  })
  const others =
    sameCategory.length < 4
      ? await prisma.video.findMany({
          where: { isPublished: true, id: { not: video.id }, category: { not: video.category } },
          orderBy: { publishedAt: 'desc' },
          take: 4 - sameCategory.length,
        })
      : []
  const suggestions = [...sameCategory, ...others]

  return (
    <div className="container-grill section-py">
      <div className="mb-6">
        <p className="eyebrow">Texas Grill TV</p>
        <h1 className="display-heading text-4xl sm:text-5xl">{video.title}</h1>
      </div>

      <div className="relative mb-6 w-full overflow-hidden rounded-xl bg-ink" style={{ aspectRatio: '16 / 9' }}>
        <iframe
          src={toEmbedUrl(video.videoUrl)}
          title={video.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>

      <div className="mb-10 flex flex-wrap items-center gap-3">
        <Badge variant="amber">{VIDEO_CATEGORIES[video.category as keyof typeof VIDEO_CATEGORIES] ?? video.category}</Badge>
        <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Eye size={15} /> {(video.viewCount + 1).toLocaleString('fr-FR')} vues
        </span>
      </div>

      {video.description && (
        <p className="mb-12 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base">{video.description}</p>
      )}

      {suggestions.length > 0 && (
        <div>
          <h2 className="display-heading mb-5 text-2xl sm:text-3xl">
            Vidéos <span className="text-fire">recommandées.</span>
          </h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {suggestions.map((v) => (
              <Link
                key={v.id}
                href={`/tv/${v.slug}`}
                className="card-grill group block overflow-hidden transition-transform hover:-translate-y-1"
              >
                <div className="relative h-32 overflow-hidden bg-muted">
                  <Image
                    src={v.thumbnailUrl}
                    alt={v.title}
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-ink/20 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="grid size-9 place-items-center rounded-full bg-white/90 text-fire">
                      <Play size={16} fill="currentColor" />
                    </span>
                  </span>
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 text-sm font-bold leading-tight">{v.title}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
