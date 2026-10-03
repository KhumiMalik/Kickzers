import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// Exercise the real-network code path (not the mock server).
vi.mock('../config/env', () => ({
  env: { apiUrl: 'http://api.test/api/v1', apiOrigin: 'http://api.test', useMocks: false },
}))

const { ApiError, apiClient } = await import('./api-client')

const jsonResponse = (status, body) => new Response(body === null ? null : JSON.stringify(body), { status })

describe('apiClient', () => {
  let fetchMock

  beforeEach(() => {
    fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)
    document.cookie = 'XSRF-TOKEN=token123'
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    document.cookie = 'XSRF-TOKEN=; expires=Thu, 01 Jan 1970 00:00:00 GMT'
  })

  it('sends snake_case query params and returns camelCase data', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { data: { compare_at_price: 100 } }))

    const result = await apiClient.get('/products', { params: { minPrice: 4500, brand: null } })

    expect(fetchMock).toHaveBeenCalledWith(
      'http://api.test/api/v1/products?min_price=4500',
      expect.objectContaining({ method: 'GET', credentials: 'include' }),
    )
    expect(result).toEqual({ data: { compareAtPrice: 100 } })
  })

  it('sends the CSRF header and a snake_case body on writes', async () => {
    fetchMock.mockResolvedValue(jsonResponse(201, { data: {} }))

    await apiClient.post('/cart/items', { productId: 5, quantity: 2 })

    const [, init] = fetchMock.mock.calls[0]
    expect(init.headers['X-XSRF-TOKEN']).toBe('token123')
    expect(JSON.parse(init.body)).toEqual({ product_id: 5, quantity: 2 })
  })

  it('throws ApiError with camelCase field errors for 422', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(422, { message: 'Invalid.', errors: { 'billing.first_name': ['First name is required.'] } }),
    )

    const error = await apiClient.post('/checkout', {}).catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(422)
    expect(error.isValidation).toBe(true)
    expect(error.errors).toEqual({ 'billing.firstName': 'First name is required.' })
  })

  it('refreshes the CSRF cookie and retries once after a 419', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(419, { message: 'CSRF token mismatch.' }))
      .mockResolvedValueOnce(jsonResponse(204, null)) // GET /sanctum/csrf-cookie
      .mockResolvedValueOnce(jsonResponse(200, { data: { ok: true } }))

    const result = await apiClient.post('/auth/logout')

    expect(fetchMock).toHaveBeenNthCalledWith(2, 'http://api.test/sanctum/csrf-cookie', { credentials: 'include' })
    expect(result).toEqual({ data: { ok: true } })
  })

  it('turns network failures into an ApiError with status 0', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))

    const error = await apiClient.get('/home').catch((e) => e)

    expect(error).toBeInstanceOf(ApiError)
    expect(error.status).toBe(0)
  })
})
