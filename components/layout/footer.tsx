import Link from 'next/link'
import { Flame, Facebook, Instagram, Twitter } from 'lucide-react'

const COLUMNS = [
  {
    title: 'Découvrir',
    links: [
      { href: '/menu', label: 'Menu' },
      { href: '/build-your-grill', label: 'Build Your Grill' },
      { href: '/restaurants', label: 'Restaurants' },
      { href: '/family', label: 'Texas Grill Family' },
      { href: '/stories', label: 'Grill Stories' },
      { href: '/tv', label: 'Texas Grill TV' },
    ],
  },
  {
    title: 'Commander',
    links: [
      { href: '/menu', label: 'Commander' },
      { href: '/reservation', label: 'Réserver' },
      { href: '/rewards', label: 'Rewards' },
      { href: '/deals', label: 'Deals' },
      { href: '/events', label: 'Events' },
      { href: '/corporate', label: 'Corporate' },
    ],
  },
  {
    title: 'Aide',
    links: [
      { href: '/contact', label: 'Contact' },
      { href: '/faq', label: 'FAQ' },
      { href: '/privacy', label: 'Confidentialité' },
      { href: '/terms', label: "Conditions d'utilisation" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="bg-ink px-5 pb-6 pt-14 text-cream">
      <div className="container-grill grid grid-cols-1 gap-12 md:grid-cols-[1.2fr_2fr]">
        <div>
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid size-10 place-items-center rounded-full bg-fire text-white">
              <Flame size={22} fill="currentColor" />
            </span>
            <span className="font-display text-xl uppercase leading-[0.8] tracking-wide">
              Texas<br />
              <em className="text-fire not-italic">Grill</em>
            </span>
          </Link>
          <p className="mt-6 max-w-xs text-sm text-cream/60">Cuisiné au feu, avec l&apos;énergie d&apos;Abidjan.</p>
          <div className="mt-6 flex gap-3">
            {[Facebook, Instagram, Twitter].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label="Réseau social Texas Grill"
                className="grid size-9 place-items-center rounded-full border border-cream/20 transition-colors hover:border-fire hover:text-fire"
              >
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {COLUMNS.map((col) => (
            <div key={col.title} className="flex flex-col gap-3">
              <strong className="text-[11px] uppercase tracking-widest text-cream/50">{col.title}</strong>
              {col.links.map((link) => (
                <Link key={link.href} href={link.href} className="text-[13px] text-cream/75 transition-colors hover:text-fire">
                  {link.label}
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="container-grill mt-12 flex flex-col gap-2 border-t border-cream/10 pt-5 text-[11px] text-cream/45 sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Texas Grill — Abidjan, Côte d&apos;Ivoire.</span>
        <span>Pour les grandes faims.</span>
      </div>
    </footer>
  )
}
