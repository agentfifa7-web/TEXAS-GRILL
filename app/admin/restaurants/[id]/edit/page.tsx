import { notFound } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { can } from '@/lib/rbac'
import { AccessDenied } from '@/components/admin/access-denied'
import { RestaurantForm, type RestaurantFormValues } from '@/components/admin/restaurant-form'

export default async function EditRestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  if (!can(session?.user?.role, 'restaurants:manage')) return <AccessDenied />

  const restaurant = await prisma.restaurant.findUnique({ where: { id } })
  if (!restaurant) notFound()

  let services: string[] = []
  let gallery: string[] = []
  try {
    services = JSON.parse(restaurant.servicesJson)
  } catch {
    services = []
  }
  try {
    gallery = JSON.parse(restaurant.galleryJson)
  } catch {
    gallery = []
  }

  const initial: RestaurantFormValues = {
    id: restaurant.id,
    slug: restaurant.slug,
    name: restaurant.name,
    description: restaurant.description ?? '',
    phone: restaurant.phone ?? '',
    email: restaurant.email ?? '',
    address: restaurant.address,
    city: restaurant.city,
    lat: restaurant.lat?.toString() ?? '',
    lng: restaurant.lng?.toString() ?? '',
    status: restaurant.status,
    services,
    heroImage: restaurant.heroImage ?? '',
    gallery: gallery.join(', '),
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Réseau</p>
        <h1 className="display-heading text-4xl sm:text-5xl">
          Modifier <span className="text-fire">{restaurant.name}</span>
        </h1>
      </div>
      <RestaurantForm initial={initial} />
    </div>
  )
}
