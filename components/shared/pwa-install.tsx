'use client'

import { useEffect, useState } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Offline support degrades gracefully if registration fails.
      })
    }

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    return () => window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
  }, [])

  if (!deferredPrompt || dismissed) return null

  return (
    <div className="fixed bottom-4 left-4 z-40 flex max-w-xs items-center gap-3 rounded-xl border border-border bg-card p-3.5 shadow-2xl">
      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-fire text-white">
        <Download size={18} />
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold">Installer Texas Grill</p>
        <p className="text-[11px] text-muted-foreground">Accès rapide depuis votre écran d&apos;accueil.</p>
      </div>
      <button
        onClick={async () => {
          await deferredPrompt.prompt()
          await deferredPrompt.userChoice
          setDeferredPrompt(null)
        }}
        className="btn btn-primary btn-sm shrink-0"
      >
        Installer
      </button>
      <button onClick={() => setDismissed(true)} aria-label="Fermer" className="text-muted-foreground">
        <X size={14} />
      </button>
    </div>
  )
}
