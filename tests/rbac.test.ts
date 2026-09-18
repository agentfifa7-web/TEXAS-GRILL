import { describe, it, expect } from 'vitest'
import { can, isAdminRole } from '@/lib/rbac'

describe('can (RBAC permission checks)', () => {
  it('grants SUPER_ADMIN every permission it manages access control for', () => {
    expect(can('SUPER_ADMIN', 'roles:manage')).toBe(true)
    expect(can('SUPER_ADMIN', 'orders:manage')).toBe(true)
    expect(can('SUPER_ADMIN', 'stock:manage')).toBe(true)
  })

  it('restricts CUSTOMER from every admin permission', () => {
    expect(can('CUSTOMER', 'orders:manage')).toBe(false)
    expect(can('CUSTOMER', 'dashboard:view')).toBe(false)
    expect(can('CUSTOMER', 'roles:manage')).toBe(false)
  })

  it('scopes RESTAURANT_MANAGER to operational permissions but not role management', () => {
    expect(can('RESTAURANT_MANAGER', 'orders:manage')).toBe(true)
    expect(can('RESTAURANT_MANAGER', 'products:manage')).toBe(true)
    expect(can('RESTAURANT_MANAGER', 'roles:manage')).toBe(false)
  })

  it('returns false for a missing or unknown role', () => {
    expect(can(undefined, 'orders:manage')).toBe(false)
    expect(can(null, 'orders:manage')).toBe(false)
    expect(can('NOT_A_ROLE', 'orders:manage')).toBe(false)
  })
})

describe('isAdminRole', () => {
  it('treats every staff role except CUSTOMER as an admin role', () => {
    expect(isAdminRole('SUPER_ADMIN')).toBe(true)
    expect(isAdminRole('KITCHEN_MANAGER')).toBe(true)
    expect(isAdminRole('CUSTOMER')).toBe(false)
    expect(isAdminRole(undefined)).toBe(false)
  })
})
