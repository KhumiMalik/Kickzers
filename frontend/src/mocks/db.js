import { postComments, posts } from './data/blog'
import { productComments, products, reviews } from './data/catalog'
import { DEFAULT_SHIPPING_METHOD } from './data/reference'

/**
 * Mutable state of the mock server. It is saved to localStorage after each
 * write so a page reload behaves like a real server that remembers your cart,
 * session and orders. Static catalog data is imported directly from ./data.
 */
const STORAGE_KEY = 'karma.mock-server.v1'

export const emptyCart = () => ({
  items: [],
  coupon_code: null,
  shipping_method: DEFAULT_SHIPPING_METHOD,
  destination: { country: null, state: null, postcode: null },
  notices: [],
})

function seedComments() {
  const all = [...productComments, ...postComments]
  const idByKey = Object.fromEntries(all.map((comment, index) => [comment.key, index + 1]))
  return all.map(({ key, parent, ...comment }) => ({
    ...comment,
    id: idByKey[key],
    parent_id: parent ? idByKey[parent] : null,
  }))
}

function seed() {
  const comments = seedComments()
  return {
    nextId: { review: reviews.length + 1, comment: comments.length + 1, cartItem: 1, order: 1, user: 1 },
    stock: Object.fromEntries(products.map((p) => [p.id, p.stock_quantity])),
    postViews: Object.fromEntries(posts.map((p) => [p.id, p.views])),
    reviews: reviews.map((review, index) => ({ ...review, id: index + 1 })),
    comments,
    users: [],
    session: { userId: null, placedOrders: [] },
    carts: { guest: emptyCart() },
    wishlists: {},
    orders: [],
    subscribers: [],
    contactMessages: [],
  }
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : seed()
  } catch {
    return seed()
  }
}

export const db = load()

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db))
  } catch {
    // Storage unavailable: state just won't survive a reload.
  }
}

export function nextId(table) {
  return db.nextId[table]++
}

export const currentUser = () => db.users.find((u) => u.id === db.session.userId) ?? null

/** Key of the cart for the current visitor (stands in for the cart cookie / user id). */
export const currentCartKey = () => (db.session.userId ? `user:${db.session.userId}` : 'guest')

export function currentCart() {
  const key = currentCartKey()
  db.carts[key] ??= emptyCart()
  return db.carts[key]
}
