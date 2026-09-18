import { describe, it, expect } from 'vitest'
import { computeTier } from '@/lib/loyalty'
import { LOYALTY_TIER_CONFIG } from '@/lib/constants'

describe('computeTier', () => {
  it('returns STARTER below the first threshold', () => {
    expect(computeTier(0)).toBe('STARTER')
    expect(computeTier(LOYALTY_TIER_CONFIG.GRILL_LOVER.minPoints - 1)).toBe('STARTER')
  })

  it('promotes to GRILL_LOVER, GRILL_MASTER and TEXAS_LEGEND at their thresholds', () => {
    expect(computeTier(LOYALTY_TIER_CONFIG.GRILL_LOVER.minPoints)).toBe('GRILL_LOVER')
    expect(computeTier(LOYALTY_TIER_CONFIG.GRILL_MASTER.minPoints)).toBe('GRILL_MASTER')
    expect(computeTier(LOYALTY_TIER_CONFIG.TEXAS_LEGEND.minPoints)).toBe('TEXAS_LEGEND')
  })

  it('never regresses below TEXAS_LEGEND once past its threshold', () => {
    expect(computeTier(LOYALTY_TIER_CONFIG.TEXAS_LEGEND.minPoints + 50000)).toBe('TEXAS_LEGEND')
  })
})
