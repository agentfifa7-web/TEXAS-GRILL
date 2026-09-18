import { describe, it, expect } from 'vitest'
import { formatXOF, generateOrderNumber, generateReservationCode } from '@/lib/constants'

describe('formatXOF', () => {
  it('formats amounts with thousands separators and the FCFA suffix', () => {
    // Intl.NumberFormat('fr-FR') uses a narrow no-break space (U+202F) as
    // the thousands separator, so match loosely on digit groups + suffix.
    expect(formatXOF(6500)).toMatch(/^6\D500 FCFA$/)
    expect(formatXOF(0)).toBe('0 FCFA')
    expect(formatXOF(1000000)).toMatch(/^1\D000\D000 FCFA$/)
  })
})

describe('generateOrderNumber', () => {
  it('produces a TG-YYYYMMDD-XXXX formatted, unique-ish order number', () => {
    const a = generateOrderNumber()
    const b = generateOrderNumber()
    expect(a).toMatch(/^TG-\d{8}-\d{4}$/)
    expect(b).toMatch(/^TG-\d{8}-\d{4}$/)
  })
})

describe('generateReservationCode', () => {
  it('produces a RES-XXXXX formatted code', () => {
    expect(generateReservationCode()).toMatch(/^RES-[A-Z0-9]{5}$/)
  })
})
