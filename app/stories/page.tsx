import type { Metadata } from 'next'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Grill Stories',
  description: 'Le fumoir en action, l’ambiance de nos restaurants et les dernières nouveautés Texas Grill à Abidjan.',
}

export default async function StoriesPage() {
  const stories = await prisma.story.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  return (
    <div className="container-grill section-py">
      <div className="mb-10">
        <p className="eyebrow">Grill Stories</p>
        <h1 className="display-heading text-5xl sm:text-6xl">
          Dans les <span className="text-fire">coulisses.</span>
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Photos, ambiances et nouveautés — plongez dans le quotidien des restaurants Texas Grill à Abidjan.
        </p>
      </div>

      {stories.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune story pour le moment, revenez bientôt.</p>
      ) : (
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {stories.map((story) => (
            <article key={story.id} className="card-grill break-inside-avoid overflow-hidden">
              <div className="relative w-full bg-muted" style={{ aspectRatio: '4 / 5' }}>
                <Image
                  src={story.mediaUrl}
                  alt={story.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover"
                />
                <Badge variant={story.type === 'NEWS' ? 'amber' : 'outline'} className="absolute left-3 top-3 bg-white/90">
                  {story.type === 'NEWS' ? 'Actu' : story.type === 'VIDEO' ? 'Vidéo' : 'Photo'}
                </Badge>
              </div>
              <div className="p-4">
                <h2 className="font-display text-lg uppercase leading-tight tracking-wide">{story.title}</h2>
                {story.caption && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{story.caption}</p>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
