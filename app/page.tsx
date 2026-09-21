import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Flame, MapPin, Star } from 'lucide-react'
import { getServerSession } from '@/lib/auth'
import { getFeaturedProducts } from '@/lib/data/menu'
import { getRestaurants } from '@/lib/data/restaurants'
import { getUserFavoriteIds } from '@/lib/actions/favorites'
import { ProductCard } from '@/components/shared/product-card'
import { OrderBar } from '@/components/shared/order-bar'
import { BRAND } from '@/lib/constants'

export default async function HomePage() {
  const session = await getServerSession()
  const [featured, restaurants, favoriteIds] = await Promise.all([
    getFeaturedProducts(4),
    getRestaurants(),
    getUserFavoriteIds(session?.user?.id),
  ])

  return (
    <>
      {/* HERO */}
      <section className="container-grill grid grid-cols-1 items-center gap-10 pb-16 pt-8 lg:grid-cols-[44%_56%] lg:pb-24 lg:pt-6">
        <div>
          <p className="eyebrow">Né au Texas · Forgé au feu d&apos;Abidjan</p>
          <h1 className="display-heading text-[15vw] sm:text-7xl lg:text-[5.4vw]">
            {BRAND.tagline}
            <br />
            <span className="text-fire">Fait pour les grandes faims.</span>
          </h1>
          <p className="mt-6 max-w-sm text-[15px] leading-relaxed text-muted-foreground">{BRAND.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/menu" className="btn btn-primary">
              Commander maintenant <ArrowRight size={17} />
            </Link>
            <Link href="/menu" className="btn btn-outline">
              Voir le menu
            </Link>
          </div>
          <div className="mt-10 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="flex">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="-mr-2 size-8 rounded-full border-2 border-background bg-gradient-to-br from-amber to-fire"
                  style={{ marginLeft: i === 0 ? 0 : undefined }}
                />
              ))}
            </div>
            <span>
              <strong className="text-foreground">4.8 sur Google</strong>
              <br />
              Adoré par les foodies d&apos;Abidjan
            </span>
          </div>
        </div>
        <div className="relative min-h-[340px] overflow-hidden rounded-[2px_90px_2px_90px] sm:min-h-[460px] lg:min-h-[580px]">
          {/* Fallback image (poster) covers the "no video available" case
              required by the spec — shown instantly and whenever the video
              can't load/play, with zero extra client-side logic needed. */}
          <video
            className="absolute inset-0 h-full w-full object-cover"
            poster="/images/misc/hero.svg"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
          >
            <source src="/videos/hero.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-ink/10 to-transparent" />
          <div className="absolute right-6 top-6 grid size-24 rotate-12 place-items-center rounded-full bg-amber text-center text-ink shadow-lg">
            <div>
              <p className="font-display text-2xl leading-none">100%</p>
              <p className="text-[8px] font-black uppercase leading-tight">Real
                <br />Wood
                <br />Fire</p>
            </div>
          </div>
          <div className="absolute bottom-6 left-6 text-white">
            <span className="text-xs font-bold text-amber">01</span>
            <p className="font-display text-2xl leading-none italic sm:text-3xl">
              Chaque assiette
              <br />
              raconte une histoire.
            </p>
          </div>
        </div>
      </section>

      <OrderBar restaurants={restaurants} />

      {/* SIGNATURE GRILLS */}
      <section id="menu" className="container-grill section-py">
        <div className="mb-9 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Au grill</p>
            <h2 className="display-heading text-4xl sm:text-6xl">
              Signature <span className="text-fire">Grills.</span>
            </h2>
          </div>
          <Link href="/menu" className="inline-flex items-center gap-2 text-xs font-black uppercase text-fire">
            Voir le menu complet <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} isFavorited={favoriteIds.includes(product.id)} />
          ))}
        </div>
      </section>

      {/* BUILD YOUR GRILL */}
      <section className="bg-fire px-5 py-20 text-white lg:py-28">
        <div className="container-grill grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
          <div>
            <p className="eyebrow text-white/80 before:bg-white/80">Votre assiette, vos règles</p>
            <h2 className="display-heading text-5xl sm:text-6xl lg:text-7xl">
              Composez votre
              <br />
              <span className="text-ink">grill parfait.</span>
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/85">
              Choisissez votre base, ajoutez vos accompagnements, votre sauce et vos extras. Chaque assiette est unique.
            </p>
            <Link href="/build-your-grill" className="btn btn-light mt-8">
              Commencer <ArrowRight size={17} />
            </Link>
          </div>
          <div className="flex flex-col">
            {[
              ['01', 'Choisis ta base', 'Burger, steak, poulet, ribs, brochettes ou mix grill.'],
              ['02', 'Personnalise-la', 'Sauces maison, accompagnements fumés, dose de piquant.'],
              ['03', 'À table', 'Big flavor, zero fuss. C’est ça, la façon Texas Grill.'],
            ].map(([step, title, desc]) => (
              <div key={step} className="grid grid-cols-[40px_1fr] border-t border-white/25 py-5 last:border-b">
                <span className="text-xs font-bold text-ink">{step}</span>
                <div>
                  <strong className="font-display text-xl uppercase">{title}</strong>
                  <p className="mt-1 text-xs text-white/80">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REWARDS */}
      <section className="container-grill section-py grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
        <div>
          <Star size={26} fill="currentColor" className="mb-5 text-amber" />
          <p className="eyebrow">Le club Texas Grill</p>
          <h2 className="display-heading text-5xl sm:text-6xl">
            Du bon goût.
            <br />
            <span className="text-fire">De beaux avantages.</span>
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Gagnez des points à chaque commande et soyez récompensé lorsque vous venez avec vos proches.
          </p>
          <Link href="/rewards" className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase text-fire">
            Rejoindre le club <ArrowRight size={15} />
          </Link>
        </div>
        <div className="justify-self-center rounded-xl bg-ink p-7 text-white shadow-[14px_18px_0_var(--amber)] sm:rotate-2 sm:justify-self-end sm:max-w-sm">
          <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-white/50">
            <span>Texas Grill</span>
            <span>Membre</span>
          </div>
          <Flame size={48} className="my-9 text-fire" fill="currentColor" />
          <strong className="font-display text-5xl">1,240</strong>
          <p className="text-sm text-white/55">points avant votre prochain festin</p>
          <div className="mt-8 h-1.5 rounded-full bg-white/15">
            <div className="h-full w-[68%] rounded-full bg-fire" />
          </div>
          <p className="mt-3 text-[11px] text-white/55">Encore 260 points avant votre récompense de 2 000 FCFA</p>
        </div>
      </section>

      {/* RESTAURANTS */}
      <section className="container-grill pb-24">
        <div className="mb-9 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">Venez nous voir</p>
            <h2 className="display-heading text-4xl sm:text-6xl">Prenez place.</h2>
          </div>
          <Link href="/restaurants" className="inline-flex items-center gap-2 text-xs font-black uppercase text-fire">
            Tous les restaurants <ArrowRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
          {restaurants.slice(0, 3).map((restaurant, i) => (
            <Link
              key={restaurant.id}
              href={`/restaurants/${restaurant.slug}`}
              className={
                i === 0
                  ? 'group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-xl p-6 text-white sm:col-span-1'
                  : 'card-grill flex min-h-[260px] flex-col gap-1 p-6'
              }
            >
              {i === 0 && restaurant.heroImage && (
                <>
                  <Image src={restaurant.heroImage} alt={restaurant.name} fill className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                </>
              )}
              <div className={i === 0 ? 'relative' : ''}>
                {i === 0 && <span className="text-[10px] font-black uppercase tracking-widest text-amber">Ouvert maintenant</span>}
                {i !== 0 && <MapPin size={20} className="mb-2 text-fire" />}
                <h3 className="font-display text-2xl uppercase leading-tight">{restaurant.name}</h3>
                <p className={cnFooterText(i)}>{restaurant.address}</p>
                {i === 0 ? (
                  <span className="btn btn-light btn-sm mt-4 w-fit">
                    Itinéraire <ArrowRight size={14} />
                  </span>
                ) : (
                  <span className="mt-auto pt-4 text-[10px] font-black uppercase text-fire">Voir les horaires</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

function cnFooterText(i: number) {
  return i === 0 ? 'text-sm text-white/85 mt-1' : 'text-xs text-muted-foreground mt-1'
}
