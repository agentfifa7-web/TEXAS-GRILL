'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { toast } from 'sonner'

export function CouponPill({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      toast.success('Code copié')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('Impossible de copier le code')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-fire/50 bg-fire/5 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-fire transition-colors hover:bg-fire/10"
    >
      {code} {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  )
}
