import { describe, expect, it } from 'vitest'
import { cx, formatPrice, pad2 } from './format'

describe('format utils', () => {
  it('formats prices as US dollars', () => {
    expect(formatPrice(150)).toBe('$150.00')
    expect(formatPrice(149.99)).toBe('$149.99')
  })

  it('pads numbers to two digits', () => {
    expect(pad2(5)).toBe('05')
    expect(pad2(12)).toBe('12')
  })

  it('joins only truthy class names', () => {
    expect(cx('a', false, null, 'b', undefined, '')).toBe('a b')
  })
})
