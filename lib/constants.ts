// Central, code-owned config for enums modeled as strings in prisma/schema.prisma
// (SQLite/Postgres portability — see the header comment in that file).

export const BRAND = {
  name: 'Texas Grill',
  shortName: 'Texas Grill',
  tagline: 'The Grill Experience',
  subtitle: "Le goût du vrai grill, avec l'énergie d'Abidjan.",
  city: 'Abidjan',
  country: 'Côte d’Ivoire',
  currency: 'XOF',
  currencyLabel: 'FCFA',
} as const

export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  ADMIN: 'ADMIN',
  RESTAURANT_MANAGER: 'RESTAURANT_MANAGER',
  KITCHEN_MANAGER: 'KITCHEN_MANAGER',
  CASHIER: 'CASHIER',
  DELIVERY_MANAGER: 'DELIVERY_MANAGER',
  MARKETING_MANAGER: 'MARKETING_MANAGER',
  CONTENT_MANAGER: 'CONTENT_MANAGER',
  CUSTOMER: 'CUSTOMER',
} as const
export type RoleKey = keyof typeof ROLES

export const ADMIN_ROLES: RoleKey[] = [
  'SUPER_ADMIN',
  'ADMIN',
  'RESTAURANT_MANAGER',
  'KITCHEN_MANAGER',
  'CASHIER',
  'DELIVERY_MANAGER',
  'MARKETING_MANAGER',
  'CONTENT_MANAGER',
]

export const ROLE_LABELS: Record<RoleKey, string> = {
  SUPER_ADMIN: 'Super administrateur',
  ADMIN: 'Administrateur',
  RESTAURANT_MANAGER: 'Manager de restaurant',
  KITCHEN_MANAGER: 'Chef de cuisine',
  CASHIER: 'Caissier',
  DELIVERY_MANAGER: 'Responsable livraisons',
  MARKETING_MANAGER: 'Responsable marketing',
  CONTENT_MANAGER: 'Responsable contenu',
  CUSTOMER: 'Client',
}

export const ORDER_TYPES = {
  DELIVERY: 'DELIVERY',
  PICKUP: 'PICKUP',
  DINE_IN: 'DINE_IN',
} as const
export type OrderType = (typeof ORDER_TYPES)[keyof typeof ORDER_TYPES]

export const ORDER_TYPE_LABELS: Record<OrderType, string> = {
  DELIVERY: 'Livraison',
  PICKUP: 'À emporter',
  DINE_IN: 'Sur place',
}

export const ORDER_STATUS = {
  RECEIVED: 'RECEIVED',
  PREPARING: 'PREPARING',
  COOKING: 'COOKING',
  READY: 'READY',
  DRIVER_ASSIGNED: 'DRIVER_ASSIGNED',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS]

export const ORDER_STATUS_FLOW: OrderStatus[] = [
  'RECEIVED',
  'PREPARING',
  'COOKING',
  'READY',
  'DRIVER_ASSIGNED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
]

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  RECEIVED: 'Commande reçue',
  PREPARING: 'Préparation',
  COOKING: 'Cuisson',
  READY: 'Prête',
  DRIVER_ASSIGNED: 'Livreur assigné',
  OUT_FOR_DELIVERY: 'En livraison',
  DELIVERED: 'Livrée',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
}

export const RESERVATION_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  COMPLETED: 'COMPLETED',
  NO_SHOW: 'NO_SHOW',
} as const
export type ReservationStatus = (typeof RESERVATION_STATUS)[keyof typeof RESERVATION_STATUS]

export const LOYALTY_TIERS = {
  STARTER: 'STARTER',
  GRILL_LOVER: 'GRILL_LOVER',
  GRILL_MASTER: 'GRILL_MASTER',
  TEXAS_LEGEND: 'TEXAS_LEGEND',
} as const
export type LoyaltyTier = (typeof LOYALTY_TIERS)[keyof typeof LOYALTY_TIERS]

export const LOYALTY_TIER_CONFIG: Record<
  LoyaltyTier,
  { label: string; minPoints: number; perksDiscount: number; description: string }
> = {
  STARTER: { label: 'Starter', minPoints: 0, perksDiscount: 0, description: 'Bienvenue au club. Gagnez des points à chaque commande.' },
  GRILL_LOVER: { label: 'Grill Lover', minPoints: 2000, perksDiscount: 5, description: '5% de réduction permanente + offres exclusives.' },
  GRILL_MASTER: { label: 'Grill Master', minPoints: 6000, perksDiscount: 10, description: '10% de réduction + accès prioritaire aux événements.' },
  TEXAS_LEGEND: { label: 'Texas Legend', minPoints: 15000, perksDiscount: 15, description: '15% de réduction + cadeaux d’anniversaire premium.' },
}

// 1 000 FCFA dépensé = 10 points (configurable côté admin dans une vraie
// implémentation — valeur de démonstration ici).
export const POINTS_PER_XOF = 10 / 1000

export const MENU_CATEGORIES = [
  'Burgers',
  'Grillades',
  'Steaks',
  'Ribs & BBQ',
  'Poulet',
  'Brochettes',
  'Seafood',
  'Accompagnements',
  'Boissons',
  'Menus',
  'Family Deals',
] as const

export const PRODUCT_OPTION_TYPES = { SINGLE: 'SINGLE', MULTI: 'MULTI' } as const

export const RESTAURANT_STATUS = { OPEN: 'OPEN', CLOSED: 'CLOSED', COMING_SOON: 'COMING_SOON' } as const

export const RESTAURANT_SERVICES = ['DINE_IN', 'DELIVERY', 'PICKUP', 'CATERING', 'DRIVE_THROUGH'] as const
export const RESTAURANT_SERVICE_LABELS: Record<(typeof RESTAURANT_SERVICES)[number], string> = {
  DINE_IN: 'Sur place',
  DELIVERY: 'Livraison',
  PICKUP: 'À emporter',
  CATERING: 'Traiteur',
  DRIVE_THROUGH: 'Drive',
}

export const DELIVERY_STATUS = {
  PENDING: 'PENDING',
  ASSIGNED: 'ASSIGNED',
  PICKED_UP: 'PICKED_UP',
  EN_ROUTE: 'EN_ROUTE',
  DELIVERED: 'DELIVERED',
  FAILED: 'FAILED',
} as const

export const PAYMENT_METHODS = { MOBILE_MONEY: 'MOBILE_MONEY', CARD: 'CARD', CASH: 'CASH' } as const
export const PAYMENT_METHOD_LABELS: Record<keyof typeof PAYMENT_METHODS, string> = {
  MOBILE_MONEY: 'Mobile Money',
  CARD: 'Carte bancaire',
  CASH: 'Espèces à la livraison',
}
export const PAYMENT_STATUS = { PENDING: 'PENDING', PAID: 'PAID', FAILED: 'FAILED', REFUNDED: 'REFUNDED' } as const

export const COUPON_TYPES = { PERCENT: 'PERCENT', FIXED: 'FIXED', FREE_DELIVERY: 'FREE_DELIVERY' } as const

export const PROMOTION_TYPES = {
  PRODUCT: 'PRODUCT',
  PERCENT: 'PERCENT',
  FIXED: 'FIXED',
  COMBO: 'COMBO',
  HAPPY_HOUR: 'HAPPY_HOUR',
  BIRTHDAY: 'BIRTHDAY',
  LOYALTY: 'LOYALTY',
  RESTAURANT_SPECIFIC: 'RESTAURANT_SPECIFIC',
} as const

export const EVENT_TYPES = {
  BIRTHDAY: 'Anniversaire',
  MEETING: 'Réunion',
  SPORTS: 'Événement sportif',
  PRIVATE_PARTY: 'Soirée privée',
  CORPORATE: 'Entreprise',
  CELEBRATION: 'Célébration',
} as const

export const VIDEO_CATEGORIES = {
  BEHIND_THE_GRILL: 'Behind The Grill',
  EVENTS: 'Événements',
  INTERVIEWS: 'Interviews',
  NEWS: 'Nouveautés',
  RECIPES: 'Recettes',
  LIFESTYLE: 'Lifestyle',
} as const

export const NOTIFICATION_TYPES = {
  ORDER_RECEIVED: 'ORDER_RECEIVED',
  ORDER_PREPARING: 'ORDER_PREPARING',
  ORDER_READY: 'ORDER_READY',
  ORDER_OUT_FOR_DELIVERY: 'ORDER_OUT_FOR_DELIVERY',
  ORDER_DELIVERED: 'ORDER_DELIVERED',
  RESERVATION_CONFIRMED: 'RESERVATION_CONFIRMED',
  PROMOTION: 'PROMOTION',
  LOYALTY_REWARD: 'LOYALTY_REWARD',
} as const

export const NOTIFICATION_CHANNELS = ['EMAIL', 'SMS', 'PUSH', 'WHATSAPP', 'IN_APP'] as const

/**
 * Resolves the site's base URL for metadata/sitemap/robots. Uses `||`
 * rather than `??` deliberately — hosting platforms (Vercel included) can
 * set an env var to an empty string `''` rather than leaving it unset, and
 * `new URL('')` throws `ERR_INVALID_URL`, which previously broke the
 * production build.
 */
export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
}

export function formatXOF(amount: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(amount) + ' FCFA'
}

export function generateOrderNumber(): string {
  const date = new Date()
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const rand = Math.floor(1000 + Math.random() * 9000)
  return `TG-${y}${m}${d}-${rand}`
}

export function generateReservationCode(): string {
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase()
  return `RES-${rand}`
}
