import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { AccessDenied } from '@/components/admin/access-denied'
import { ProductForm, type ProductFormValues } from '@/components/admin/product-form'

const EMPTY: ProductFormValues = {
  slug: '',
  name: '',
  description: '',
  price: '',
  compareAtPrice: '',
  categoryId: '',
  restaurantId: '',
  images: '',
  ingredients: '',
  allergens: '',
  isAvailable: true,
  isFeatured: false,
  isNew: false,
  badge: '',
  sortOrder: '0',
}

export default async function NewProductPage() {
  const session = await getServerSession()
  if (!can(session?.user?.role, 'products:manage')) return <AccessDenied />

  const [categories, restaurants] = await Promise.all([
    prisma.menuCategory.findMany({ orderBy: { name: 'asc' } }),
    prisma.restaurant.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Catalogue</p>
        <h1 className="display-heading text-4xl sm:text-5xl">
          Nouveau <span className="text-fire">produit.</span>
        </h1>
      </div>
      <ProductForm initial={EMPTY} categories={categories} restaurants={restaurants} />
    </div>
  )
}
