'use client'

import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="bottom-center"
      toastOptions={{
        classNames: {
          toast: 'rounded-xl! border! border-border! bg-ink! text-cream! shadow-2xl!',
        },
      }}
    />
  )
}
