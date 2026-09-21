'use server'

import { z } from 'zod'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'

type ActionResult = { ok: true } | { ok: false; error: string }

async function requireContentManage() {
  const session = await getServerSession()
  if (!session?.user || !can(session.user.role, 'content:manage')) return null
  return session
}

const storySchema = z.object({
  title: z.string().trim().min(2),
  type: z.enum(['PHOTO', 'VIDEO', 'NEWS']),
  mediaUrl: z.string().trim().min(3),
  caption: z.string().trim().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
})
export type StoryInput = z.infer<typeof storySchema>

export async function createStoryAction(input: StoryInput): Promise<ActionResult> {
  const session = await requireContentManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  const parsed = storySchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Formulaire invalide' }

  await prisma.story.create({
    data: {
      title: parsed.data.title,
      type: parsed.data.type,
      mediaUrl: parsed.data.mediaUrl,
      caption: parsed.data.caption || null,
      isActive: parsed.data.isActive,
    },
  })

  revalidatePath('/admin/content')
  return { ok: true }
}

export async function toggleStoryActiveAction(id: string, isActive: boolean): Promise<ActionResult> {
  const session = await requireContentManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  await prisma.story.update({ where: { id }, data: { isActive } })
  revalidatePath('/admin/content')
  return { ok: true }
}

export async function deleteStoryAction(id: string): Promise<ActionResult> {
  const session = await requireContentManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  await prisma.story.delete({ where: { id } })
  revalidatePath('/admin/content')
  return { ok: true }
}

const videoSchema = z.object({
  title: z.string().trim().min(2),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des minuscules, chiffres et tirets'),
  description: z.string().trim().optional().or(z.literal('')),
  category: z.enum(['BEHIND_THE_GRILL', 'EVENTS', 'INTERVIEWS', 'NEWS', 'RECIPES', 'LIFESTYLE']),
  videoUrl: z.string().trim().min(3),
  thumbnailUrl: z.string().trim().min(3),
  isPublished: z.boolean().default(true),
})
export type VideoInput = z.infer<typeof videoSchema>

export async function createVideoAction(input: VideoInput): Promise<ActionResult> {
  const session = await requireContentManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  const parsed = videoSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'Formulaire invalide' }

  const existing = await prisma.video.findUnique({ where: { slug: parsed.data.slug } })
  if (existing) return { ok: false, error: 'Ce slug est déjà utilisé' }

  await prisma.video.create({
    data: {
      title: parsed.data.title,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
      category: parsed.data.category,
      videoUrl: parsed.data.videoUrl,
      thumbnailUrl: parsed.data.thumbnailUrl,
      isPublished: parsed.data.isPublished,
      publishedAt: parsed.data.isPublished ? new Date() : null,
    },
  })

  revalidatePath('/admin/content')
  return { ok: true }
}

export async function togglePublishVideoAction(id: string, isPublished: boolean): Promise<ActionResult> {
  const session = await requireContentManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  await prisma.video.update({ where: { id }, data: { isPublished, publishedAt: isPublished ? new Date() : null } })
  revalidatePath('/admin/content')
  return { ok: true }
}

export async function deleteVideoAction(id: string): Promise<ActionResult> {
  const session = await requireContentManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  await prisma.video.delete({ where: { id } })
  revalidatePath('/admin/content')
  return { ok: true }
}
