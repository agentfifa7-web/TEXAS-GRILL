import type { ReactNode } from 'react'

/**
 * Video-backed intro banner reused across interior pages, mirroring the
 * homepage hero's <video poster> fallback pattern so a missing/unplayable
 * video degrades to a static image with zero extra client-side logic.
 */
export function PageHero({
  eyebrow,
  title,
  description,
  videoSrc,
  poster = '/images/misc/hero.svg',
  center = false,
}: {
  eyebrow: string
  title: ReactNode
  description?: ReactNode
  videoSrc: string
  poster?: string
  center?: boolean
}) {
  return (
    <div className="relative mb-8 min-h-[280px] overflow-hidden rounded-[2px_60px_2px_60px] sm:min-h-[360px]">
      <video
        className="absolute inset-0 h-full w-full object-cover"
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/55 to-ink/20" />
      <div
        className={`relative flex min-h-[280px] flex-col justify-end p-6 sm:min-h-[360px] sm:p-10 ${center ? 'items-center text-center' : ''}`}
      >
        <p className={`eyebrow ${center ? 'justify-center' : ''}`}>{eyebrow}</p>
        <h1 className="display-heading text-4xl text-white sm:text-6xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm text-white/80 sm:text-base">{description}</p>}
      </div>
    </div>
  )
}
