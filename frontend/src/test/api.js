import { vi } from 'vitest'

/**
 * A tiny fake of the Laravel API for component tests: replaces `fetch` and
 * answers by "METHOD /path" (path below /api/v1, without the query string).
 * Unknown routes answer 404, like the real API, so a test fails loudly when a
 * component calls something unexpected.
 *
 *   const api = mockApi({
 *     'GET /cart': { data: emptyCart },
 *     'POST /cart/coupon': () => [422, { message: '…', errors: { code: ['…'] } }],
 *   })
 *   …
 *   expect(api.requests('POST /cart/coupon')[0].body).toEqual({ code: 'KICKZERS10' })
 *
 * Bodies are the wire format (snake_case), exactly what Laravel sends and receives.
 */
export function mockApi(routes) {
  const calls = []

  const fetchMock = vi.fn(async (url, init = {}) => {
    const { pathname } = new URL(url)
    const method = (init.method ?? 'GET').toUpperCase()

    // Sanctum: the api-client fetches the CSRF cookie before the first write.
    if (pathname === '/sanctum/csrf-cookie') {
      document.cookie = 'XSRF-TOKEN=test-token'
      return new Response(null, { status: 204 })
    }

    const key = `${method} ${pathname.replace(/^\/api\/v1/, '')}`
    const body = init.body ? JSON.parse(init.body) : undefined
    calls.push({ key, url, body, headers: init.headers ?? {} })

    const route = routes[key]
    if (route === undefined) return json(404, { message: 'Not found.' })

    const answer = typeof route === 'function' ? route({ body, url }) : route
    const [status, payload] = Array.isArray(answer) ? answer : [200, answer]
    return payload === null ? new Response(null, { status }) : json(status, payload)
  })

  vi.stubGlobal('fetch', fetchMock)

  return {
    fetch: fetchMock,
    /** Requests made to "METHOD /path", oldest first. */
    requests: (key) => calls.filter((call) => call.key === key),
  }
}

const json = (status, payload) =>
  new Response(JSON.stringify(payload), { status, headers: { 'Content-Type': 'application/json' } })

/** An empty cart in the API's wire format (contract §2.7). */
export const emptyCartResponse = {
  data: {
    items: [],
    item_count: 0,
    coupon: null,
    shipping_method: 'local_delivery',
    shipping_methods: [{ code: 'local_delivery', name: 'Local Delivery', price: 200 }],
    destination: { country: null, state: null, postcode: null },
    totals: { subtotal: 0, discount: 0, shipping: 0, total: 0 },
    currency: 'USD',
    notices: [],
  },
}
