import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { dataOf, imageUrl, paginatedOf } from './schemas'

describe('response schemas', () => {
  it('unwraps { data } envelopes', () => {
    expect(dataOf(z.object({ id: z.number() })).parse({ data: { id: 1 } })).toEqual({ id: 1 })
  })

  it('reduces Laravel pagination to what the UI needs', () => {
    const page = paginatedOf(z.object({ id: z.number() })).parse({
      data: [{ id: 1 }],
      links: { first: 'http://…?page=1', last: 'http://…?page=2', prev: null, next: 'http://…?page=2' },
      meta: { currentPage: 1, from: 1, lastPage: 2, path: 'http://…', perPage: 1, to: 1, total: 2, links: [] },
    })

    expect(page).toEqual({ data: [{ id: 1 }], meta: { page: 1, lastPage: 2, perPage: 1, total: 2 } })
  })

  it('expects absolute image URLs from the API', () => {
    expect(imageUrl.safeParse('http://localhost:8000/storage/product/p1.jpg').success).toBe(true)
    expect(imageUrl.safeParse('/img/product/p1.jpg').success).toBe(false)
  })
})
