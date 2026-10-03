import { describe, expect, it } from 'vitest'
import { formatDecimal, formatMoney, toMajorUnits, toMinorUnits } from './money'

describe('money', () => {
  it('formats minor units as currency', () => {
    expect(formatMoney(15000)).toBe('$150.00')
    expect(formatMoney(14999)).toBe('$149.99')
    expect(formatMoney(0)).toBe('$0.00')
  })

  it('formats without a symbol', () => {
    expect(formatDecimal(55000)).toBe('550.00')
  })

  it('converts between major and minor units without float drift', () => {
    expect(toMinorUnits(149.99)).toBe(14999)
    expect(toMinorUnits(0.1 + 0.2)).toBe(30)
    expect(toMajorUnits(4500)).toBe(45)
  })
})
