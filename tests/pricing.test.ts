import { describe, it, expect } from 'vitest'
import { computeItemSubtotal, computeUnitPriceWithOptions, computeOrderTotal } from '@/lib/pricing'

describe('computeUnitPriceWithOptions', () => {
  it('adds option price deltas to the base price', () => {
    expect(computeUnitPriceWithOptions(6500, [{ priceDelta: 800 }, { priceDelta: 500 }])).toBe(7800)
  })
  it('returns the base price when there are no options', () => {
    expect(computeUnitPriceWithOptions(6500, [])).toBe(6500)
  })
})

describe('computeItemSubtotal', () => {
  it('multiplies (unit price + addons) by quantity', () => {
    // 1 Texas Trio (6500) + 1 bacon addon (800) x2 quantity = (6500+800)*2
    expect(computeItemSubtotal(6500, 2, [{ price: 800, quantity: 1 }])).toBe(14600)
  })
  it('scales addon cost by the addon quantity itself', () => {
    expect(computeItemSubtotal(1000, 1, [{ price: 500, quantity: 3 }])).toBe(2500)
  })
  it('handles no addons', () => {
    expect(computeItemSubtotal(4900, 3, [])).toBe(14700)
  })
})

describe('computeOrderTotal', () => {
  it('sums subtotal + delivery fee, minus discount', () => {
    expect(computeOrderTotal(10000, 1000, 1000)).toBe(10000)
  })
  it('never goes negative even if discount exceeds subtotal+fee', () => {
    expect(computeOrderTotal(1000, 0, 5000)).toBe(0)
  })
})
