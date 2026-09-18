import { ROLES, type RoleKey } from '@/lib/constants'

// Code-owned permission map. `Role` / `Permission` / `RolePermission` also
// exist as DB tables (prisma/schema.prisma) and are seeded so the admin can
// eventually manage them from the CMS — enforcement itself stays here so
// every server action / route handler checks against one source of truth.
export const PERMISSIONS = {
  'dashboard:view': ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_MANAGER', 'MARKETING_MANAGER'],
  'orders:manage': ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_MANAGER', 'KITCHEN_MANAGER', 'CASHIER'],
  'restaurants:manage': ['SUPER_ADMIN', 'ADMIN'],
  'products:manage': ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_MANAGER'],
  'stock:manage': ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_MANAGER', 'KITCHEN_MANAGER'],
  'customers:manage': ['SUPER_ADMIN', 'ADMIN', 'MARKETING_MANAGER'],
  'deliveries:manage': ['SUPER_ADMIN', 'ADMIN', 'DELIVERY_MANAGER'],
  'reservations:manage': ['SUPER_ADMIN', 'ADMIN', 'RESTAURANT_MANAGER', 'CASHIER'],
  'promotions:manage': ['SUPER_ADMIN', 'ADMIN', 'MARKETING_MANAGER'],
  'content:manage': ['SUPER_ADMIN', 'ADMIN', 'CONTENT_MANAGER'],
  'analytics:view': ['SUPER_ADMIN', 'ADMIN', 'MARKETING_MANAGER'],
  'roles:manage': ['SUPER_ADMIN'],
  'reviews:manage': ['SUPER_ADMIN', 'ADMIN', 'MARKETING_MANAGER', 'CONTENT_MANAGER'],
  'events:manage': ['SUPER_ADMIN', 'ADMIN', 'MARKETING_MANAGER'],
  'corporate:manage': ['SUPER_ADMIN', 'ADMIN', 'MARKETING_MANAGER'],
} as const

export type PermissionKey = keyof typeof PERMISSIONS

export function can(role: string | undefined | null, permission: PermissionKey): boolean {
  if (!role) return false
  return (PERMISSIONS[permission] as readonly string[]).includes(role)
}

export function isAdminRole(role: string | undefined | null): role is RoleKey {
  if (!role) return false
  return role in ROLES && role !== 'CUSTOMER'
}

/** Admin nav sections gated per role, used by AdminSidebar. */
export const ADMIN_NAV: { label: string; href: string; permission: PermissionKey }[] = [
  { label: 'Tableau de bord', href: '/admin', permission: 'dashboard:view' },
  { label: 'Commandes', href: '/admin/orders', permission: 'orders:manage' },
  { label: 'Restaurants', href: '/admin/restaurants', permission: 'restaurants:manage' },
  { label: 'Produits', href: '/admin/products', permission: 'products:manage' },
  { label: 'Stock', href: '/admin/stock', permission: 'stock:manage' },
  { label: 'Clients / CRM', href: '/admin/customers', permission: 'customers:manage' },
  { label: 'Livraisons', href: '/admin/deliveries', permission: 'deliveries:manage' },
  { label: 'Réservations', href: '/admin/reservations', permission: 'reservations:manage' },
  { label: 'Promotions', href: '/admin/promotions', permission: 'promotions:manage' },
  { label: 'Avis clients', href: '/admin/reviews', permission: 'reviews:manage' },
  { label: 'Événements', href: '/admin/events', permission: 'events:manage' },
  { label: 'Entreprises', href: '/admin/corporate', permission: 'corporate:manage' },
  { label: 'Contenu (CMS)', href: '/admin/content', permission: 'content:manage' },
  { label: 'Analytics', href: '/admin/analytics', permission: 'analytics:view' },
  { label: 'Rôles & permissions', href: '/admin/roles', permission: 'roles:manage' },
]
