import { ApiError, delay, notFound, readStore, validationError, writeStore } from './mock'

const ORDERS_KEY = 'karma.orders'

const coupons = {
  KARMA10: { code: 'KARMA10', type: 'percent', value: 10, label: '10% off' },
  SAVE20: { code: 'SAVE20', type: 'fixed', value: 20, label: '$20 off' },
}

/** POST /api/coupons/validate */
export async function validateCoupon(code) {
  await delay()
  const coupon = coupons[code?.trim().toUpperCase()]
  if (!coupon) throw validationError({ code: ['This coupon code is not valid.'] })
  return coupon
}

/** POST /api/orders */
export async function createOrder(payload) {
  await delay(null, 600)
  if (!payload.items?.length) throw new ApiError('Your cart is empty.', { status: 422 })

  const orders = readStore(ORDERS_KEY, [])
  const order = {
    ...payload,
    id: String(60235 + orders.length),
    status: 'Processing',
    createdAt: new Date().toISOString(),
  }
  writeStore(ORDERS_KEY, [...orders, order])
  return order
}

/** GET /api/orders/{id} */
export async function getOrder(id) {
  await delay()
  const order = readStore(ORDERS_KEY, []).find((o) => o.id === String(id))
  if (!order) throw notFound('Order')
  return order
}

/** POST /api/orders/track */
export async function trackOrder({ orderId, email }) {
  await delay()
  const order = readStore(ORDERS_KEY, []).find(
    (o) => o.id === orderId.trim() && o.billing.email.toLowerCase() === email.trim().toLowerCase(),
  )
  if (!order) throw new ApiError('No order matches that Order ID and billing email.', { status: 404 })
  return order
}
