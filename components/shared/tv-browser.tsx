'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Play, Eye } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { PillTabs } from '@/components/ui/tabs'
import { VIDEO_CATEGORIES } from '@/lib/constants'

export interface TvVideo {
  id: string
  slug: string
  title: string
  description: string | null
  category: keyof typeof VIDEO_CATEGORIES
  thumbnailUrl: string
  durationSeconds: number | null
  viewCount: number
}

function formatDuration(seconds: number | null) {
  if (!seconds) return null
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function TvBrowser({ videos }: { videos: TvVideo[] }) {
  const [category, setCategory] = useState<'ALL' | keyof typeof VIDEO_CATEGORIES>('ALL')
  const [search, setSearch] = useState('')

  const options = useMemo(
    () => [{ value: 'ALL' as const, label: 'Tout' }, ...Object.entries(VIDEO_CATEGORIES).map(([key, label]) => ({ value: key as keyof typeof VIDEO_CATEGORIES, label }))],
    []
  )

  const filtered = videos.filter((video) => {
    const matchesCategory = category === 'ALL' || video.category === category
    const matchesSearch = search.trim().length === 0 || video.title.toLowerCase().includes(search.trim().toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PillTabs options={options} value={category} onChange={setCategory} />
        <div className="relative w-full sm:w-64">
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher une vidéo..."
            className="pl-9"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune vidéo ne correspond à votre recherche.</p>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((video) => {
            const duration = formatDuration(video.durationSeconds)
            return (
              <Link
                key={video.id}
                href={`/tv/${video.slug}`}
                className="card-grill group block overflow-hidden transition-transform hover:-translate-y-1"
              >
                <div className="relative h-48 overflow-hidden bg-muted sm:h-44">
                  <Image
                    src={video.thumbnailUrl}
                    alt={video.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 grid place-items-center bg-ink/20 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="grid size-12 place-items-center rounded-full bg-white/90 text-fire">
                      <Play size={20} fill="currentColor" />
                    </span>
                  </span>
                  <Badge variant="amber" className="absolute left-3 top-3">
                    {VIDEO_CATEGORIES[video.category] ?? video.category}
                  </Badge>
                  {duration && (
                    <span className="absolute bottom-2 right-2 rounded bg-ink/80 px-1.5 py-0.5 text-[11px] font-bold text-cream">
                      {duration}
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-display text-base uppercase leading-tight tracking-wide">{video.title}</h3>
                  {video.description && (
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{video.description}</p>
                  )}
                  <p className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Eye size={13} /> {video.viewCount.toLocaleString('fr-FR')} vues
                  </p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
