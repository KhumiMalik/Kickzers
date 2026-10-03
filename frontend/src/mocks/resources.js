// Serializers that turn mock records into the JSON shapes of docs/api-contract.md §2
// (the mock equivalent of Laravel API Resources).

import { blogCategories, posts, tags } from './data/blog'
import { brands, categories, colors, products } from './data/catalog'
import { countries } from './data/reference'
import { db } from './db'

const bySlug = (list) => Object.fromEntries(list.map((item) => [item.slug, item]))
const categoryMap = bySlug(categories)
const brandMap = bySlug(brands)
const colorMap = bySlug(colors)
const tagMap = bySlug(tags)
const blogCategoryMap = bySlug(blogCategories)

export const CURRENCY = 'USD'

export const findProduct = (predicate) => products.find(predicate)
export const stockOf = (product) => db.stock[product.id] ?? 0
export const isPurchasable = (product) => product.status === 'active' && stockOf(product) > 0
export const maxQuantity = (product) => Math.min(stockOf(product), 99)

const slugName = ({ slug, name }) => ({ slug, name })

export function productSummary(p) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    image: p.images[0],
    price: p.price,
    compare_at_price: p.compare_at_price,
    currency: CURRENCY,
    is_in_stock: isPurchasable(p),
    is_coming_soon: p.status === 'coming_soon',
    category: slugName(categoryMap[p.category]),
    brand: slugName(brandMap[p.brand]),
  }
}

export function ratingOf(productId) {
  const ratings = db.reviews.filter((r) => r.product_id === productId).map((r) => r.rating)
  const breakdown = Object.fromEntries([5, 4, 3, 2, 1].map((n) => [String(n), ratings.filter((r) => r === n).length]))
  const average = ratings.length ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10 : 0
  return { average, count: ratings.length, breakdown }
}

const commentsFor = (commentable, id) =>
  db.comments.filter((c) => c.commentable === commentable && c.commentable_id === id)

export function productDetail(p) {
  const category = categoryMap[p.category]
  const parent = category.parent ? categoryMap[category.parent] : null
  return {
    ...productSummary(p),
    sku: p.sku,
    short_description: p.short_description,
    description: p.description,
    gallery: p.images,
    specifications: p.specifications,
    category: { ...slugName(category), parent: parent ? slugName(parent) : null },
    color: slugName(colorMap[p.color]),
    max_quantity: maxQuantity(p),
    rating: ratingOf(p.id),
    comments_count: commentsFor('product', p.id).length,
  }
}

export const reviewResource = (r) => ({
  id: r.id,
  author_name: r.author_name,
  avatar: r.avatar ?? null,
  rating: r.rating,
  body: r.body,
  created_at: r.created_at,
})

const commentFields = (c) => ({
  id: c.id,
  author_name: c.author_name,
  avatar: c.avatar ?? null,
  body: c.body,
  created_at: c.created_at,
})

export function commentResource(c) {
  const replies = db.comments
    .filter((reply) => reply.parent_id === c.id)
    .sort((a, b) => a.created_at.localeCompare(b.created_at))
    .map((reply) => ({ ...commentFields(reply), replies: [] }))
  return { ...commentFields(c), replies }
}

export function postSummary(p) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    image: p.image,
    thumbnail: p.thumbnail,
    author: { name: p.author },
    published_at: p.published_at,
    views: db.postViews[p.id] ?? p.views,
    comments_count: commentsFor('post', p.id).length,
    categories: p.categories.map((slug) => slugName(blogCategoryMap[slug])),
    tags: p.tags.map((slug) => slugName(tagMap[slug])),
  }
}

export const newestPostsFirst = () => [...posts].sort((a, b) => b.published_at.localeCompare(a.published_at))

export function postDetail(p) {
  const ordered = newestPostsFirst()
  const index = ordered.findIndex((other) => other.id === p.id)
  const link = (other) => (other ? { slug: other.slug, title: other.title, thumbnail: other.thumbnail } : null)
  return {
    ...postSummary(p),
    cover: p.cover,
    body: p.body,
    quote: p.quote,
    gallery: p.gallery,
    closing: p.closing,
    previous: link(ordered[index + 1]),
    next: link(ordered[index - 1]),
  }
}

export const countryName = (code) => countries.find((c) => c.code === code)?.name ?? code

export const userResource = (u) => ({ id: u.id, name: u.name, email: u.email, created_at: u.created_at })
