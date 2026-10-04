import { z } from 'zod'

/**
 * Building blocks for response schemas. Each feature's schemas.js describes
 * the camelCase shape produced by the api-client from the API's JSON.
 */

/** Integer amount in minor units (cents). */
export const money = z.number().int()

/** ISO 8601 date-time string, e.g. "2026-10-03T18:19:29Z". */
export const isoDateTime = z.iso.datetime({ offset: true })

/** Absolute image URL from the API (files on the backend's public disk). */
export const imageUrl = z.url()

export const slugName = z.object({ slug: z.string(), name: z.string() })

/** `{ data: … }` → the inner value. */
export const dataOf = (schema) => z.object({ data: schema }).transform((response) => response.data)

/**
 * Laravel paginated collection → `{ data, meta: { page, lastPage, perPage, total } }`.
 * (Laravel's `links` and `meta.links` are not needed by the UI.)
 */
export const paginatedOf = (itemSchema) =>
  z
    .object({
      data: z.array(itemSchema),
      meta: z.object({
        currentPage: z.number().int(),
        lastPage: z.number().int(),
        perPage: z.number().int(),
        total: z.number().int(),
      }),
    })
    .transform(({ data, meta }) => ({
      data,
      meta: { page: meta.currentPage, lastPage: meta.lastPage, perPage: meta.perPage, total: meta.total },
    }))

/** `{ message: "…" }` responses (contact, newsletter). */
export const messageResponse = z.object({ message: z.string() })
