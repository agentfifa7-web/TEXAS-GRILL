import { describe, it, expect } from 'vitest'
import { distanceKm, estimateDeliveryMinutes } from '@/lib/services/map'

describe('distanceKm', () => {
  it('returns 0 for identical coordinates', () => {
    expect(distanceKm({ lat: 5.36, lng: -3.97 }, { lat: 5.36, lng: -3.97 })).toBeCloseTo(0, 5)
  })

  it('roughly matches the known distance between two Abidjan-area points', () => {
    // Riviera ~ (5.3644, -3.9756) to Cocody ~ (5.3597, -3.9764): a few km apart.
    const km = distanceKm({ lat: 5.3644, lng: -3.9756 }, { lat: 5.3597, lng: -3.9764 })
    expect(km).toBeGreaterThan(0)
    expect(km).toBeLessThan(5)
  })
})

describe('estimateDeliveryMinutes', () => {
  it('always includes at least the base prep time', () => {
    expect(estimateDeliveryMinutes(0)).toBe(12)
  })

  it('increases with distance', () => {
    expect(estimateDeliveryMinutes(10)).toBeGreaterThan(estimateDeliveryMinutes(2))
  })
})
