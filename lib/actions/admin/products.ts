'use server'

import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

const productSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Le slug ne peut contenir que des minuscules, chiffres et tirets'),
  name: z.string().trim().min(2),
  description: z.string().trim().min(1, 'Description requise'),
  price: z.coerce.number().int().min(0),
  compareAtPrice: z.coerce.number().int().min(0).optional().nullable(),
  categoryId: z.string().trim().min(1, 'Catégorie requise'),
  restaurantId: z.string().trim().optional().or(z.literal('')),
  images: z.array(z.string()).default([]),
  ingredients: z.array(z.string()).default([]),
  allergens: z.array(z.string()).default([]),
  isAvailable: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isNew: z.boolean().default(false),
  badge: z.string().trim().optional().or(z.literal('')),
  sortOrder: z.coerce.number().int().default(0),
})

export type ProductFormInput = z.infer<typeof productSchema>
export type ActionResult = { ok: true } | { ok: false; error: string; fieldErrors?: Record<string, string> }

async function requireProductsManage() {
  const session = await getServerSession(authOptions)
  if (!session?.user || !can(session.user.role, 'products:manage')) return null
  return session
}

function toData(parsed: ProductFormInput) {
  return {
    slug: parsed.slug,
    name: parsed.name,
    description: parsed.description,
    price: parsed.price,
    compareAtPrice: parsed.compareAtPrice ?? null,
    categoryId: parsed.categoryId,
    restaurantId: parsed.restaurantId || null,
    imagesJson: JSON.stringify(parsed.images),
    ingredientsJson: JSON.stringify(parsed.ingredients),
    allergensJson: JSON.stringify(parsed.allergens),
    isAvailable: parsed.isAvailable,
    isFeatured: parsed.isFeatured,
    isNew: parsed.isNew,
    badge: parsed.badge || null,
    sortOrder: parsed.sortOrder,
  }
}

export async function createProductAction(input: ProductFormInput): Promise<ActionResult> {
  const session = await requireProductsManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  const parsed = productSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Formulaire invalide', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  const existing = await prisma.product.findUnique({ where: { slug: parsed.data.slug } })
  if (existing) return { ok: false, error: 'Ce slug est déjà utilisé par un autre produit' }

  const product = await prisma.product.create({ data: toData(parsed.data) })

  revalidatePath('/admin/products')
  redirect(`/admin/products/${product.id}/edit`)
}

export async function updateProductAction(id: string, input: ProductFormInput): Promise<ActionResult> {
  const session = await requireProductsManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  const parsed = productSchema.safeParse(input)
  if (!parsed.success) {
    return { ok: false, error: 'Formulaire invalide', fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> }
  }

  const conflict = await prisma.product.findFirst({ where: { slug: parsed.data.slug, NOT: { id } } })
  if (conflict) return { ok: false, error: 'Ce slug est déjà utilisé par un autre produit' }

  await prisma.product.update({ where: { id }, data: toData(parsed.data) })

  revalidatePath('/admin/products')
  revalidatePath(`/admin/products/${id}/edit`)
  return { ok: true }
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const session = await requireProductsManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  const orderItemsCount = await prisma.orderItem.count({ where: { productId: id } })
  if (orderItemsCount > 0) {
    return { ok: false, error: 'Impossible de supprimer : ce produit apparaît dans des commandes existantes. Désactivez-le à la place.' }
  }

  await prisma.product.delete({ where: { id } })
  revalidatePath('/admin/products')
  return { ok: true }
}

export async function toggleProductAvailabilityAction(id: string, isAvailable: boolean): Promise<ActionResult> {
  const session = await requireProductsManage()
  if (!session) return { ok: false, error: 'Permission refusée' }

  await prisma.product.update({ where: { id }, data: { isAvailable } })
  revalidatePath('/admin/products')
  return { ok: true }
}
