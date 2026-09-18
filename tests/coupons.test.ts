import { describe, it, expect } from 'vitest'
import { validateCoupon } from '@/lib/coupons'

// Integration-style test against the real seeded dev DB (prisma/dev.db —
// see prisma/seed.ts for BIENVENUE10 / LIVRAISONOFFERTE). Requires
// `pnpm db:push && pnpm db:seed` to have been run first.
describe('validateCoupon', () => {
  it('rejects an unknown coupon code', async () => {
    const result = await validateCoupon('DOESNOTEXIST', 10000)
    expect(result.valid).toBe(false)
  })

  it('rejects when the order subtotal is below the minimum', async () => {
    const result = await validateCoupon('BIENVENUE10', 1000)
    expect(result.valid).toBe(false)
    expect(result.error).toMatch(/minimum/i)
  })

  it('applies a 10% discount for BIENVENUE10 above the minimum order', async () => {
    const result = await validateCoupon('BIENVENUE10', 10000)
    expect(result.valid).toBe(true)
    expect(result.discount).toBe(1000)
    expect(result.freeDelivery).toBe(false)
  })

  it('grants free delivery for LIVRAISONOFFERTE without a fixed discount', async () => {
    const result = await validateCoupon('LIVRAISONOFFERTE', 10000)
    expect(result.valid).toBe(true)
    expect(result.freeDelivery).toBe(true)
    expect(result.discount).toBe(0)
  })

  it('returns an empty result when no code is provided', async () => {
    const result = await validateCoupon(undefined, 10000)
    expect(result.valid).toBe(false)
    expect(result.discount).toBe(0)
  })
})
