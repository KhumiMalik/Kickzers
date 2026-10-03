import { brands, categories, colors, products } from '../data/catalog'
import { heroSlides } from '../data/site'
import { delay, nextId, notFound, paginate } from './mock'

const parentOf = Object.fromEntries(
  categories.flatMap((parent) => parent.children.map((child) => [child.slug, parent.slug])),
)

function inCategory(product, slug) {
  return product.category === slug || parentOf[product.category] === slug
}

const sorters = {
  default: (a, b) => a.id - b.id,
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
  'price-asc': (a, b) => a.price - b.price,
  'price-desc': (a, b) => b.price - a.price,
  name: (a, b) => a.name.localeCompare(b.name),
}

export const sortOptions = [
  { value: 'default', label: 'Default sorting' },
  { value: 'newest', label: 'Newest first' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'name', label: 'Name: A to Z' },
]

export const perPageOptions = [6, 12, 24]

/**
 * GET /api/products
 * @param {object} params category, brand, color, minPrice, maxPrice, q, flag, comingSoon, sort, page, perPage
 */
export function getProducts(params = {}) {
  const { category, brand, color, minPrice, maxPrice, q, flag, comingSoon, sort = 'default', page = 1, perPage = 12 } = params
  const term = q?.trim().toLowerCase()

  const result = products
    .filter((p) => !category || inCategory(p, category))
    .filter((p) => !brand || p.brand === brand)
    .filter((p) => !color || p.color === color)
    .filter((p) => minPrice == null || p.price >= minPrice)
    .filter((p) => maxPrice == null || p.price <= maxPrice)
    .filter((p) => !flag || p.flags.includes(flag))
    .filter((p) => comingSoon == null || p.comingSoon === comingSoon)
    .filter((p) => !term || p.name.toLowerCase().includes(term) || p.brand.includes(term))
    .sort(sorters[sort] ?? sorters.default)

  return delay(paginate(result, page, perPage))
}

/** GET /api/products/{slug} */
export async function getProduct(slug) {
  await delay()
  const product = products.find((p) => p.slug === slug)
  if (!product) throw notFound('Product')
  return structuredClone(product)
}

/** GET /api/products/{slug}/related */
export function getRelatedProducts(slug, limit = 9) {
  const product = products.find((p) => p.slug === slug)
  const parent = product && (parentOf[product.category] ?? product.category)
  const related = products.filter((p) => p.slug !== slug && !p.comingSoon)
  related.sort((a, b) => Number(inCategory(b, parent)) - Number(inCategory(a, parent)))
  return delay(related.slice(0, limit))
}

/** GET /api/home — everything the home page needs in one request */
export function getHomeData() {
  const available = products.filter((p) => !p.comingSoon)
  return delay({
    heroSlides: heroSlides.map((slide) => ({ ...slide, product: products.find((p) => p.slug === slide.productSlug) })),
    latest: [...available].sort(sorters.newest).slice(0, 8),
    coming: products.filter((p) => p.comingSoon).slice(0, 8),
    exclusive: products.filter((p) => p.flags.includes('exclusive')),
    deals: products.filter((p) => p.flags.includes('deal')).slice(0, 9),
  })
}

/** GET /api/shop/filters — facets with product counts */
export function getShopFilters() {
  const count = (predicate) => products.filter(predicate).length
  const prices = products.map((p) => p.price)

  return delay({
    categories: categories.map((parent) => ({
      ...parent,
      count: count((p) => inCategory(p, parent.slug)),
      children: parent.children.map((child) => ({ ...child, count: count((p) => p.category === child.slug) })),
    })),
    brands: brands.map((b) => ({ ...b, count: count((p) => p.brand === b.slug) })).filter((b) => b.count > 0),
    colors: colors.map((c) => ({ ...c, count: count((p) => p.color === c.slug) })).filter((c) => c.count > 0),
    priceRange: { min: Math.floor(Math.min(...prices)), max: Math.ceil(Math.max(...prices)) },
  })
}

/** POST /api/products/{id}/reviews */
export function addProductReview(productId, { name, email, rating, text }) {
  const product = products.find((p) => p.id === productId)
  const review = { id: nextId(product.reviews), name, email, rating, text, avatar: '/img/product/review-1.png', date: new Date().toISOString() }
  product.reviews.push(review)
  return delay(review)
}

/** POST /api/products/{id}/comments */
export function addProductComment(productId, { name, email, text }) {
  const product = products.find((p) => p.id === productId)
  const comment = { id: nextId(product.comments), name, email, text, avatar: '/img/product/review-2.png', date: new Date().toISOString(), replies: [] }
  product.comments.push(comment)
  return delay(comment)
}
