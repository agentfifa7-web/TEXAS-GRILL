import type { Metadata } from 'next'
import { getServerSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getRestaurants } from '@/lib/data/restaurants'
import { CheckoutWizard } from '@/components/shared/checkout-wizard'

export const metadata: Metadata = { title: 'Checkout' }

export default async function CheckoutPage() {
  const session = await getServerSession()
  const [restaurants, addresses, user] = await Promise.all([
    getRestaurants(),
    session?.user?.id ? prisma.address.findMany({ where: { userId: session.user.id }, orderBy: { isDefault: 'desc' } }) : Promise.resolve([]),
    session?.user?.id ? prisma.user.findUnique({ where: { id: session.user.id } }) : Promise.resolve(null),
  ])

  return (
    <div className="container-grill section-py">
      <h1 className="display-heading mb-8 text-5xl">
        <span className="text-fire">Checkout.</span>
      </h1>
      <CheckoutWizard
        restaurants={restaurants.map((r) => ({ id: r.id, name: r.name, address: r.address, status: r.status }))}
        addresses={addresses}
        defaultContact={user ? { name: user.name, phone: user.phone ?? '', email: user.email } : null}
      />
    </div>
  )
}
