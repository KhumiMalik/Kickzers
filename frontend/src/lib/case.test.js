import { describe, expect, it } from 'vitest'
import { camelToSnake, keysToCamel, keysToSnake, pathToCamel, snakeToCamel } from './case'

describe('key case conversion', () => {
  it('converts single keys both ways, including digits', () => {
    expect(snakeToCamel('address_line_1')).toBe('addressLine1')
    expect(camelToSnake('addressLine1')).toBe('address_line_1')
    expect(camelToSnake('compareAtPrice')).toBe('compare_at_price')
    expect(snakeToCamel(camelToSnake('shipToDifferentAddress'))).toBe('shipToDifferentAddress')
  })

  it('converts nested keys but leaves values alone', () => {
    const wire = { shipping_method: 'flat_rate_10', items: [{ unit_price: 100 }], rating: { breakdown: { 5: 1 } } }
    expect(keysToCamel(wire)).toEqual({
      shippingMethod: 'flat_rate_10',
      items: [{ unitPrice: 100 }],
      rating: { breakdown: { 5: 1 } },
    })
    expect(keysToSnake(keysToCamel(wire))).toEqual(wire)
  })

  it('converts dotted validation paths', () => {
    expect(pathToCamel('billing.first_name')).toBe('billing.firstName')
    expect(pathToCamel('items.0.quantity')).toBe('items.0.quantity')
  })
})
