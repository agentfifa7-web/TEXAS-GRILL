import { notFound } from 'next/navigation'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { AccessDenied } from '@/components/admin/access-denied'
import { ProductForm, type ProductFormValues } from '@/components/admin/product-form'

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession()
  if (!can(session?.user?.role, 'products:manage')) return <AccessDenied />

  const [product, categories, restaurants] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.menuCategory.findMany({ orderBy: { name: 'asc' } }),
    prisma.restaurant.findMany({ orderBy: { name: 'asc' } }),
  ])

  if (!product) notFound()

  let images: string[] = []
  let ingredients: string[] = []
  let allergens: string[] = []
  try {
    images = JSON.parse(product.imagesJson)
  } catch {
    images = []
  }
  try {
    ingredients = JSON.parse(product.ingredientsJson)
  } catch {
    ingredients = []
  }
  try {
    allergens = JSON.parse(product.allergensJson)
  } catch {
    allergens = []
  }

  const initial: ProductFormValues = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: String(product.price),
    compareAtPrice: product.compareAtPrice != null ? String(product.compareAtPrice) : '',
    categoryId: product.categoryId,
    restaurantId: product.restaurantId ?? '',
    images: images.join(', '),
    ingredients: ingredients.join(', '),
    allergens: allergens.join(', '),
    isAvailable: product.isAvailable,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    badge: product.badge ?? '',
    sortOrder: String(product.sortOrder),
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Catalogue</p>
        <h1 className="display-heading text-4xl sm:text-5xl">
          Modifier <span className="text-fire">{product.name}</span>
        </h1>
      </div>
      <ProductForm initial={initial} categories={categories} restaurants={restaurants} />
    </div>
  )
}
