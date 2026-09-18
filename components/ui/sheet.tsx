'use client'

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SheetProps {
  open: boolean
  onClose: () => void
  side?: 'right' | 'left' | 'bottom'
  title?: string
  children: React.ReactNode
  className?: string
}

export function Sheet({ open, onClose, side = 'right', title, children, className }: SheetProps) {
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

  const sideClasses = {
    right: 'inset-y-0 right-0 h-full w-full max-w-md translate-x-0 animate-in slide-in-from-right',
    left: 'inset-y-0 left-0 h-full w-full max-w-md animate-in slide-in-from-left',
    bottom: 'inset-x-0 bottom-0 max-h-[85vh] w-full rounded-t-2xl animate-in slide-in-from-bottom',
  }

  return createPortal(
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-ink/55 backdrop-blur-[2px]" onClick={onClose} />
      <div className={cn('absolute flex flex-col bg-card shadow-2xl', sideClasses[side], className)}>
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-display text-xl uppercase tracking-wide">{title}</h2>
          <button onClick={onClose} aria-label="Fermer" className="rounded-full p-1.5 hover:bg-muted focus-ring">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>,
    document.body
  )
}
