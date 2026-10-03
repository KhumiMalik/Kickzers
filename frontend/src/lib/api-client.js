import { env } from '../config/env'
import { keysToCamel, keysToSnake, pathToCamel } from './case'

/**
 * Error thrown for every failed request.
 * - status: HTTP status (0 when the network failed)
 * - errors: field → first message, for 422 responses (keys in camelCase dot paths)
 * - code:   optional machine-readable code from the API (e.g. "idempotency_conflict")
 */
export class ApiError extends Error {
  constructor({ status, message, code = null, errors = {} }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.errors = errors
  }

  get isValidation() {
    return this.status === 422
  }

  get isNotFound() {
    return this.status === 404
  }
}

const MUTATING = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

function buildQuery(params) {
  if (!params) return ''
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(keysToSnake(params))) {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value))
  }
  const text = query.toString()
  return text ? `?${text}` : ''
}

function readCookie(name) {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}

/** Sanctum SPA auth: obtain the XSRF-TOKEN cookie before the first state-changing request. */
async function ensureCsrfCookie(force = false) {
  if (!force && readCookie('XSRF-TOKEN')) return
  await fetch(`${env.apiOrigin}/sanctum/csrf-cookie`, { credentials: 'include' })
}

async function sendOverNetwork({ method, url, body, headers }) {
  if (MUTATING.has(method)) await ensureCsrfCookie()

  const send = () =>
    fetch(url, {
      method,
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        ...(body !== undefined && { 'Content-Type': 'application/json' }),
        ...(MUTATING.has(method) && { 'X-XSRF-TOKEN': readCookie('XSRF-TOKEN') ?? '' }),
        ...headers,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    })

  let response = await send()
  // 419 = CSRF token expired: refresh it and retry once.
  if (response.status === 419) {
    await ensureCsrfCookie(true)
    response = await send()
  }

  const text = await response.text()
  return { status: response.status, body: text ? JSON.parse(text) : null }
}

async function sendToMockServer({ method, path, query, body, headers }) {
  // Loaded on demand so the mock server never ships when VITE_USE_MOCKS=false.
  const { handleRequest } = await import('../mocks/server')
  return handleRequest({ method, path, query, body, headers })
}

function toApiError(status, body) {
  const errors = Object.fromEntries(
    Object.entries(body?.errors ?? {}).map(([field, messages]) => [pathToCamel(field), messages[0]]),
  )
  return new ApiError({
    status,
    message: body?.message ?? 'Something went wrong. Please try again.',
    code: body?.code ?? null,
    errors,
  })
}

/**
 * Sends a request to the API and returns the JSON body with camelCase keys
 * (or null for empty responses). Throws ApiError for non-2xx responses.
 *
 * @param {string} method HTTP method
 * @param {string} path   path below the API base, e.g. "/products"
 * @param {{ params?: object, body?: object, headers?: object }} [options] params/body use camelCase keys
 */
export async function request(method, path, { params, body, headers } = {}) {
  const query = buildQuery(params)
  const wireBody = body === undefined ? undefined : keysToSnake(body)

  let result
  try {
    result = env.useMocks
      ? await sendToMockServer({ method, path, query, body: wireBody, headers })
      : await sendOverNetwork({ method, url: `${env.apiUrl}${path}${query}`, body: wireBody, headers })
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError({ status: 0, message: 'Network error. Please check your connection and try again.' })
  }

  if (result.status >= 400) throw toApiError(result.status, result.body)
  return keysToCamel(result.body)
}

export const apiClient = {
  get: (path, options) => request('GET', path, options),
  post: (path, body, options) => request('POST', path, { ...options, body }),
  put: (path, body, options) => request('PUT', path, { ...options, body }),
  patch: (path, body, options) => request('PATCH', path, { ...options, body }),
  delete: (path, options) => request('DELETE', path, options),
}
