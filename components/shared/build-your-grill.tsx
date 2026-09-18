'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Check, Flame } from 'lucide-react'
import { useCart } from '@/components/providers/cart-provider'
import { formatXOF } from '@/lib/constants'
import { cn } from '@/lib/utils'

interface Base {
  id: string
  name: string
  price: number
  image?: string
}
interface Accompaniment {
  id: string
  name: string
  price: number
}

const SAUCES = [
  { id: 'bbq', label: 'BBQ maison' },
  { id: 'piquante', label: 'Piquante' },
  { id: 'poivre', label: 'Poivre' },
  { id: 'sans', label: 'Sans sauce' },
]

const EXTRAS = [
  { id: 'bacon', name: 'Bacon supplémentaire', price: 800 },
  { id: 'cheddar', name: 'Cheddar supplémentaire', price: 500 },
  { id: 'oeuf', name: 'Œuf au plat', price: 700 },
  { id: 'sauce-extra', name: 'Sauce supplémentaire', price: 500 },
]

const STEPS = ['Base', 'Accompagnement', 'Sauce', 'Extras'] as const

export function BuildYourGrill({ bases, accompaniments }: { bases: Base[]; accompaniments: Accompaniment[] }) {
  const { addItem } = useCart()
  const [step, setStep] = useState(0)
  const [base, setBase] = useState<Base | null>(bases[0] ?? null)
  const [accompaniment, setAccompaniment] = useState<Accompaniment | null>(accompaniments[0] ?? null)
  const [sauce, setSauce] = useState(SAUCES[0])
  const [extras, setExtras] = useState<string[]>([])
  const [quantity, setQuantity] = useState(1)
  const [submitting, setSubmitting] = useState(false)

  const extrasTotal = EXTRAS.filter((e) => extras.includes(e.id)).reduce((sum, e) => sum + e.price, 0)
  const total = ((base?.price ?? 0) + (accompaniment?.price ?? 0) + extrasTotal) * quantity

  const canSubmit = Boolean(base)

  async function handleAdd() {
    if (!base) return
    setSubmitting(true)
    try {
      await addItem({
        productId: base.id,
        quantity,
        selectedOptions: [{ optionId: 'sauce', optionName: 'Sauce', valueId: sauce.id, label: sauce.label, priceDelta: 0 }],
        selectedAddons: [
          ...(accompaniment ? [{ addonId: accompaniment.id, name: accompaniment.name, price: accompaniment.price, quantity: 1 }] : []),
          ...EXTRAS.filter((e) => extras.includes(e.id)).map((e) => ({ addonId: e.id, name: e.name, price: e.price, quantity: 1 })),
        ],
        note: `Build Your Grill — ${base.name} · ${accompaniment?.name ?? 'sans accompagnement'} · ${sauce.label}`,
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
      <div>
        <div className="mb-7 flex gap-2">
          {STEPS.map((label, i) => (
            <button
              key={label}
              onClick={() => setStep(i)}
              className={cn(
                'flex-1 rounded-full border px-3 py-2.5 text-center text-[11px] font-black uppercase tracking-wide transition-colors',
                step === i ? 'border-ink bg-ink text-cream' : 'border-border text-muted-foreground'
              )}
            >
              {i + 1}. {label}
            </button>
          ))}
        </div>

        {step === 0 && (
          <StepGrid>
            {bases.map((b) => (
              <OptionCard key={b.id} selected={base?.id === b.id} onClick={() => setBase(b)} title={b.name} subtitle={formatXOF(b.price)} image={b.image} />
            ))}
          </StepGrid>
        )}
        {step === 1 && (
          <StepGrid>
            {accompaniments.map((a) => (
              <OptionCard key={a.id} selected={accompaniment?.id === a.id} onClick={() => setAccompaniment(a)} title={a.name} subtitle={formatXOF(a.price)} />
            ))}
          </StepGrid>
        )}
        {step === 2 && (
          <StepGrid>
            {SAUCES.map((s) => (
              <OptionCard key={s.id} selected={sauce.id === s.id} onClick={() => setSauce(s)} title={s.label} />
            ))}
          </StepGrid>
        )}
        {step === 3 && (
          <StepGrid>
            {EXTRAS.map((e) => (
              <OptionCard
                key={e.id}
                selected={extras.includes(e.id)}
                onClick={() => setExtras((prev) => (prev.includes(e.id) ? prev.filter((id) => id !== e.id) : [...prev, e.id]))}
                title={e.name}
                subtitle={`+${formatXOF(e.price)}`}
              />
            ))}
          </StepGrid>
        )}

        <div className="mt-7 flex justify-between">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn btn-outline disabled:opacity-40">
            Précédent
          </button>
          <button onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))} disabled={step === STEPS.length - 1} className="btn btn-outline disabled:opacity-40">
            Suivant
          </button>
        </div>
      </div>

      <aside className="h-fit rounded-xl border border-border bg-card p-6 shadow-sm lg:sticky lg:top-24">
        <div className="flex items-center gap-2">
          <Flame size={20} className="text-fire" />
          <p className="font-display text-xl uppercase">Résumé</p>
        </div>
        <dl className="mt-4 space-y-2 text-sm">
          <Row label="Base" value={base?.name ?? '—'} price={base?.price} />
          <Row label="Accompagnement" value={accompaniment?.name ?? '—'} price={accompaniment?.price} />
          <Row label="Sauce" value={sauce.label} />
          {extras.length > 0 && (
            <Row label="Extras" value={EXTRAS.filter((e) => extras.includes(e.id)).map((e) => e.name).join(', ')} price={extrasTotal} />
          )}
        </dl>
        <div className="mt-4 flex items-center gap-2 border-t border-border pt-4">
          <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="rounded-full border border-border px-3 py-1.5 text-sm">
            −
          </button>
          <span className="w-6 text-center text-sm font-bold">{quantity}</span>
          <button onClick={() => setQuantity((q) => Math.min(10, q + 1))} className="rounded-full border border-border px-3 py-1.5 text-sm">
            +
          </button>
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-sm font-bold uppercase text-muted-foreground">Total</span>
          <strong className="price-tag text-2xl text-fire">{formatXOF(total)}</strong>
        </div>
        <button onClick={handleAdd} disabled={!canSubmit || submitting} className="btn btn-primary mt-5 w-full">
          Ajouter mon grill au panier
        </button>
      </aside>
    </div>
  )
}

function StepGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
}

function OptionCard({
  selected,
  onClick,
  title,
  subtitle,
  image,
}: {
  selected: boolean
  onClick: () => void
  title: string
  subtitle?: string
  image?: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative overflow-hidden rounded-xl border-2 p-4 text-left transition-colors',
        selected ? 'border-fire bg-fire/5' : 'border-border hover:border-fire/50'
      )}
    >
      {image && (
        <div className="relative mb-2.5 h-20 w-full overflow-hidden rounded-lg bg-muted">
          <Image src={image} alt="" fill className="object-cover" sizes="200px" />
        </div>
      )}
      <p className="text-sm font-bold leading-tight">{title}</p>
      {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      {selected && (
        <span className="absolute right-2 top-2 grid size-5 place-items-center rounded-full bg-fire text-white">
          <Check size={12} />
        </span>
      )}
    </button>
  )
}

function Row({ label, value, price }: { label: string; value: string; price?: number }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-semibold">
        {value}
        {typeof price === 'number' && price > 0 && <span className="ml-1 text-fire">+{formatXOF(price)}</span>}
      </span>
    </div>
  )
}
