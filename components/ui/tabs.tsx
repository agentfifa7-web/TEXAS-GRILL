'use client'

import { cn } from '@/lib/utils'

export function PillTabs<T extends string>({
  options,
  value,
  onChange,
  className,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  className?: string
}) {
  return (
    <div className={cn('flex gap-2 overflow-x-auto pb-1', className)} role="tablist">
      {options.map((opt) => (
        <button
          key={opt.value}
          role="tab"
          aria-selected={value === opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'whitespace-nowrap rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-wide transition-colors focus-ring',
            value === opt.value ? 'border-ink bg-ink text-cream' : 'border-border bg-transparent text-muted-foreground hover:border-fire hover:text-fire'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
