import type { Metadata } from 'next'
import { Briefcase, FileText, History, Receipt, Truck } from 'lucide-react'
import { CorporateRequestForm } from '@/components/shared/corporate-request-form'
import { PageHero } from '@/components/shared/page-hero'

export const metadata: Metadata = {
  title: 'Texas Grill Business',
  description:
    'Commandes entreprise, devis, livraison groupée et facturation pour votre société — Texas Grill Business à Abidjan.',
}

const FEATURES = [
  {
    icon: Briefcase,
    title: 'Commande entreprise',
    description: 'Des menus pensés pour vos équipes : petits-déjeuners, pauses déjeuner, séminaires et événements internes.',
  },
  {
    icon: FileText,
    title: 'Devis sur mesure',
    description: 'Un devis personnalisé selon votre effectif, votre budget et la fréquence de vos commandes.',
  },
  {
    icon: Truck,
    title: 'Livraison groupée',
    description: 'Une seule livraison pour toute votre entreprise, coordonnée avec votre accueil ou vos bureaux.',
  },
  {
    icon: Receipt,
    title: 'Facturation simplifiée',
    description: 'Facturation mensuelle centralisée pour votre comptabilité, sans avance de frais par vos collaborateurs.',
  },
  {
    icon: History,
    title: 'Historique des commandes',
    description: 'Un suivi complet de vos commandes passées pour faciliter vos renouvellements et votre reporting.',
  },
]

export default function CorporatePage() {
  return (
    <div className="container-grill section-py">
      <PageHero
        eyebrow="Texas Grill Business"
        title={<>Le grill au service de votre <span className="text-fire">entreprise.</span></>}
        description="Repas d'équipe, séminaires, événements internes ou livraisons récurrentes — Texas Grill Business accompagne les entreprises d'Abidjan avec des devis sur mesure, une livraison groupée et une facturation simplifiée."
        videoSrc="/videos/hero-restaurant.mp4"
        center
      />

      <div className="mb-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {FEATURES.map(({ icon: Icon, title, description }) => (
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
        <p className="eyebrow justify-center">Demande de devis</p>
        <h2 className="display-heading text-3xl sm:text-4xl">
          Obtenez votre <span className="text-fire">devis entreprise.</span>
        </h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Remplissez le formulaire ci-dessous, notre équipe Business vous recontacte sous 24h avec une offre adaptée.
        </p>
      </div>

      <CorporateRequestForm />
    </div>
  )
}
