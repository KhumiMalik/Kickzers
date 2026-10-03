// Response helpers for mock handlers. Shapes follow docs/api-contract.md §1.7–1.8.

export class HttpError extends Error {
  constructor(status, body) {
    super(body.message)
    this.status = status
    this.body = body
  }
}

export const ok = (body) => ({ status: 200, body })
export const created = (body) => ({ status: 201, body })
export const accepted = (body) => ({ status: 202, body })
export const noContent = () => ({ status: 204, body: null })

export const notFound = (message = 'Not found.') => new HttpError(404, { message })
export const unauthenticated = () => new HttpError(401, { message: 'Unauthenticated.' })
export const forbidden = (message = 'This action is unauthorized.') => new HttpError(403, { message })

/** Laravel-style 422: `errors` maps field paths to arrays of messages. */
export function validationError(errors) {
  const messages = Object.values(errors).flat()
  const extra = messages.length > 1 ? ` (and ${messages.length - 1} more error${messages.length > 2 ? 's' : ''})` : ''
  return new HttpError(422, { message: `${messages[0]}${extra}`, errors })
}

/** Throws a 422 for the first missing required field in `fields`. */
export function requireFields(body, fields) {
  const errors = {}
  for (const [field, label] of Object.entries(fields)) {
    const value = field.split('.').reduce((obj, key) => obj?.[key], body)
    if (value === undefined || value === null || String(value).trim() === '') errors[field] = [`${label} is required.`]
  }
  if (Object.keys(errors).length) throw validationError(errors)
}

/** Laravel LengthAwarePaginator JSON. */
export function paginate(items, { page = 1, perPage = 12, path }) {
  const total = items.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const current = Math.max(1, Number(page) || 1)
  const start = (current - 1) * perPage
  const data = items.slice(start, start + perPage)
  const pageUrl = (n) => (n >= 1 && n <= lastPage ? `${path}?page=${n}` : null)
  return {
    data,
    links: { first: pageUrl(1), last: pageUrl(lastPage), prev: pageUrl(current - 1), next: pageUrl(current + 1) },
    meta: {
      current_page: current,
      from: data.length ? start + 1 : null,
      last_page: lastPage,
      path,
      per_page: perPage,
      to: data.length ? start + data.length : null,
      total,
    },
  }
}
