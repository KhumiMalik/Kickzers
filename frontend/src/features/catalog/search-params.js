import { toMinorUnits } from '../../lib/money'

export const sortOptions = [
  { value: 'default', label: 'Default sorting' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
]

export const perPageOptions = [6, 12, 24]

const toNumber = (value) => (value == null || value === '' || Number.isNaN(Number(value)) ? null : Number(value))

/**
 * Shop filters live in the URL so they can be shared and survive reloads.
 * URL prices are whole dollars (`?min=45`), which is friendlier to read.
 *
 * @param {URLSearchParams} params
 */
export function parseShopParams(params) {
  return {
    category: params.get('category'),
    brand: params.get('brand'),
    color: params.get('color'),
    q: params.get('q'),
    min: toNumber(params.get('min')),
    max: toNumber(params.get('max')),
    sort: params.get('sort') ?? 'default',
    perPage: toNumber(params.get('perPage')) ?? 12,
    page: toNumber(params.get('page')) ?? 1,
  }
}

/** URL filters → GET /products parameters (prices converted to minor units). */
export function toProductQuery(filters) {
  return {
    category: filters.category,
    brand: filters.brand,
    color: filters.color,
    q: filters.q,
    minPrice: filters.min == null ? null : toMinorUnits(filters.min),
    maxPrice: filters.max == null ? null : toMinorUnits(filters.max),
    sort: filters.sort,
    perPage: filters.perPage,
    page: filters.page,
  }
}

/**
 * Applies `patch` to the current search params. Any filter change resets the
 * page to 1 unless the patch sets `page` itself.
 */
export function withFilters(params, patch) {
  const next = new URLSearchParams(params)
  for (const [key, value] of Object.entries(patch)) {
    if (value == null || value === '') next.delete(key)
    else next.set(key, value)
  }
  if (!('page' in patch)) next.delete('page')
  return next
}

/** Link target for a pagination page, keeping the other filters. */
export function pageHref(params, page) {
  const next = new URLSearchParams(params)
  if (page > 1) next.set('page', page)
  else next.delete('page')
  return `?${next}`
}
