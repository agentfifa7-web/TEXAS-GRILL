'use server'

import { z } from 'zod'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const restaurantSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des minuscules, chiffres et tirets'),
  name: z.string().trim().min(2),
  description: z.string().trim().optional().or(z.literal('')),
  phone: z.string().trim().optional().or(z.literal('')),
  email: z.string().trim().email('Email invalide').optional().or(z.literal('')),
  address: z.string().trim().min(3),
  city: z.string().trim().min(2).default('Abidjan'),
  lat: z.coerce.number().optional().nullable(),
  lng: z.coerce.number().optional().nullable(),
  status: z.enum(['OPEN', 'CLOSED', 'COMING_SOON']),
  services: z.array(z.string()).default([]),
  heroImage: z.string().trim().optional().or(z.literal('')),
  gallery: z.array(z.string()).default([]),
})

export type RestaurantFormInput = z.infer<typeof restaurantSchema>
export type ActionResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> }

async function requireRestaurantsManage() {
  const session = await getServerSession()
  if (!session?.user || !can(session.user.role, 'restaurants:manage')) {
    return null
  }
  return session
}

function toData(parsed: RestaurantFormInput) {
  return {
    slug: parsed.slug,
    name: parsed.name,
    description: parsed.description || null,
    phone: parsed.phone || null,
    email: parsed.email || null,
    address: parsed.address,
    city: parsed.city,
    lat: parsed.lat ?? null,
    lng: parsed.lng ?? null,
    status: parsed.status,
    servicesJson: JSON.stringify(parsed.services),
    heroImage: parsed.heroImage || null,
    galleryJson: JSON.stringify(parsed.gallery),
  }
}

export async function createRestaurantAction(input: RestaurantFormInput): Promise<ActionResult> {
  const session = await requireRestaurantsManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  const parsed = restaurantSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Formulaire invalide', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  const existing = await prisma.restaurant.findUnique({ where: { slug: parsed.data.slug } })
  if (existing) return { ok: false, error: 'Ce slug est déjà utilisé par un autre restaurant' }

  const restaurant = await prisma.restaurant.create({ data: toData(parsed.data) })

  revalidatePath('/admin/restaurants')
  redirect(`/admin/restaurants/${restaurant.id}/edit`)
}

export async function updateRestaurantAction(id: string, input: RestaurantFormInput): Promise<ActionResult> {
  const session = await requireRestaurantsManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  const parsed = restaurantSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Formulaire invalide', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  const conflict = await prisma.restaurant.findFirst({ where: { slug: parsed.data.slug, NOT: { id } } })
  if (conflict) return { ok: false, error: 'Ce slug est déjà utilisé par un autre restaurant' }

  await prisma.restaurant.update({ where: { id }, data: toData(parsed.data) })

  revalidatePath('/admin/restaurants')
  revalidatePath(`/admin/restaurants/${id}/edit`)
  return { ok: true }
}

export async function deleteRestaurantAction(id: string): Promise<ActionResult> {
  const session = await requireRestaurantsManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  const productsCount = await prisma.product.count({ where: { restaurantId: id } })
  const ordersCount = await prisma.order.count({ where: { restaurantId: id } })
  if (productsCount > 0 || ordersCount > 0) {
    return { ok: false, error: 'Impossible de supprimer : ce restaurant a des produits ou commandes associés. Passez-le en "Fermé" à la place.' }
  }

  await prisma.restaurant.delete({ where: { id } })
  revalidatePath('/admin/restaurants')
  return { ok: true }
}
