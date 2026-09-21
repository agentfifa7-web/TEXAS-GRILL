import { getServerSession } from '@/lib/auth'
import { can } from '@/lib/rbac'
import { AccessDenied } from '@/components/admin/access-denied'
import { RestaurantForm, type RestaurantFormValues } from '@/components/admin/restaurant-form'

const EMPTY: RestaurantFormValues = {
  slug: '',
  name: '',
  description: '',
  phone: '',
  email: '',
  address: '',
  city: 'Abidjan',
  lat: '',
  lng: '',
  status: 'OPEN',
  services: [],
  heroImage: '',
  gallery: '',
}

export default async function NewRestaurantPage() {
  const session = await getServerSession()
  if (!can(session?.user?.role, 'restaurants:manage')) return <AccessDenied />

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="eyebrow">Réseau</p>
        <h1 className="display-heading text-4xl sm:text-5xl">
          Nouveau <span className="text-fire">restaurant.</span>
        </h1>
      </div>
      <RestaurantForm initial={EMPTY} />
    </div>
  )
}
