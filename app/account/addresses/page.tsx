import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Badge } from '@/components/ui/badge'
import { MapPin, Star, Trash2 } from 'lucide-react'
import { deleteAddressAction, setDefaultAddressAction } from '@/lib/actions/addresses'
import { AddressForm } from './address-form'

export default async function AccountAddressesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/login?callbackUrl=/account/addresses')
  const userId = session.user.id

  const addresses = await prisma.address.findMany({ where: { userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] })

  return (
    <div>
      <p className="eyebrow">Livraison</p>
      <h1 className="display-heading text-4xl sm:text-5xl">
        Mes <span className="text-fire">adresses.</span>
      </h1>

      {addresses.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Aucune adresse enregistrée.
        </p>
      ) : (
        <div className="mt-8 space-y-3">
          {addresses.map((a) => (
            <div key={a.id} className="card-grill flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-fire" />
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold">{a.label}</p>
                    {a.isDefault && <Badge variant="amber">Par défaut</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ''}
                    {a.commune ? ` — ${a.commune}` : ''}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {!a.isDefault && (
                  <form
                    action={async () => {
                      'use server'
                      await setDefaultAddressAction(a.id)
                    }}
                  >
                    <button type="submit" className="btn btn-outline btn-sm">
                      <Star size={14} /> Par défaut
                    </button>
                  </form>
                )}
                <form
                  action={async () => {
                    'use server'
                    await deleteAddressAction(a.id)
                  }}
                >
                  <button type="submit" className="btn btn-outline btn-sm text-destructive">
                    <Trash2 size={14} /> Supprimer
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <AddressForm />
      </div>
    </div>
  )
}
