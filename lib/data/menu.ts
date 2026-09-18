import { prisma } from '@/lib/prisma'
import { parseJson } from '@/lib/json'

export async function getCategories() {
  return prisma.menuCategory.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } })
}

export interface ProductListFilters {
  categorySlug?: string
  search?: string
  restaurantId?: string
  sort?: 'popular' | 'price-asc' | 'price-desc' | 'new'
}

export async function getProducts(filters: ProductListFilters = {}) {
  const products = await prisma.product.findMany({
    where: {
      isAvailable: true,
      category: filters.categorySlug ? { slug: filters.categorySlug } : undefined,
      name: filters.search ? { contains: filters.search } : undefined,
    },
    include: { category: true, options: { include: { values: true } }, addons: true },
    orderBy:
      filters.sort === 'price-asc'
        ? { price: 'asc' }
        : filters.sort === 'price-desc'
          ? { price: 'desc' }
          : filters.sort === 'new'
            ? { createdAt: 'desc' }
            : [{ isFeatured: 'desc' }, { sortOrder: 'asc' }],
  })

  return products
    .filter((p) => !filters.restaurantId || !parseJson<string[]>(p.unavailableAtJson, []).includes(filters.restaurantId))
    .map(serializeProduct)
}

export function serializeProduct<
  T extends {
    imagesJson: string
    ingredientsJson: string
    allergensJson: string
    unavailableAtJson: string
  },
>(product: T) {
  return {
    ...product,
    images: parseJson<string[]>(product.imagesJson, []),
    ingredients: parseJson<string[]>(product.ingredientsJson, []),
    allergens: parseJson<string[]>(product.allergensJson, []),
  }
}

export async function getProductBySlug(slug: string) {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: true,
      options: { include: { values: { orderBy: { sortOrder: 'asc' } } }, orderBy: { sortOrder: 'asc' } },
      addons: { orderBy: { sortOrder: 'asc' } },
      reviews: { where: { status: 'PUBLISHED' }, include: { user: true }, orderBy: { createdAt: 'desc' }, take: 10 },
    },
  })
  if (!product) return null
  return serializeProduct(product)
}

export async function getFeaturedProducts(take = 4) {
  const products = await prisma.product.findMany({
    where: { isAvailable: true, isFeatured: true },
    include: { category: true },
    orderBy: { sortOrder: 'asc' },
    take,
  })
  return products.map(serializeProduct)
}

export async function getRelatedProducts(categoryId: string, excludeId: string, take = 4) {
  const products = await prisma.product.findMany({
    where: { categoryId, isAvailable: true, id: { not: excludeId } },
    include: { category: true },
    take,
  })
  return products.map(serializeProduct)
}
