import { cn } from '@/lib/utils'
import type { InputHTMLAttributes } from 'react'

export function Checkbox({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn('size-4 rounded border-border text-primary accent-[var(--fire)] focus-visible:ring-2 focus-visible:ring-ring', className)}
      {...props}
    />
  )
}

export function Switch({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={cn('relative inline-flex h-6 w-11 cursor-pointer items-center', className)}>
      <input type="checkbox" className="peer sr-only" {...props} />
      <span className="absolute inset-0 rounded-full bg-muted transition-colors peer-checked:bg-primary" />
      <span className="relative size-4 translate-x-1 rounded-full bg-white shadow transition-transform peer-checked:translate-x-6" />
    </label>
  )
}
