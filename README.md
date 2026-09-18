# Texas Grill — Digital Platform

**The Grill Experience.** Une plateforme digitale complète pour Texas Grill : site institutionnel, menu digital, commande en ligne (livraison / à emporter / sur place via QR code), réservation de tables, programme de fidélité, promotions, événements, commandes entreprises, avis clients, contenu vidéo, espace client, assistant IA « Ask Texas », et un dashboard administrateur complet (commandes, restaurants, produits, stock, CRM, livraisons, réservations, promotions, CMS, analytics, rôles & permissions).

Marché cible : Abidjan, Côte d'Ivoire — prix en FCFA (XOF), interface en français.

> Ce dépôt est un projet de démonstration **production-ready** : l'architecture, les interfaces et les services sont réels et fonctionnels de bout en bout avec des adaptateurs de développement (base de données locale, paiement simulé, carte statique, assistant basé sur des règles). Chaque intégration externe qui nécessite des identifiants réels est clairement documentée avec un `TODO` dans le code — rien n'est simulé silencieusement.

---

## 1. Présentation

| | |
|---|---|
| **Frontend** | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4 |
| **Backend** | Next.js Route Handlers + Server Actions, services métier séparés (`lib/services`) |
| **Base de données** | PostgreSQL (production) / SQLite (développement, zéro configuration) via Prisma ORM |
| **Authentification** | NextAuth v4 (email/mot de passe, JWT), RBAC par rôle |
| **Design system** | Palette FIRE • GRILL • URBAN • PREMIUM (noir profond, orange feu, rouge barbecue, crème) |
| **PWA** | Manifest, service worker, page hors-ligne, prompt d'installation |

## 2. Architecture

```
app/                     Routes (App Router)
  (site public)          /, /menu, /product/[slug], /build-your-grill, /cart, /checkout,
                          /order/[id]/confirmation, /order/[id]/tracking, /table/[qrToken],
                          /restaurants, /restaurants/[slug], /reservation, /rewards, /deals,
                          /family, /events, /corporate, /stories, /tv, /tv/[slug],
                          /login, /register
  /account/*             Espace client (protégé) : dashboard, commandes, favoris, réservations,
                          adresses, moyens de paiement, coupons & récompenses, notifications
  /admin/*               Dashboard administrateur (protégé, RBAC) : commandes, restaurants,
                          produits, stock, clients/CRM, livraisons, réservations, promotions,
                          avis, événements, entreprises, contenu (CMS), analytics, rôles
  api/auth/[...nextauth] Route NextAuth
  sitemap.ts, robots.ts, manifest.ts   SEO & PWA

components/
  ui/                    Primitives réutilisables (Button, Card, Badge, Input, Select, Dialog,
                          Sheet, Table, Tabs, Skeleton, Progress, Avatar, Sonner…)
  layout/                Navbar, Footer, CartDrawer, FloatingOrderButton
  providers/              CartProvider (contexte panier), SessionProvider
  shared/                 ProductCard, MenuBrowser, BuildYourGrill, CheckoutWizard,
                          OrderTracker, RestaurantMap, AskTexasWidget, PwaInstall…
  admin/                  AdminSidebar, composants de graphiques (Recharts)

lib/
  actions/                Server Actions (mutations) : cart, checkout, reservation, favorites,
                          reviews, events-corporate, auth, ask-texas, admin/*
  data/                   Fonctions de lecture (Server Components) : menu, restaurants, orders
  services/               Abstractions fournisseurs : payment, map, ai, notifications, storage
  validations/            Schémas Zod
  auth.ts, rbac.ts, prisma.ts, constants.ts, loyalty.ts, coupons.ts, cart-session.ts

prisma/
  schema.prisma           Modèle de données complet (voir §5)
  seed.ts                 Données de démonstration
  dev.db                  Base SQLite locale (généré, non versionné)

public/images/            Illustrations de démonstration générées localement (voir §9)
scripts/generate-placeholder-art.mjs
tests/                    Tests unitaires (Vitest)
tests-e2e/                Tests E2E (Playwright)
```

## 3. Installation

Prérequis : Node.js ≥ 20, [pnpm](https://pnpm.io).

```bash
pnpm install
cp .env.example .env          # DATABASE_URL="file:./dev.db" fonctionne tel quel
pnpm db:push                  # crée le schéma SQLite local
pnpm db:seed                  # données de démonstration (restaurants, menu, utilisateurs…)
pnpm dev                      # http://localhost:3000
```

### Comptes de démonstration (README uniquement — jamais de mot de passe réel)

| Rôle | Email | Mot de passe |
|---|---|---|
| Super Administrateur | `admin@texasgrill.demo` | `TexasAdmin#2026` |
| Manager de restaurant | `manager@texasgrill.demo` | `Manager#2026` |
| Client | `client@texasgrill.demo` | `Customer#2026` |

## 4. Variables d'environnement

Voir `.env.example` pour la liste complète et les commentaires. Résumé :

| Variable | Rôle | Valeur par défaut (dev) |
|---|---|---|
| `DATABASE_URL` | Connexion Prisma | `file:./dev.db` (SQLite) |
| `AUTH_SECRET` | Signature des sessions NextAuth | à générer (`openssl rand -base64 32`) |
| `NEXT_PUBLIC_MAP_PROVIDER` / `MAP_API_KEY` | Cartographie (`lib/services/map.ts`) | `STATIC` (carte de secours sans clé) |
| `PAYMENT_PROVIDER` / `PAYMENT_API_KEY` | Paiement (`lib/services/payment.ts`) | `MOCK` (paiement simulé toujours réussi) |
| `STORAGE_PROVIDER` / `STORAGE_API_KEY` | Uploads (`lib/services/storage.ts`) | `LOCAL` |
| `AI_PROVIDER` / `AI_API_KEY` | Assistant Ask Texas (`lib/services/ai.ts`) | `RULE_BASED` (aucune clé requise) |
| `EMAIL_PROVIDER`, `SMS_PROVIDER`, `WHATSAPP_PROVIDER` | Notifications (`lib/services/notifications.ts`) | non configuré → logs console |

**Ne jamais commiter `.env`.** Aucun secret n'est présent côté client — seules les variables `NEXT_PUBLIC_*` sont exposées au navigateur, par design Next.js.

## 5. Base de données

Le schéma (`prisma/schema.prisma`) couvre l'intégralité du domaine métier : `User`, `Role`/`Permission` (RBAC), `Restaurant`/`RestaurantHours`/`Table`, `Reservation`, `MenuCategory`/`Product`/`ProductOption(Value)`/`ProductAddon`, `Cart`/`CartItem`, `Order`/`OrderItem`, `Payment`, `Delivery`/`Driver`, `Address`, `LoyaltyAccount`/`LoyaltyTransaction`/`Reward`, `Coupon`/`Promotion`, `Review`, `Favorite`, `Event`, `CorporateRequest`, `Story`/`Video`, `Notification`, `InventoryItem`/`StockMovement`, `AuditLog`.

Le connecteur est **SQLite en développement** (zéro configuration, portable) et **PostgreSQL en production**. Pour rester compatible avec les deux moteurs sans dupliquer le schéma, les `enum` natifs et les colonnes tableau ne sont pas utilisés : les valeurs « enum-like » sont des `String` validées côté code (voir `lib/constants.ts`) et les listes sont stockées en JSON (`fooJson`, parsé via `lib/json.ts`).

### Migrations

```bash
pnpm db:migrate     # crée/applique une migration (dev)
pnpm db:push        # synchronise le schéma sans migration versionnée (rapide, dev uniquement)
pnpm db:studio      # explorateur de données Prisma Studio
```

### Passer en production avec PostgreSQL

1. Dans `prisma/schema.prisma`, remplacez `provider = "sqlite"` par `provider = "postgresql"`.
2. Définissez `DATABASE_URL` vers une instance managée (Neon, Supabase, Vercel Postgres, RDS…).
3. `pnpm db:migrate` pour générer l'historique de migration Postgres, puis `pnpm db:seed` si besoin.

### Seed

`pnpm db:seed` (`prisma/seed.ts`) insère des données de démonstration **clairement identifiées comme telles** (`isDemo: true` sur les restaurants) : 5 restaurants à Abidjan (Riviera, Zone 4, Yopougon, Deux-Plateaux, Cocody — coordonnées, horaires et informations éditables depuis l'admin), le menu complet avec options/suppléments, tables avec QR codes, stock, coupons, promotions, récompenses, comptes de démonstration, commandes/réservations/avis/stories/vidéos d'exemple.

## 6. Développement

```bash
pnpm dev          # serveur de développement (Turbopack)
pnpm typecheck    # vérification TypeScript stricte
pnpm lint         # ESLint
```

Le fichier `scripts/generate-placeholder-art.mjs` régénère les illustrations de démonstration locales (`public/images/`) si la liste de produits/restaurants du seed évolue — voir §9.

## 7. Tests

```bash
pnpm test         # tests unitaires (Vitest) — logique pure : prix, fidélité, RBAC, distance/ETA livraison
pnpm test:e2e     # tests end-to-end (Playwright) — parcours critique : menu → produit → panier → checkout,
                  # réservation, accueil. Nécessite le serveur de dev lancé (ou le lance automatiquement).
```

Couverture actuelle : calcul de prix et formatage FCFA, progression des paliers de fidélité, permissions RBAC par rôle, estimation de distance/délai de livraison, et un parcours E2E de bout en bout invité → panier → checkout. À étendre : intégration API par service, checkout multi-paiement, permissions admin par page.

## 8. Build & déploiement

```bash
pnpm build
pnpm start
```

Cible de déploiement recommandée : **Vercel** (Next.js natif) + **PostgreSQL managé** (Neon/Supabase/Vercel Postgres) + stockage objet (S3/Cloudinary) + Redis (cache, optionnel — non requis pour les fonctionnalités actuelles). Toutes les variables d'environnement de production doivent être définies dans le tableau de bord Vercel (ou équivalent), jamais commitées.

## 9. Illustrations de démonstration

Le menu, les restaurants et les contenus (stories/vidéos) utilisent des illustrations SVG **générées localement** (`public/images/`, `scripts/generate-placeholder-art.mjs`) plutôt que des photos tierces hotlinkées — ceci évite toute dépendance à un service externe et toute question de droits d'usage sur des photos de stock. **Avant mise en production, remplacez ces illustrations par de vraies photographies** des plats et restaurants Texas Grill (voir `lib/services/storage.ts` pour l'upload une fois `STORAGE_PROVIDER` configuré).

## 10. Configuration des intégrations externes

Chaque intégration externe suit le même principe : une interface dans `lib/services/`, un adaptateur de développement fonctionnel, et un adaptateur réel à implémenter (marqué `TODO` avec les instructions précises).

- **Paiement** (`lib/services/payment.ts`) : interface `PaymentProvider` (`createPayment`, `verifyPayment`, `refundPayment`, `getPaymentStatus`). `MockPaymentProvider` simule un paiement Mobile Money / Carte / Espèces immédiatement réussi. Pour la production : implémentez un adaptateur pour un agrégateur Mobile Money ivoirien (CinetPay, PayDunya, Wave Business) ou un processeur carte, en respectant l'interface. **Aucune donnée de carte bancaire n'est jamais stockée directement.**
- **Cartographie** (`lib/services/map.ts`) : `NEXT_PUBLIC_MAP_PROVIDER=STATIC` par défaut (carte de secours sans dépendance). Passez à `GOOGLE` ou `MAPBOX` avec une clé API pour activer la carte interactive réelle dans `components/shared/restaurant-map.tsx`.
- **Assistant IA « Ask Texas »** (`lib/services/ai.ts`) : adaptateur `RULE_BASED` par défaut (raisonne sur le vrai catalogue/restaurants/promotions sans appel externe). Configurez `AI_PROVIDER`/`AI_API_KEY` pour brancher un LLM réel (Claude, OpenAI…) — le contexte construit (`AIContext`) est déjà prêt à être envoyé dans le prompt système.
- **Notifications** (`lib/services/notifications.ts`) : chaque notification est toujours enregistrée en base (visible dans `/account/notifications`) ; les canaux EMAIL/SMS/WHATSAPP/PUSH utilisent des adaptateurs de développement qui journalisent en console tant qu'`EMAIL_PROVIDER`/`SMS_PROVIDER`/`WHATSAPP_PROVIDER` ne sont pas configurés.
- **Stockage** (`lib/services/storage.ts`) : adaptateur local par défaut ; configurez `STORAGE_PROVIDER=S3` ou `CLOUDINARY` avant la mise en production (le stockage local ne persiste pas sur un déploiement serverless).

## 11. Sécurité

Validation serveur systématique (Zod), hachage des mots de passe (bcrypt), sessions JWT signées, contrôle d'accès par rôle (RBAC — `lib/rbac.ts`, appliqué à la fois par `proxy.ts` pour l'authentification et par chaque Server Action pour la permission fine), journal d'audit (`AuditLog`) sur les actions administratives sensibles, secrets exclusivement via variables d'environnement (jamais dans le code ni le bundle client).

## 12. Accessibilité & performance

Navigation clavier et `focus-visible` sur tous les éléments interactifs, contrastes conformes WCAG AA sur la palette, textes alternatifs sur les images, labels explicites sur les formulaires. Images optimisées via `next/image`, chargement différé, découpage de code automatique (App Router), rendu serveur/statique selon la page, Core Web Vitals surveillés via `@vercel/analytics`.

## 13. Roadmap / limitations connues de cette démonstration

- Les intégrations paiement/carte/IA/notifications réelles nécessitent des identifiants non disponibles dans cet environnement — voir §10.
- L'édition des permissions RBAC se fait actuellement dans le code (`lib/rbac.ts`) plutôt que via une interface d'administration (les tables `Role`/`Permission` existent et sont prêtes pour cette évolution).
- Les illustrations sont des placeholders de marque générés localement (§9), à remplacer par de vraies photographies.
- Internationalisation : l'architecture est prête (contenu en français par défaut, prix en FCFA) mais la traduction anglaise complète n'a pas été livrée dans cette itération.
