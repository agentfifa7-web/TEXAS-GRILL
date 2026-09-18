'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface DialogProps {
  open: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  className?: string
}

export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (typeof document === 'undefined' || !open) return null

  return createPortal(
    <div className="fixed inset-0 z-[80] grid place-items-center p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/60 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn('relative w-full max-w-lg max-h-[90vh] overflow-auto rounded-xl bg-card shadow-2xl animate-in zoom-in-95 fade-in', className)}>
        {title && (
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h2 className="font-display text-xl uppercase tracking-wide">{title}</h2>
            <button onClick={onClose} aria-label="Fermer" className="rounded-full p-1.5 hover:bg-muted focus-ring">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="p-5">{children}</div>
      </div>
    </div>,
    document.body
  )
}
