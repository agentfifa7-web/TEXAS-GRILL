import { Percent, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

export interface PromotionCardData {
  id: string
  title: string
  description: string | null
  type: string
  image: string | null
}

const TYPE_LABELS: Record<string, string> = {
  PRODUCT: 'Produit',
  PERCENT: 'Réduction %',
  FIXED: 'Réduction fixe',
  COMBO: 'Combo',
  HAPPY_HOUR: 'Happy Hour',
  BIRTHDAY: 'Anniversaire',
  LOYALTY: 'Fidélité',
  RESTAURANT_SPECIFIC: 'Restaurant',
}

export function PromotionCard({ promotion }: { promotion: PromotionCardData }) {
  return (
    <div className="card-grill p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="grid size-10 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
          {promotion.type === 'HAPPY_HOUR' ? <Sparkles size={18} /> : <Percent size={18} />}
        </div>
        <Badge variant="amber">{TYPE_LABELS[promotion.type] ?? promotion.type}</Badge>
      </div>
      <h3 className="mt-3.5 font-display text-xl uppercase leading-tight tracking-wide">{promotion.title}</h3>
      {promotion.description && <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{promotion.description}</p>}
    </div>
  )
}
