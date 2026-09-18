'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Bike, Check, CreditCard, Package, Smartphone, Store, Wallet } from 'lucide-react'
import { useCart } from '@/components/providers/cart-provider'
import { submitCheckoutAction } from '@/lib/actions/checkout'
import { formatXOF, ORDER_TYPE_LABELS, PAYMENT_METHOD_LABELS, type OrderType } from '@/lib/constants'
import type { CheckoutInput } from '@/lib/validations'
import { getTableSession, clearTableSession, type TableSessionData } from '@/lib/table-session'
import { cn } from '@/lib/utils'

interface Restaurant {
  id: string
  name: string
  address: string
  status: string
}
interface Address {
  id: string
  label: string
  line1: string
  commune: string | null
  isDefault: boolean
}

const STEPS = ['Type de commande', 'Détails', 'Paiement', 'Confirmation'] as const
const PAYMENT_METHODS: CheckoutInput['paymentMethod'][] = ['MOBILE_MONEY', 'CARD', 'CASH']

export function CheckoutWizard({
  restaurants,
  addresses,
  defaultContact,
}: {
  restaurants: Restaurant[]
  addresses: Address[]
  defaultContact: { name: string; phone: string; email: string } | null
}) {
  const router = useRouter()
  const { items, subtotal, orderType, setOrderType } = useCart()
  const [step, setStep] = useState(0)
  const [restaurantId, setRestaurantId] = useState(restaurants.find((r) => r.status === 'OPEN')?.id ?? '')
  const [addressId, setAddressId] = useState(addresses.find((a) => a.isDefault)?.id ?? addresses[0]?.id ?? '')
  const [newAddressLine, setNewAddressLine] = useState('')
  const [newAddressCommune, setNewAddressCommune] = useState('')
  const [useNewAddress, setUseNewAddress] = useState(addresses.length === 0)
  const [scheduled, setScheduled] = useState(false)
  const [scheduledFor, setScheduledFor] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<CheckoutInput['paymentMethod']>('MOBILE_MONEY')
  const [couponCode, setCouponCode] = useState('')
  const [contactName, setContactName] = useState(defaultContact?.name ?? '')
  const [contactPhone, setContactPhone] = useState(defaultContact?.phone ?? '')
  const [contactEmail, setContactEmail] = useState(defaultContact?.email ?? '')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [tableSession, setTableSessionState] = useState<TableSessionData | null>(null)

  useEffect(() => {
    const session = getTableSession()
    setTableSessionState(session)
    if (session) {
      setOrderType('DINE_IN', session.restaurantId)
      setRestaurantId(session.restaurantId)
      setStep(2)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const estimatedFee = orderType === 'DELIVERY' ? 1000 : 0
  const estimatedTotal = subtotal + estimatedFee

  const stepValid = useMemo(() => {
    if (step === 0) return Boolean(orderType)
    if (step === 1) {
      if (!restaurantId) return false
      if (orderType === 'DELIVERY') return useNewAddress ? newAddressLine.trim().length > 3 : Boolean(addressId)
      return true
    }
    if (step === 2) return Boolean(paymentMethod) && contactName.trim().length > 1 && /^\+?[0-9\s]{8,15}$/.test(contactPhone)
    return true
  }, [step, orderType, restaurantId, useNewAddress, newAddressLine, addressId, paymentMethod, contactName, contactPhone])

  async function handleSubmit() {
    setSubmitting(true)
    try {
      const input: CheckoutInput = {
        orderType,
        restaurantId,
        addressId: orderType === 'DELIVERY' && !useNewAddress ? addressId : undefined,
        newAddress:
          orderType === 'DELIVERY' && useNewAddress
            ? { label: 'Adresse de livraison', line1: newAddressLine, commune: newAddressCommune }
            : undefined,
        scheduledFor: scheduled && scheduledFor ? new Date(scheduledFor).toISOString() : undefined,
        tableId: tableSession?.tableId,
        paymentMethod,
        couponCode: couponCode || undefined,
        contactName,
        contactPhone,
        contactEmail: contactEmail || undefined,
        notes: notes || undefined,
      }
      const result = await submitCheckoutAction(input)
      if (!result.ok) {
        toast.error(result.error)
        return
      }
      clearTableSession()
      toast.success('Commande confirmée 🔥')
      router.push(`/order/${result.orderId}/confirmation`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return <p className="text-muted-foreground">Votre panier est vide — ajoutez des produits avant de passer commande.</p>
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        {tableSession && (
          <div className="mb-6 rounded-lg border border-fire/30 bg-fire/5 px-4 py-3 text-sm font-semibold text-fire">
            Commande sur place — Table {tableSession.tableNumber} · {tableSession.restaurantName}
          </div>
        )}
        <div className="mb-8 flex gap-1.5">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div className={cn('h-1.5 rounded-full', i <= step ? 'bg-fire' : 'bg-muted')} />
              <p className={cn('mt-2 text-[10px] font-bold uppercase', i <= step ? 'text-fire' : 'text-muted-foreground')}>{label}</p>
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {(['DELIVERY', 'PICKUP', 'DINE_IN'] as OrderType[]).map((type) => {
              const Icon = type === 'DELIVERY' ? Bike : type === 'PICKUP' ? Package : Store
              return (
                <button
                  key={type}
                  onClick={() => setOrderType(type)}
                  className={cn(
                    'flex flex-col items-center gap-2 rounded-xl border-2 p-6 transition-colors',
                    orderType === type ? 'border-fire bg-fire/5' : 'border-border hover:border-fire/50'
                  )}
                >
                  <Icon size={26} className={orderType === type ? 'text-fire' : 'text-muted-foreground'} />
                  <span className="text-sm font-bold">{ORDER_TYPE_LABELS[type]}</span>
                </button>
              )
            })}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide">Restaurant</p>
              <div className="space-y-2">
                {restaurants.map((r) => (
                  <label
                    key={r.id}
                    className={cn(
                      'flex cursor-pointer items-center justify-between rounded-lg border px-4 py-3 text-sm',
                      restaurantId === r.id ? 'border-fire bg-fire/5' : 'border-border',
                      r.status !== 'OPEN' && 'opacity-50'
                    )}
                  >
                    <div>
                      <input
                        type="radio"
                        name="restaurant"
                        className="sr-only"
                        checked={restaurantId === r.id}
                        disabled={r.status !== 'OPEN'}
                        onChange={() => setRestaurantId(r.id)}
                      />
                      <p className="font-bold">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.address}</p>
                    </div>
                    {r.status !== 'OPEN' && <span className="text-[10px] font-bold uppercase text-destructive">Fermé</span>}
                  </label>
                ))}
              </div>
            </div>

            {orderType === 'DELIVERY' && (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-wide">Adresse de livraison</p>
                {addresses.length > 0 && !useNewAddress && (
                  <div className="space-y-2">
                    {addresses.map((a) => (
                      <label key={a.id} className={cn('flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm', addressId === a.id ? 'border-fire bg-fire/5' : 'border-border')}>
                        <input type="radio" name="address" checked={addressId === a.id} onChange={() => setAddressId(a.id)} />
                        <div>
                          <p className="font-bold">{a.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {a.line1}
                            {a.commune ? `, ${a.commune}` : ''}
                          </p>
                        </div>
                      </label>
                    ))}
                    <button onClick={() => setUseNewAddress(true)} className="text-xs font-bold text-fire">
                      + Utiliser une nouvelle adresse
                    </button>
                  </div>
                )}
                {(useNewAddress || addresses.length === 0) && (
                  <div className="space-y-3">
                    <input
                      value={newAddressLine}
                      onChange={(e) => setNewAddressLine(e.target.value)}
                      placeholder="Rue, quartier, repère…"
                      className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm focus-visible:border-primary focus-visible:outline-none"
                    />
                    <input
                      value={newAddressCommune}
                      onChange={(e) => setNewAddressCommune(e.target.value)}
                      placeholder="Commune (ex: Cocody, Riviera…)"
                      className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm focus-visible:border-primary focus-visible:outline-none"
                    />
                    {addresses.length > 0 && (
                      <button onClick={() => setUseNewAddress(false)} className="text-xs font-bold text-muted-foreground">
                        Utiliser une adresse enregistrée
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="flex items-center gap-2 text-sm font-bold">
                <input type="checkbox" checked={scheduled} onChange={(e) => setScheduled(e.target.checked)} /> Programmer ma commande
              </label>
              {scheduled && (
                <input
                  type="datetime-local"
                  value={scheduledFor}
                  onChange={(e) => setScheduledFor(e.target.value)}
                  className="mt-2 w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm"
                />
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide">Moyen de paiement</p>
              <div className="grid grid-cols-3 gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method === 'MOBILE_MONEY' ? Smartphone : method === 'CARD' ? CreditCard : Wallet
                  return (
                    <button
                      key={method}
                      onClick={() => setPaymentMethod(method)}
                      className={cn('flex flex-col items-center gap-1.5 rounded-xl border-2 p-4', paymentMethod === method ? 'border-fire bg-fire/5' : 'border-border')}
                    >
                      <Icon size={20} className={paymentMethod === method ? 'text-fire' : 'text-muted-foreground'} />
                      <span className="text-[11px] font-bold">{PAYMENT_METHOD_LABELS[method]}</span>
                    </button>
                  )
                })}
              </div>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Field label="Nom complet" value={contactName} onChange={setContactName} />
              <Field label="Téléphone" value={contactPhone} onChange={setContactPhone} placeholder="+225 07 00 00 00 00" />
              <Field label="Email (optionnel)" value={contactEmail} onChange={setContactEmail} />
              <Field label="Code promo (optionnel)" value={couponCode} onChange={(v) => setCouponCode(v.toUpperCase())} />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide">Note pour le restaurant</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm"
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 rounded-xl border border-border p-5">
            <Summary label="Type" value={ORDER_TYPE_LABELS[orderType]} />
            <Summary label="Restaurant" value={restaurants.find((r) => r.id === restaurantId)?.name ?? '—'} />
            {orderType === 'DELIVERY' && (
              <Summary label="Adresse" value={useNewAddress ? newAddressLine : addresses.find((a) => a.id === addressId)?.line1 ?? '—'} />
            )}
            <Summary label="Paiement" value={PAYMENT_METHOD_LABELS[paymentMethod]} />
            <Summary label="Contact" value={`${contactName} · ${contactPhone}`} />
            <button onClick={handleSubmit} disabled={submitting} className="btn btn-primary w-full">
              <Check size={17} /> {submitting ? 'Envoi en cours…' : 'Confirmer la commande'}
            </button>
          </div>
        )}

        <div className="mt-8 flex justify-between">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn btn-outline disabled:opacity-40">
            Précédent
          </button>
          {step < STEPS.length - 1 && (
            <button onClick={() => setStep((s) => s + 1)} disabled={!stepValid} className="btn btn-primary disabled:opacity-40">
              Continuer
            </button>
          )}
        </div>
      </div>

      <aside className="h-fit rounded-xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-24">
        <p className="font-display text-xl uppercase">Votre commande</p>
        <div className="mt-3 space-y-1.5 text-sm">
          {items.map((item) => (
            <div key={item.id} className="flex justify-between">
              <span className="text-muted-foreground">
                {item.quantity}× {item.product.name}
              </span>
              <span>{formatXOF(item.subtotal)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sous-total</span>
            <span>{formatXOF(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Livraison estimée</span>
            <span>{estimatedFee > 0 ? formatXOF(estimatedFee) : 'Gratuit'}</span>
          </div>
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3">
          <strong>Total estimé</strong>
          <strong className="price-tag text-fire">{formatXOF(estimatedTotal)}</strong>
        </div>
      </aside>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-bold uppercase tracking-wide">{label}</label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-md border border-input bg-background px-3.5 py-2.5 text-sm focus-visible:border-primary focus-visible:outline-none"
      />
    </div>
  )
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  )
}
