'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { moderateReviewAction, replyToReviewAction } from '@/lib/actions/admin/reviews'

export interface AdminReview {
  id: string
  userName: string
  productName: string | null
  overallRating: number
  comment: string | null
  status: string
  adminReply: string | null
  createdAt: string
}

const STATUS_BADGE: Record<string, 'success' | 'outline' | 'destructive'> = {
  PENDING: 'outline',
  PUBLISHED: 'success',
  HIDDEN: 'destructive',
}

export function ReviewCard({ review }: { review: AdminReview }) {
  const [reply, setReply] = useState(review.adminReply ?? '')
  const [isPending, startTransition] = useTransition()

  function handleModerate(status: 'PENDING' | 'PUBLISHED' | 'HIDDEN') {
    startTransition(async () => {
      const result = await moderateReviewAction(review.id, status)
      if (result.ok) toast.success('Avis mis à jour')
      else toast.error(result.error)
    })
  }

  function handleReply() {
    startTransition(async () => {
      const result = await replyToReviewAction(review.id, reply)
      if (result.ok) toast.success('Réponse enregistrée')
      else toast.error(result.error)
    })
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <p className="font-bold">{review.userName}</p>
            {review.productName && <p className="text-xs text-muted-foreground">{review.productName}</p>}
            <div className="mt-1 flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={14} className={i < review.overallRating ? 'fill-accent text-accent' : 'text-border'} />
              ))}
            </div>
          </div>
          <Badge variant={STATUS_BADGE[review.status] ?? 'outline'}>{review.status}</Badge>
        </div>

        {review.comment && <p className="text-sm">{review.comment}</p>}

        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={isPending} onClick={() => handleModerate('PUBLISHED')} className="btn btn-outline btn-sm">
            Publier
          </button>
          <button type="button" disabled={isPending} onClick={() => handleModerate('HIDDEN')} className="btn btn-outline btn-sm">
            Masquer
          </button>
          <button type="button" disabled={isPending} onClick={() => handleModerate('PENDING')} className="btn btn-outline btn-sm">
            Remettre en attente
          </button>
        </div>

        <div className="flex flex-col gap-2 border-t border-border pt-3">
          <Textarea placeholder="Réponse de l'équipe Texas Grill…" value={reply} onChange={(e) => setReply(e.target.value)} rows={2} />
          <button type="button" disabled={isPending} onClick={handleReply} className="btn btn-primary btn-sm w-fit">
            Enregistrer la réponse
          </button>
        </div>
      </CardContent>
    </Card>
  )
}
