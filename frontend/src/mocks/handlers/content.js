import { products } from '../data/catalog'
import { currentUser, db, nextId, save } from '../db'
import { accepted, created, notFound, ok, paginate, requireFields, validationError } from '../http'
import { commentResource, reviewResource } from '../resources'
import { findPost } from './blog'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function requireEmail(body, field = 'email') {
  if (!EMAIL_RE.test(String(body[field] ?? '').trim())) {
    throw validationError({ [field]: ['Please enter a valid email address.'] })
  }
}

function findProduct(slug) {
  const product = products.find((p) => p.slug === slug && p.status !== 'draft')
  if (!product) throw notFound('Product not found.')
  return product
}

/** Logged-in users may omit name/email; the account's values are used. */
function withAuthor(body) {
  const user = currentUser()
  return { ...body, name: body.name || user?.name, email: body.email || user?.email }
}

// ---------- Reviews ----------

/** GET /products/{slug}/reviews */
export function listReviews({ params, query }) {
  const product = findProduct(params.slug)
  const list = db.reviews
    .filter((r) => r.product_id === product.id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id)
    .map(reviewResource)
  return ok(
    paginate(list, {
      page: query.page,
      perPage: Number(query.per_page ?? 10),
      path: `/api/v1/products/${product.slug}/reviews`,
    }),
  )
}

/** POST /products/{slug}/reviews */
export function createReview({ params, body: raw }) {
  const product = findProduct(params.slug)
  const body = withAuthor(raw)
  requireFields(body, { name: 'Name', email: 'Email', body: 'Review' })
  requireEmail(body)
  const rating = Number(body.rating)
  if (!Number.isInteger(rating) || rating < 1 || rating > 5)
    throw validationError({ rating: ['Please choose a rating from 1 to 5.'] })

  const review = {
    id: nextId('review'),
    product_id: product.id,
    author_name: body.name.trim(),
    author_email: body.email.trim(),
    avatar: null,
    rating,
    body: body.body.trim(),
    created_at: new Date().toISOString(),
  }
  db.reviews.push(review)
  save()
  return created({ data: reviewResource(review) })
}

// ---------- Comments (products and posts) ----------

function listComments(commentable, subject, query, path) {
  const threads = db.comments
    .filter((c) => c.commentable === commentable && c.commentable_id === subject.id && c.parent_id === null)
    .sort((a, b) => a.created_at.localeCompare(b.created_at) || a.id - b.id)
    .map(commentResource)
  return ok(paginate(threads, { page: query.page, perPage: 20, path }))
}

function createComment(commentable, subject, raw) {
  const body = withAuthor(raw)
  requireFields(body, { name: 'Name', email: 'Email', body: 'Message' })
  requireEmail(body)
  if (body.parent_id != null) {
    const parent = db.comments.find((c) => c.id === Number(body.parent_id))
    const valid =
      parent && parent.commentable === commentable && parent.commentable_id === subject.id && parent.parent_id === null
    if (!valid) throw validationError({ parent_id: ['You can only reply to a top-level comment on this page.'] })
  }

  const comment = {
    id: nextId('comment'),
    commentable,
    commentable_id: subject.id,
    parent_id: body.parent_id ?? null,
    author_name: body.name.trim(),
    author_email: body.email.trim(),
    avatar: null,
    body: body.body.trim(),
    created_at: new Date().toISOString(),
  }
  db.comments.push(comment)
  save()
  return created({ data: commentResource(comment) })
}

export const listProductComments = ({ params, query }) => {
  const product = findProduct(params.slug)
  return listComments('product', product, query, `/api/v1/products/${product.slug}/comments`)
}
export const createProductComment = ({ params, body }) => createComment('product', findProduct(params.slug), body)
export const listPostComments = ({ params, query }) => {
  const post = findPost(params.slug)
  return listComments('post', post, query, `/api/v1/posts/${post.slug}/comments`)
}
export const createPostComment = ({ params, body }) => createComment('post', findPost(params.slug), body)

// ---------- Contact and newsletter ----------

/** POST /contact */
export function sendContactMessage({ body }) {
  requireFields(body, { name: 'Name', email: 'Email', subject: 'Subject', message: 'Message' })
  requireEmail(body)
  db.contactMessages.push({ ...body, created_at: new Date().toISOString() })
  save()
  return created({ message: 'Your message has been sent.' })
}

/** POST /newsletter — same answer for new and existing emails (no enumeration). */
export function subscribe({ body }) {
  requireFields(body, { email: 'Email' })
  requireEmail(body)
  const email = body.email.trim().toLowerCase()
  if (!db.subscribers.includes(email)) db.subscribers.push(email)
  save()
  return accepted({ message: 'Thank you for subscribing!' })
}
