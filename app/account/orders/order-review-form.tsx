'use client'

import { useState, useTransition } from 'react'
import { Star } from 'lucide-react'
import { toast } from 'sonner'
import { Textarea } from '@/components/ui/textarea'
import { submitReviewAction } from '@/lib/actions/reviews'
import { cn } from '@/lib/utils'

const CATEGORIES = [
  { key: 'foodRating', label: 'Plats' },
  { key: 'serviceRating', label: 'Service' },
  { key: 'ambianceRating', label: 'Ambiance' },
  { key: 'deliveryRating', label: 'Livraison' },
] as const

type RatingKey = (typeof CATEGORIES)[number]['key']

export function OrderReviewForm({ orderId }: { orderId: string }) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [ratings, setRatings] = useState<Record<RatingKey, number>>({
    foodRating: 5,
    serviceRating: 5,
    ambianceRating: 5,
    deliveryRating: 5,
  })
  const [comment, setComment] = useState('')
  const [isPending, startTransition] = useTransition()

  if (submitted) {
    return <p className="text-xs font-bold text-fire">Merci pour ton avis !</p>
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn btn-dark btn-sm">
        Laisser un avis
      </button>
    )
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await submitReviewAction({ orderId, ...ratings, comment: comment || undefined })
      if (!result.ok) {
        toast.error(result.error === 'AUTH_REQUIRED' ? 'Connecte-toi pour laisser un avis' : result.error)
        return
      }
      toast.success('Avis envoyé — merci !')
      setSubmitted(true)
    })
  }

  return (
    <div className="mt-2 w-full rounded-lg border border-border bg-muted/30 p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {CATEGORIES.map(({ key, label }) => (
          <div key={key}>
            <p className="mb-1 text-[11px] font-bold uppercase text-muted-foreground">{label}</p>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setRatings((r) => ({ ...r, [key]: n }))} aria-label={`${n} étoiles pour ${label}`}>
                  <Star size={16} className={cn(n <= ratings[key] ? 'fill-fire text-fire' : 'text-muted-foreground')} />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Ton commentaire (optionnel)"
        className="mt-3"
        rows={3}
      />
      <div className="mt-3 flex gap-2">
        <button onClick={handleSubmit} disabled={isPending} className="btn btn-primary btn-sm disabled:opacity-60">
          {isPending ? 'Envoi…' : 'Envoyer mon avis'}
        </button>
        <button onClick={() => setOpen(false)} className="btn btn-outline btn-sm">
          Annuler
        </button>
      </div>
    </div>
  )
}
