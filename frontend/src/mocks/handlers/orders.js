import { countries, paymentMethods } from '../data/reference'
import { currentCart, currentUser, db, emptyCart, nextId, save } from '../db'
import { created, forbidden, HttpError, notFound, ok, requireFields, validationError } from '../http'
import { countryName, CURRENCY, findProduct, isPurchasable, stockOf } from '../resources'
import { availableShippingMethods, calculateTotals, couponProblem } from './cart'

const addressFields = {
  first_name: 'First name',
  last_name: 'Last name',
  address_line_1: 'Address',
  city: 'Town/City',
  country: 'Country',
}

const prefixed = (prefix, fields) =>
  Object.fromEntries(Object.entries(fields).map(([key, label]) => [`${prefix}.${key}`, label]))

function address(input, withContact) {
  return {
    first_name: input.first_name,
    last_name: input.last_name,
    company: input.company || null,
    ...(withContact && { phone: input.phone, email: input.email }),
    address_line_1: input.address_line_1,
    address_line_2: input.address_line_2 || null,
    city: input.city,
    state: input.state || null,
    postcode: input.postcode || null,
    country: input.country,
    country_name: countryName(input.country),
  }
}

export function orderResource(order) {
  return {
    number: order.number,
    status: order.status,
    status_label: order.status[0].toUpperCase() + order.status.slice(1),
    placed_at: order.placed_at,
    email: order.email,
    billing_address: order.billing_address,
    shipping_address: order.shipping_address,
    items: order.items,
    coupon_code: order.coupon_code,
    shipping_method: order.shipping_method,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    totals: order.totals,
    currency: CURRENCY,
    notes: order.notes,
  }
}

/** POST /checkout — the mock version of the PlaceOrder action. */
export function placeOrder({ body, headers }) {
  const key = headers['Idempotency-Key']
  if (!key) throw new HttpError(400, { message: 'The Idempotency-Key header is required.' })

  const user = currentUser()
  const replay = db.orders.find((o) => o.idempotency_key === key)
  if (replay) {
    const sameCustomer = user ? replay.user_id === user.id : replay.email === body.billing?.email?.trim().toLowerCase()
    if (!sameCustomer)
      throw new HttpError(409, { message: 'This checkout was already submitted.', code: 'idempotency_conflict' })
    return ok({ data: orderResource(replay) })
  }

  // 1. Validate input
  requireFields(body, {
    ...prefixed('billing', addressFields),
    'billing.phone': 'Phone number',
    'billing.email': 'Email address',
  })
  if (body.ship_to_different_address) requireFields(body, prefixed('shipping_address', addressFields))
  const errors = {}
  if (!body.accept_terms) errors.accept_terms = ['Please accept the terms & conditions.']
  const payment = paymentMethods.find((m) => m.code === body.payment_method)
  if (!payment) errors.payment_method = ['Please choose a payment method.']
  if (!countries.some((c) => c.code === body.billing.country)) errors['billing.country'] = ['Please choose a country.']
  const email = String(body.billing.email).trim().toLowerCase()
  const createAccount = Boolean(body.create_account) && !user
  if (createAccount) {
    if (String(body.password ?? '').length < 8) errors.password = ['The password must be at least 8 characters.']
    else if (db.users.some((u) => u.email === email))
      errors['billing.email'] = ['An account with this email already exists. Please log in.']
  }
  if (Object.keys(errors).length) throw validationError(errors)

  // 2. Re-check the cart against current stock and rules
  const cart = currentCart()
  if (!cart.items.length) throw validationError({ cart: ['Your cart is empty.'] })
  for (const item of cart.items) {
    const product = findProduct((p) => p.id === item.product_id)
    if (!isPurchasable(product)) throw validationError({ cart: [`${product.name} is no longer available.`] })
    if (item.quantity > stockOf(product))
      throw validationError({ cart: [`${product.name} has only ${stockOf(product)} left in stock.`] })
  }
  const shippingCountry = body.ship_to_different_address ? body.shipping_address.country : body.billing.country
  if (!availableShippingMethods(shippingCountry).some((m) => m.code === cart.shipping_method)) {
    throw validationError({
      cart: [`The selected shipping method is not available for ${countryName(shippingCountry)}.`],
    })
  }
  const { lines, coupon, method, totals } = calculateTotals(cart)
  if (coupon && couponProblem(coupon, totals.subtotal))
    throw validationError({ coupon: [couponProblem(coupon, totals.subtotal)] })

  // 3. Create the order with snapshot names and prices
  const sequence = nextId('order')
  const billing = address(body.billing, true)
  const order = {
    number: `KZ-${new Date().getFullYear()}-${String(sequence).padStart(6, '0')}`,
    idempotency_key: key,
    user_id: user?.id ?? null,
    status: 'processing',
    payment_status: 'unpaid',
    placed_at: new Date().toISOString(),
    email,
    billing_address: billing,
    shipping_address: body.ship_to_different_address
      ? address(body.shipping_address, false)
      : address(body.billing, false),
    items: lines.map(({ item, product, lineTotal }) => ({
      product_slug: product.slug,
      name: product.name,
      unit_price: product.price,
      quantity: item.quantity,
      line_total: lineTotal,
    })),
    coupon_code: coupon?.code ?? null,
    shipping_method: { code: method.code, name: method.name, price: totals.shipping },
    payment_method: { code: payment.code, name: payment.name },
    totals,
    notes: body.notes || null,
  }

  // 4. Optionally create the account and log the session in (cart is emptied below anyway)
  if (createAccount) {
    const name = `${billing.first_name} ${billing.last_name}`.trim()
    const account = { id: nextId('user'), name, email, created_at: new Date().toISOString() }
    db.users.push(account)
    order.user_id = account.id
    db.session.userId = account.id
  }

  // 5. Decrement stock, 6. empty the cart, 7. remember the order for this session
  for (const { item } of lines) db.stock[item.product_id] -= item.quantity
  Object.assign(cart, { ...emptyCart(), shipping_method: cart.shipping_method, destination: cart.destination })
  db.orders.push(order)
  db.session.placedOrders.push(order.number)
  save()
  return created({ data: orderResource(order) })
}

/** GET /orders/{number} — owner, or the session that placed it. */
export function showOrder({ params }) {
  const order = db.orders.find((o) => o.number === params.number)
  if (!order) throw notFound('Order not found.')
  const user = currentUser()
  const allowed = (user && order.user_id === user.id) || db.session.placedOrders.includes(order.number)
  if (!allowed) throw forbidden()
  return ok({ data: orderResource(order) })
}

/** POST /orders/track */
export function trackOrder({ body }) {
  requireFields(body, { order_number: 'Order number', email: 'Billing email' })
  const order = db.orders.find(
    (o) => o.number === body.order_number.trim().toUpperCase() && o.email === body.email.trim().toLowerCase(),
  )
  if (!order) throw notFound('No order matches that order number and billing email.')
  return ok({
    data: {
      number: order.number,
      status: order.status,
      status_label: orderResource(order).status_label,
      placed_at: order.placed_at,
      item_count: order.items.reduce((n, i) => n + i.quantity, 0),
      shipping_method: order.shipping_method,
      totals: { total: order.totals.total },
      currency: CURRENCY,
    },
  })
}
