// Helpers shared by the mock services. When the Laravel API is ready, each
// service function is replaced by an HTTP call with the same signature/shape.

const LATENCY_MS = 250

export function delay(value, ms = LATENCY_MS) {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms))
}

// Mirrors Laravel's error responses: { message, errors: { field: [messages] } }
export class ApiError extends Error {
  constructor(message, { status = 400, errors = {} } = {}) {
    super(message)
    this.status = status
    this.errors = errors
  }
}

export function validationError(errors) {
  return new ApiError('The given data was invalid.', { status: 422, errors })
}

export function notFound(what = 'Resource') {
  return new ApiError(`${what} not found.`, { status: 404 })
}

export function paginate(items, page = 1, perPage = 12) {
  const total = items.length
  const lastPage = Math.max(1, Math.ceil(total / perPage))
  const current = Math.min(Math.max(1, page), lastPage)
  const start = (current - 1) * perPage
  return {
    data: items.slice(start, start + perPage),
    meta: { total, page: current, perPage, lastPage },
  }
}

export function nextId(items) {
  return items.reduce((max, item) => Math.max(max, item.id), 0) + 1
}

export function readStore(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

export function writeStore(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // storage full or unavailable — state simply won't persist
  }
}
