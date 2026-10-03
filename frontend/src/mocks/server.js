/**
 * In-browser mock of the Laravel API (docs/api-contract.md), used while
 * VITE_USE_MOCKS=true. The api-client hands it requests in wire format
 * (snake_case, minor units) and it answers like the real API would.
 * Deleted in Phase 11 once the frontend talks to Laravel.
 */
import * as auth from './handlers/auth'
import * as blog from './handlers/blog'
import * as cart from './handlers/cart'
import * as catalog from './handlers/catalog'
import * as content from './handlers/content'
import * as orders from './handlers/orders'
import { HttpError } from './http'

const routes = [
  ['GET', '/home', catalog.home],
  ['GET', '/products', catalog.listProducts],
  ['GET', '/catalog/filters', catalog.filters],
  ['GET', '/promotions/deals-of-the-week', catalog.dealsOfTheWeek],
  ['GET', '/products/:slug', catalog.showProduct],
  ['GET', '/products/:slug/related', catalog.relatedProducts],
  ['GET', '/products/:slug/reviews', content.listReviews],
  ['POST', '/products/:slug/reviews', content.createReview],
  ['GET', '/products/:slug/comments', content.listProductComments],
  ['POST', '/products/:slug/comments', content.createProductComment],

  ['GET', '/posts', blog.listPosts],
  ['GET', '/posts/:slug', blog.showPost],
  ['GET', '/posts/:slug/comments', content.listPostComments],
  ['POST', '/posts/:slug/comments', content.createPostComment],
  ['GET', '/blog/sidebar', blog.sidebar],

  ['GET', '/cart', cart.showCart],
  ['POST', '/cart/items', cart.addItem],
  ['PATCH', '/cart/items/:id', cart.updateItem],
  ['DELETE', '/cart/items/:id', cart.removeItem],
  ['DELETE', '/cart', cart.clearCart],
  ['POST', '/cart/coupon', cart.applyCoupon],
  ['DELETE', '/cart/coupon', cart.removeCoupon],
  ['PUT', '/cart/shipping-method', cart.setShippingMethod],
  ['PUT', '/cart/destination', cart.setDestination],
  ['GET', '/countries', cart.listCountries],
  ['GET', '/payment-methods', cart.listPaymentMethods],

  ['POST', '/checkout', orders.placeOrder],
  ['GET', '/orders/:number', orders.showOrder],
  ['POST', '/orders/track', orders.trackOrder],

  ['POST', '/auth/login', auth.login],
  ['POST', '/auth/register', auth.register],
  ['POST', '/auth/logout', auth.logout],
  ['GET', '/auth/user', auth.me],
  ['GET', '/wishlist', auth.listWishlist],
  ['POST', '/wishlist', auth.addToWishlist],
  ['POST', '/wishlist/merge', auth.mergeWishlist],
  ['DELETE', '/wishlist/:productId', auth.removeFromWishlist],

  ['POST', '/contact', content.sendContactMessage],
  ['POST', '/newsletter', content.subscribe],
].map(([method, pattern, handler]) => ({
  method,
  handler,
  // "/products/:slug" → /^\/products\/(?<slug>[^/]+)$/
  regex: new RegExp(`^${pattern.replace(/:(\w+)/g, '(?<$1>[^/]+)')}$`),
}))

const LATENCY_MS = 150
const delay = () => new Promise((resolve) => setTimeout(resolve, LATENCY_MS))

/**
 * @param {{ method: string, path: string, query: string, body?: object, headers?: object }} request
 * @returns {Promise<{ status: number, body: object|null }>}
 */
export async function handleRequest({ method, path, query, body, headers = {} }) {
  await delay()

  const candidates = routes.filter((route) => route.regex.test(path))
  if (!candidates.length) return { status: 404, body: { message: 'Not found.' } }
  const route = candidates.find((r) => r.method === method)
  if (!route) return { status: 405, body: { message: 'Method not allowed.' } }

  const params = Object.fromEntries(
    Object.entries(path.match(route.regex).groups ?? {}).map(([key, value]) => [key, decodeURIComponent(value)]),
  )
  const queryParams = Object.fromEntries(new URLSearchParams(query))

  try {
    // Deep-copy so handlers never share object references with the caller.
    const result = route.handler({ params, query: queryParams, body: structuredClone(body ?? {}), headers })
    return { status: result.status, body: result.body === null ? null : structuredClone(result.body) }
  } catch (error) {
    if (error instanceof HttpError) return { status: error.status, body: error.body }
    console.error('[mock server]', error)
    return { status: 500, body: { message: 'Server error.' } }
  }
}
