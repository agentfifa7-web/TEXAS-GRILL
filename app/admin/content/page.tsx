import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { AccessDenied } from '@/components/admin/access-denied'
import { ContentManager, type AdminStory, type AdminVideo } from '@/components/admin/content-manager'

export default async function AdminContentPage() {
  const session = await getServerSession(authOptions)
  if (!can(session?.user?.role, 'content:manage')) return <AccessDenied />

  const [stories, videos] = await Promise.all([
    prisma.story.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.video.findMany({ orderBy: { createdAt: 'desc' } }),
  ])

  const storyRows: AdminStory[] = stories.map((s) => ({
    id: s.id,
    title: s.title,
    type: s.type,
    mediaUrl: s.mediaUrl,
    caption: s.caption,
    isActive: s.isActive,
  }))

  const videoRows: AdminVideo[] = videos.map((v) => ({
    id: v.id,
    title: v.title,
    slug: v.slug,
    category: v.category,
    videoUrl: v.videoUrl,
    thumbnailUrl: v.thumbnailUrl,
    isPublished: v.isPublished,
    viewCount: v.viewCount,
  }))

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Mini-CMS</p>
        <h1 className="display-heading text-4xl sm:text-5xl">
          Gestion du <span className="text-fire">contenu.</span>
        </h1>
      </div>
      <ContentManager stories={storyRows} videos={videoRows} />
    </div>
  )
}
