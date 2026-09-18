import type { Metadata } from 'next'
import { Cake, PartyPopper, Presentation, Trophy, Users, Sparkles } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { EventRequestForm } from '@/components/shared/event-request-form'

export const metadata: Metadata = {
  title: 'Événements',
  description:
    'Organisez votre anniversaire, réunion, événement sportif ou soirée privée dans un restaurant Texas Grill à Abidjan.',
}

const HIGHLIGHTS = [
  { icon: Cake, title: 'Anniversaires', description: 'Une salle décorée et un menu grill pour célébrer en grand.' },
  { icon: Presentation, title: 'Réunions', description: 'Un espace privatisable pour vos réunions et séminaires.' },
  { icon: Trophy, title: 'Événements sportifs', description: 'Écrans et ambiance survoltée pour vivre les matchs ensemble.' },
  { icon: Users, title: 'Soirées privées', description: 'Votre restaurant Texas Grill rien que pour vous et vos invités.' },
  { icon: Sparkles, title: 'Entreprise & célébrations', description: 'Séminaires, lancements de produits, fêtes de fin d’année.' },
]

export default async function EventsPage() {
  const restaurants = await prisma.restaurant.findMany({
    where: { status: 'OPEN' },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  })

  return (
    <div className="container-grill section-py">
      <div className="mb-10 text-center">
        <p className="eyebrow justify-center">Texas Grill Events</p>
        <h1 className="display-heading text-5xl sm:text-6xl">
          Célébrez au rythme du <span className="text-fire">grill.</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Anniversaires, réunions, événements sportifs, soirées privées, séminaires d&apos;entreprise ou grandes
          célébrations — nos restaurants Texas Grill à Abidjan vous accueillent pour un événement sur mesure, du
          menu à la décoration.
        </p>
      </div>

      <div className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="card-grill p-5">
            <div className="mb-3 grid size-11 place-items-center rounded-full bg-fire/10 text-fire">
              <Icon size={20} />
            </div>
            <h3 className="font-display text-base uppercase tracking-wide">{title}</h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>

      <div className="mb-8 text-center">
        <p className="eyebrow justify-center">Votre demande</p>
        <h2 className="display-heading text-3xl sm:text-4xl">
          Parlez-nous de votre <span className="text-fire">événement.</span>
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          <PartyPopper size={14} className="mr-1 inline text-fire" />
          Remplissez le formulaire ci-dessous, notre équipe événementielle vous recontacte sous 24h.
        </p>
      </div>

      <EventRequestForm restaurants={restaurants} />
    </div>
  )
}
