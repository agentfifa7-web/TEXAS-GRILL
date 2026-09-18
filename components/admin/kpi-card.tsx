import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  accent = 'fire',
}: {
  label: string
  value: string
  icon: LucideIcon
  hint?: string
  accent?: 'fire' | 'amber' | 'success' | 'ink'
}) {
  const accentClasses: Record<string, string> = {
    fire: 'bg-primary/10 text-primary',
    amber: 'bg-accent/30 text-accent-foreground',
    success: 'bg-[var(--success)]/10 text-[var(--success)]',
    ink: 'bg-ink/10 text-ink',
  }

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1.5 truncate font-display text-3xl uppercase tracking-wide">{value}</p>
          {hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}
        </div>
        <div className={cn('grid size-10 shrink-0 place-items-center rounded-lg', accentClasses[accent])}>
          <Icon size={20} />
        </div>
      </CardContent>
    </Card>
  )
}
