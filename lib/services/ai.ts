// AIProvider abstraction for "Ask Texas" 🤠.
//
// AI_PROVIDER selects the backing model at runtime. No AI_API_KEY is
// available in this environment, so the default adapter is a deterministic,
// rule-based assistant that genuinely reasons over the real catalog /
// restaurant / promotion data passed to it (budget parsing, party-size
// suggestions, nearest-restaurant lookup) — it is not a canned script, but
// it is explicitly not an LLM. Swap `getAIProvider()` for an adapter that
// calls the Claude or OpenAI API once AI_API_KEY is configured; the prompt
// context this module builds (menu, restaurants, promotions, hours) is
// exactly what a real LLM call should receive, scoped so it can never see
// another customer's private data.

import { formatXOF } from '@/lib/constants'

export interface AIMenuItem {
  id: string
  name: string
  price: number
  category: string
  description: string
  isAvailable: boolean
}

export interface AIRestaurant {
  id: string
  slug: string
  name: string
  address: string
  lat: number | null
  lng: number | null
  status: string
}

export interface AIContext {
  menu: AIMenuItem[]
  restaurants: AIRestaurant[]
  promotionTitles: string[]
  userLocation?: { lat: number; lng: number } | null
}

export interface AIMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AIProvider {
  reply(history: AIMessage[], context: AIContext): Promise<string>
}

function distance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  return Math.hypot(a.lat - b.lat, a.lng - b.lng)
}

/** Rule-based dev/demo adapter — no external API calls, fully offline. */
class RuleBasedAIProvider implements AIProvider {
  async reply(history: AIMessage[], context: AIContext): Promise<string> {
    const last = history[history.length - 1]?.content?.toLowerCase() ?? ''
    const available = context.menu.filter((item) => item.isAvailable)

    const budgetMatch = last.match(/(\d[\d\s]{2,})\s*(fcfa|xof|f)?/)
    const peopleMatch = last.match(/(\d+)\s*(personnes?|pers\b|convives?)/)

    if (/restaurant.*(proche|pr[eè]s)|proche.*restaurant/.test(last)) {
      if (!context.userLocation || context.restaurants.length === 0) {
        return "Active ta localisation ou choisis un quartier pour que je te trouve le restaurant Texas Grill le plus proche 📍"
      }
      const open = context.restaurants.filter((r) => r.status === 'OPEN' && r.lat && r.lng)
      const nearest = open.sort(
        (a, b) => distance(context.userLocation!, { lat: a.lat!, lng: a.lng! }) - distance(context.userLocation!, { lat: b.lat!, lng: b.lng! })
      )[0]
      return nearest
        ? `Le plus proche de toi est **${nearest.name}** — ${nearest.address}. Je t'y envoie ? 🔥`
        : "Aucun restaurant ouvert n'a de position renseignée pour l'instant."
    }

    if (/meilleur|recommand|conseil/.test(last)) {
      const top = available.filter((item) => item.category.match(/burger|grillade/i))[0] ?? available[0]
      return top
        ? `Mon coup de cœur : **${top.name}** (${formatXOF(top.price)}) — ${top.description}`
        : "Le menu se charge encore, réessaie dans un instant."
    }

    if (budgetMatch) {
      const budget = Number(budgetMatch[1].replace(/\s/g, ''))
      const people = peopleMatch ? Number(peopleMatch[1]) : 1
      const perPerson = Math.floor(budget / people)
      const picks = available
        .filter((item) => item.price <= perPerson)
        .sort((a, b) => b.price - a.price)
        .slice(0, people === 1 ? 3 : people)
      if (picks.length === 0) {
        return `Avec ${formatXOF(budget)} pour ${people} personne(s), je te conseille plutôt un menu Family Deals — regarde la page Deals, il y a de belles offres 🔥`
      }
      const total = picks.reduce((sum, item) => sum + item.price, 0)
      return `Pour ${people} personne(s) avec ${formatXOF(budget)}, voici ma sélection : ${picks
        .map((item) => `**${item.name}** (${formatXOF(item.price)})`)
        .join(', ')} — total estimé ${formatXOF(total)}. Je les ajoute au panier ?`
    }

    if (/ce soir|maintenant|commander/.test(last)) {
      return "Parfait, direction le menu 🔥 Dis-moi si tu préfères Livraison, À emporter ou Sur place et je te guide."
    }

    if (context.promotionTitles.length && /promo|deal|r[eé]duction/.test(last)) {
      return `En ce moment : ${context.promotionTitles.slice(0, 3).join(' • ')}. Va voir la page Deals pour tous les détails !`
    }

    return "Je suis Ask Texas 🤠 — dis-moi ton budget, le nombre de convives, ou demande-moi le restaurant le plus proche et je m'occupe du reste."
  }
}

/**
 * TODO(ai): once AI_API_KEY is set, implement an adapter that calls the
 * configured LLM (Claude, OpenAI...) with `context` serialized into the
 * system prompt, and stream the response back to the chat UI. Never forward
 * another user's order history, payment details, or address here.
 */
class LLMProvider implements AIProvider {
  async reply(): Promise<string> {
    throw new Error('LLMProvider is not configured. Set AI_PROVIDER/AI_API_KEY and implement lib/services/ai.ts.')
  }
}

export function getAIProvider(): AIProvider {
  const provider = process.env.AI_PROVIDER ?? 'RULE_BASED'
  if (provider === 'RULE_BASED' || !process.env.AI_API_KEY) return new RuleBasedAIProvider()
  return new LLMProvider()
}
