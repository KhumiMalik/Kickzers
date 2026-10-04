import { describe, expect, it } from 'vitest'
import { pageHref, parseShopParams, toProductQuery, withFilters } from './search-params'

describe('shop URL filters', () => {
  it('reads the filters from the URL with defaults', () => {
    expect(parseShopParams(new URLSearchParams('brand=puma&min=45&max=abc'))).toEqual({
      category: null,
      brand: 'puma',
      color: null,
      q: null,
      min: 45,
      max: null,
      sort: 'default',
      perPage: 12,
      page: 1,
    })
  })

  it('sends prices to the API in cents while the URL keeps dollars', () => {
    const query = toProductQuery(parseShopParams(new URLSearchParams('min=45&max=149.99&perPage=6&page=2')))

    expect(query).toMatchObject({ minPrice: 4500, maxPrice: 14999, perPage: 6, page: 2 })
  })

  it('resets to page 1 when a filter changes and drops emptied filters', () => {
    const current = new URLSearchParams('brand=puma&color=red&page=3')

    expect(withFilters(current, { brand: 'nike', color: '' }).toString()).toBe('brand=nike')
    expect(withFilters(current, { page: 4 }).toString()).toBe('brand=puma&color=red&page=4')
  })

  it('builds pagination links that keep the filters', () => {
    const current = new URLSearchParams('brand=puma&page=2')

    expect(pageHref(current, 3)).toBe('?brand=puma&page=3')
    expect(pageHref(current, 1)).toBe('?brand=puma')
  })
})
