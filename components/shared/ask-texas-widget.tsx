'use client'

import { useState, useRef, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { MessageCircle, Send, X } from 'lucide-react'
import { askTexasAction } from '@/lib/actions/ask-texas'
import type { AIMessage } from '@/lib/services/ai'
import { cn } from '@/lib/utils'

const STARTERS = ['Je veux un repas pour 4 personnes.', "J'ai 15 000 FCFA.", 'Quel est votre meilleur burger ?', 'Quel restaurant est proche de moi ?']

export function AskTexasWidget() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<AIMessage[]>([
    { role: 'assistant', content: "Salut, je suis Ask Texas 🤠 Dis-moi ton budget, ton nombre de convives, ou demande le restaurant le plus proche !" },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, open])

  if (pathname?.startsWith('/admin')) return null

  async function send(text: string) {
    if (!text.trim() || loading) return
    const nextHistory: AIMessage[] = [...messages, { role: 'user', content: text }]
    setMessages(nextHistory)
    setInput('')
    setLoading(true)
    try {
      let location: { lat: number; lng: number } | null = null
      if (navigator.geolocation) {
        location = await new Promise((resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
            () => resolve(null),
            { timeout: 1500 }
          )
        })
      }
      const { reply } = await askTexasAction(nextHistory, location)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-20 right-4 z-40 grid size-14 place-items-center rounded-full bg-ink text-cream shadow-2xl transition-transform hover:scale-105 lg:bottom-6"
        aria-label="Ouvrir Ask Texas"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
        {!open && <span className="absolute -top-1 -right-1 text-lg">🤠</span>}
      </button>

      {open && (
        <div className="fixed bottom-36 right-4 z-40 flex h-[60vh] max-h-[520px] w-[90vw] max-w-sm flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl lg:bottom-24">
          <div className="flex items-center gap-2 bg-ink px-4 py-3 text-cream">
            <span className="text-xl">🤠</span>
            <div>
              <p className="font-display text-lg uppercase leading-none">Ask Texas</p>
              <p className="text-[10px] text-cream/60">Assistant Texas Grill</p>
            </div>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={cn(
                  'max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                  m.role === 'user' ? 'ml-auto bg-fire text-white' : 'bg-muted text-foreground'
                )}
              >
                {m.content}
              </div>
            ))}
            {loading && <div className="w-fit rounded-2xl bg-muted px-3.5 py-2.5 text-sm text-muted-foreground">Ask Texas réfléchit…</div>}
          </div>
          {messages.length < 3 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border p-3">
              {STARTERS.map((s) => (
                <button key={s} onClick={() => send(s)} className="rounded-full border border-border px-2.5 py-1 text-[11px] hover:border-fire hover:text-fire">
                  {s}
                </button>
              ))}
            </div>
          )}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              send(input)
            }}
            className="flex gap-2 border-t border-border p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Écris ton message…"
              className="flex-1 rounded-full border border-input bg-background px-3.5 py-2 text-sm focus-visible:border-primary focus-visible:outline-none"
            />
            <button type="submit" className="btn btn-primary btn-icon" aria-label="Envoyer" disabled={loading}>
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
