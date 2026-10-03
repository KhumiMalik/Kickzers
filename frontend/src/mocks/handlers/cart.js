import { formatMoney } from '../../lib/money'
import { countries, coupons, paymentMethods, shippingMethods, STORE_COUNTRY } from '../data/reference'
import { currentCart, emptyCart, nextId, save } from '../db'
import { notFound, ok, validationError } from '../http'
import { CURRENCY, findProduct, isPurchasable, maxQuantity, stockOf } from '../resources'

// ---------- Rules shared with checkout ----------

/** Methods available for a destination country (null = not chosen yet). */
export function availableShippingMethods(country) {
  return shippingMethods.filter((m) => !m.domesticOnly || !country || country === STORE_COUNTRY)
}

export const findCoupon = (code) =>
  coupons.find(
    (c) =>
      c.code ===
      String(code ?? '')
        .trim()
        .toUpperCase(),
  )

/** Returns an error message, or null when the coupon can be used for `subtotal`. */
export function couponProblem(coupon, subtotal) {
  if (!coupon) return 'This coupon code is not valid.'
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) return 'This coupon has expired.'
  if (coupon.min_subtotal && subtotal < coupon.min_subtotal) {
    return `Spend ${formatMoney(coupon.min_subtotal)} or more to use this coupon.`
  }
  return null
}

/** All money maths lives here (server side). The client only displays the result. */
export function calculateTotals(cart) {
  const lines = cart.items.map((item) => {
    const product = findProduct((p) => p.id === item.product_id)
    return { item, product, lineTotal: product.price * item.quantity }
  })
  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0)
  const coupon = findCoupon(cart.coupon_code)
  const discount = !coupon
    ? 0
    : coupon.type === 'percent'
      ? Math.round((subtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal)
  const method = shippingMethods.find((m) => m.code === cart.shipping_method)
  const shipping = lines.length && method ? method.price : 0
  return { lines, coupon, method, totals: { subtotal, discount, shipping, total: subtotal - discount + shipping } }
}

/**
 * Brings a stored cart in line with current stock, availability and coupon rules,
 * recording a notice for every change (returned once, then cleared).
 */
export function reconcile(cart) {
  cart.items = cart.items.filter((item) => {
    const product = findProduct((p) => p.id === item.product_id)
    if (!product || !isPurchasable(product)) {
      cart.notices.push(`${product?.name ?? 'A product'} is no longer available and was removed from your cart.`)
      return false
    }
    if (item.quantity > maxQuantity(product)) {
      item.quantity = maxQuantity(product)
      cart.notices.push(`${product.name}: quantity reduced to ${item.quantity} (stock changed).`)
    }
    return true
  })

  const available = availableShippingMethods(cart.destination.country)
  if (!available.some((m) => m.code === cart.shipping_method)) {
    const cheapest = [...available].sort((a, b) => a.price - b.price)[0]
    cart.shipping_method = cheapest.code
    cart.notices.push(
      `Shipping changed to ${cheapest.name}: the previous method is not available for your destination.`,
    )
  }

  if (cart.coupon_code) {
    const subtotal = cart.items.reduce(
      (sum, i) => sum + findProduct((p) => p.id === i.product_id).price * i.quantity,
      0,
    )
    const problem = couponProblem(findCoupon(cart.coupon_code), subtotal)
    if (problem) {
      cart.notices.push(`Coupon ${cart.coupon_code} was removed: ${problem}`)
      cart.coupon_code = null
    }
  }
}

/** The Cart resource (docs/api-contract.md §2.7). Clears notices once they've been sent. */
export function cartResource(cart) {
  reconcile(cart)
  const { lines, coupon, totals } = calculateTotals(cart)
  const resource = {
    items: lines.map(({ item, product, lineTotal }) => ({
      id: item.id,
      product: { id: product.id, slug: product.slug, name: product.name, image: product.images[0] },
      unit_price: product.price,
      quantity: item.quantity,
      line_total: lineTotal,
      max_quantity: maxQuantity(product),
    })),
    item_count: cart.items.reduce((n, i) => n + i.quantity, 0),
    coupon: coupon ? { code: coupon.code, description: coupon.description } : null,
    shipping_method: cart.shipping_method,
    shipping_methods: availableShippingMethods(cart.destination.country).map(({ code, name, price }) => ({
      code,
      name,
      price,
    })),
    destination: cart.destination,
    totals,
    currency: CURRENCY,
    notices: cart.notices,
  }
  cart.notices = []
  save()
  return resource
}

const respond = (cart) => ok({ data: cartResource(cart) })

function findItem(cart, itemId) {
  const item = cart.items.find((i) => i.id === Number(itemId))
  if (!item) throw notFound('Cart item not found.')
  return item
}

function checkQuantity(product, quantity) {
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 99) {
    throw validationError({ quantity: ['The quantity must be between 1 and 99.'] })
  }
  if (quantity > stockOf(product)) {
    throw validationError({ quantity: [`Only ${stockOf(product)} of ${product.name} left in stock.`] })
  }
}

/** Adds `items` to the target cart, capping at stock (used when merging the guest cart on login). */
export function mergeItems(target, items) {
  for (const incoming of items) {
    const product = findProduct((p) => p.id === incoming.product_id)
    if (!product || !isPurchasable(product)) continue
    const existing = target.items.find((i) => i.product_id === incoming.product_id)
    if (existing) existing.quantity = Math.min(existing.quantity + incoming.quantity, maxQuantity(product))
    else
      target.items.push({
        id: nextId('cartItem'),
        product_id: product.id,
        quantity: Math.min(incoming.quantity, maxQuantity(product)),
      })
  }
}

// ---------- Handlers ----------

/** GET /cart */
export const showCart = () => respond(currentCart())

/** POST /cart/items */
export function addItem({ body }) {
  const cart = currentCart()
  const product = findProduct((p) => p.id === Number(body.product_id))
  if (!product) throw validationError({ product_id: ['The selected product is invalid.'] })
  if (!isPurchasable(product)) {
    const reason = product.status === 'coming_soon' ? 'is coming soon.' : 'is out of stock.'
    throw validationError({ product_id: [`${product.name} ${reason}`] })
  }
  const existing = cart.items.find((i) => i.product_id === product.id)
  const quantity = Number(body.quantity ?? 1)
  checkQuantity(product, (existing?.quantity ?? 0) + quantity)

  if (existing) existing.quantity += quantity
  else cart.items.push({ id: nextId('cartItem'), product_id: product.id, quantity })
  return respond(cart)
}

/** PATCH /cart/items/{id} */
export function updateItem({ params, body }) {
  const cart = currentCart()
  const item = findItem(cart, params.id)
  const quantity = Number(body.quantity)
  checkQuantity(
    findProduct((p) => p.id === item.product_id),
    quantity,
  )
  item.quantity = quantity
  return respond(cart)
}

/** DELETE /cart/items/{id} */
export function removeItem({ params }) {
  const cart = currentCart()
  findItem(cart, params.id)
  cart.items = cart.items.filter((i) => i.id !== Number(params.id))
  return respond(cart)
}

/** DELETE /cart */
export function clearCart() {
  const cart = currentCart()
  Object.assign(cart, { ...emptyCart(), shipping_method: cart.shipping_method, destination: cart.destination })
  return respond(cart)
}

/** POST /cart/coupon */
export function applyCoupon({ body }) {
  const cart = currentCart()
  if (!String(body.code ?? '').trim()) throw validationError({ code: ['Please enter a coupon code.'] })
  const coupon = findCoupon(body.code)
  const problem = couponProblem(coupon, calculateTotals(cart).totals.subtotal)
  if (problem) throw validationError({ code: [problem] })
  cart.coupon_code = coupon.code
  return respond(cart)
}

/** DELETE /cart/coupon */
export function removeCoupon() {
  const cart = currentCart()
  cart.coupon_code = null
  return respond(cart)
}

/** PUT /cart/shipping-method */
export function setShippingMethod({ body }) {
  const cart = currentCart()
  if (!availableShippingMethods(cart.destination.country).some((m) => m.code === body.method)) {
    throw validationError({ method: ['This shipping method is not available for your destination.'] })
  }
  cart.shipping_method = body.method
  return respond(cart)
}

/** PUT /cart/destination */
export function setDestination({ body }) {
  const cart = currentCart()
  const country = countries.find((c) => c.code === body.country)
  if (!country) throw validationError({ country: ['Please choose a country.'] })
  if (body.state && !country.states.includes(body.state))
    throw validationError({ state: ['Please choose a state in this country.'] })
  cart.destination = { country: country.code, state: body.state || null, postcode: body.postcode?.trim() || null }
  return respond(cart)
}

/** GET /countries */
export const listCountries = () => ok({ data: countries })

/** GET /payment-methods */
export const listPaymentMethods = () => ok({ data: paymentMethods })
