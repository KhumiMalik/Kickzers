import { describe, expect, it } from 'vitest'
import { cx, formatCompact, pad2 } from './format'

describe('format utils', () => {
  it('pads numbers to two digits', () => {
    expect(pad2(5)).toBe('05')
    expect(pad2(12)).toBe('12')
  })

  it('joins only truthy class names', () => {
    expect(cx('a', false, null, 'b', undefined, '')).toBe('a b')
  })

  it('formats large numbers compactly', () => {
    expect(formatCompact(1_200_000)).toBe('1.2M')
  })
})
