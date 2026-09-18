import { cn } from '@/lib/utils'
import type { LabelHTMLAttributes } from 'react'

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      data-slot="label"
      className={cn('text-xs font-bold uppercase tracking-wide text-foreground/80 mb-1.5 inline-block', className)}
      {...props}
    />
  )
}
