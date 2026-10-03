import { products } from '../data/catalog'
import { currentUser, db, emptyCart, nextId, save } from '../db'
import { created, forbidden, noContent, ok, requireFields, unauthenticated, validationError } from '../http'
import { productSummary, userResource } from '../resources'
import { mergeItems } from './cart'

function requireGuest() {
  if (currentUser()) throw forbidden()
}

export function requireUser() {
  const user = currentUser()
  if (!user) throw unauthenticated()
  return user
}

/** Logs the session in and merges the guest cart into the user's cart (like the real API). */
function startSession(user) {
  db.session.userId = user.id
  const userKey = `user:${user.id}`
  db.carts[userKey] ??= emptyCart()
  const guest = db.carts.guest
  if (guest?.items.length) {
    mergeItems(db.carts[userKey], guest.items)
    db.carts[userKey].coupon_code ??= guest.coupon_code
  }
  db.carts.guest = emptyCart()
  save()
}

/**
 * POST /auth/login. Demo rule until Laravel exists: any identifier with a
 * password of 6+ characters logs in (creating the user on first login).
 */
export function login({ body }) {
  requireGuest()
  requireFields(body, { email: 'Email', password: 'Password' })
  if (String(body.password).length < 6)
    throw validationError({ email: ['These credentials do not match our records.'] })

  const identifier = body.email.trim().toLowerCase()
  let user = db.users.find((u) => u.email === identifier)
  if (!user) {
    user = { id: nextId('user'), name: body.email.trim(), email: identifier, created_at: new Date().toISOString() }
    db.users.push(user)
  }
  startSession(user)
  return ok({ data: userResource(user) })
}

/** POST /auth/register */
export function register({ body }) {
  requireGuest()
  requireFields(body, { name: 'Name', email: 'Email', password: 'Password' })
  const email = body.email.trim().toLowerCase()
  const errors = {}
  if (db.users.some((u) => u.email === email)) errors.email = ['The email has already been taken.']
  if (String(body.password).length < 8) errors.password = ['The password must be at least 8 characters.']
  else if (body.password !== body.password_confirmation) errors.password = ['The password confirmation does not match.']
  if (Object.keys(errors).length) throw validationError(errors)

  const user = { id: nextId('user'), name: body.name.trim(), email, created_at: new Date().toISOString() }
  db.users.push(user)
  startSession(user)
  return created({ data: userResource(user) })
}

/** POST /auth/logout */
export function logout() {
  requireUser()
  db.session = { userId: null, placedOrders: [] }
  save()
  return noContent()
}

/** GET /auth/user */
export const me = () => ok({ data: userResource(requireUser()) })

// ---------- Wishlist (logged-in users) ----------

const wishlistOf = (user) => (db.wishlists[user.id] ??= [])
const summaries = (ids) => ids.map((id) => productSummary(products.find((p) => p.id === id)))

/** GET /wishlist */
export const listWishlist = () => ok({ data: summaries([...wishlistOf(requireUser())].reverse()) })

function findWishlistProduct(id) {
  const product = products.find((p) => p.id === Number(id) && p.status !== 'draft')
  if (!product) throw validationError({ product_id: ['The selected product is invalid.'] })
  return product
}

/** POST /wishlist */
export function addToWishlist({ body }) {
  const list = wishlistOf(requireUser())
  const product = findWishlistProduct(body.product_id)
  if (list.includes(product.id)) return ok({ data: productSummary(product) })
  list.push(product.id)
  save()
  return created({ data: productSummary(product) })
}

/** DELETE /wishlist/{productId} */
export function removeFromWishlist({ params }) {
  const user = requireUser()
  db.wishlists[user.id] = wishlistOf(user).filter((id) => id !== Number(params.productId))
  save()
  return noContent()
}

/** POST /wishlist/merge — called once after login with the guest's local wishlist. */
export function mergeWishlist({ body }) {
  const list = wishlistOf(requireUser())
  for (const id of body.product_ids ?? []) {
    const product = findWishlistProduct(id)
    if (!list.includes(product.id)) list.push(product.id)
  }
  save()
  return ok({ data: summaries([...list].reverse()) })
}
