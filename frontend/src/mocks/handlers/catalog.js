import { banners, brands, categories, colors, products, promotions } from '../data/catalog'
import { notFound, ok, paginate, validationError } from '../http'
import { CURRENCY, findProduct, productDetail, productSummary } from '../resources'

const published = () => products.filter((p) => p.status !== 'draft')
const childrenOf = (slug) => categories.filter((c) => c.parent === slug).map((c) => c.slug)
const inCategory = (product, slug) => product.category === slug || childrenOf(slug).includes(product.category)

const sorters = {
  default: (a, b) => a.position - b.position,
  newest: (a, b) => b.published_at.localeCompare(a.published_at),
  'price-asc': (a, b) => a.price - b.price || a.position - b.position,
  'price-desc': (a, b) => b.price - a.price || a.position - b.position,
  name: (a, b) => a.name.localeCompare(b.name),
}

function promotion(type) {
  const promo = promotions[type]
  if (!promo || new Date(promo.ends_at) < new Date()) return null
  return {
    title: promo.title,
    ends_at: promo.ends_at,
    products: promo.product_ids.map((id) => productSummary(findProduct((p) => p.id === id))),
  }
}

/** GET /home */
export function home() {
  const active = published().filter((p) => p.status === 'active')
  const weekly = promotion('deals_of_the_week')
  return ok({
    data: {
      hero_slides: banners.map((b) => ({
        id: b.id,
        title_lines: b.title_lines,
        body: b.body,
        image: b.image,
        product: productSummary(findProduct((p) => p.id === b.product_id)),
      })),
      latest: [...active].sort(sorters.newest).slice(0, 8).map(productSummary),
      coming_soon: published()
        .filter((p) => p.status === 'coming_soon')
        .slice(0, 8)
        .map(productSummary),
      exclusive_deal: promotion('exclusive_deal'),
      deals_of_the_week: weekly && { ends_at: weekly.ends_at, products: weekly.products },
    },
  })
}

/** GET /products */
export function listProducts({ query }) {
  const sort = query.sort ?? 'default'
  const perPage = Number(query.per_page ?? 12)
  const min = query.min_price === undefined ? null : Number(query.min_price)
  const max = query.max_price === undefined ? null : Number(query.max_price)
  const errors = {}
  if (!sorters[sort]) errors.sort = ['The selected sort is invalid.']
  if (![6, 12, 24].includes(perPage)) errors.per_page = ['The selected per page is invalid.']
  if (min !== null && max !== null && max < min)
    errors.max_price = ['The max price must be greater than or equal to the min price.']
  if (Object.keys(errors).length) throw validationError(errors)

  const term = query.q?.trim().toLowerCase()
  const brandName = (p) => brands.find((b) => b.slug === p.brand).name.toLowerCase()
  const result = published()
    .filter((p) => !query.category || inCategory(p, query.category))
    .filter((p) => !query.brand || p.brand === query.brand)
    .filter((p) => !query.color || p.color === query.color)
    .filter((p) => min === null || p.price >= min)
    .filter((p) => max === null || p.price <= max)
    .filter((p) => !term || p.name.toLowerCase().includes(term) || brandName(p).includes(term))
    .sort(sorters[sort])
    .map(productSummary)

  return ok(paginate(result, { page: query.page, perPage, path: '/api/v1/products' }))
}

/** GET /catalog/filters */
export function filters() {
  const list = published()
  const count = (predicate) => list.filter(predicate).length
  const prices = list.map((p) => p.price)
  return ok({
    data: {
      categories: categories
        .filter((c) => !c.parent)
        .map((parent) => ({
          slug: parent.slug,
          name: parent.name,
          products_count: count((p) => inCategory(p, parent.slug)),
          children: categories
            .filter((c) => c.parent === parent.slug)
            .map((child) => ({
              slug: child.slug,
              name: child.name,
              products_count: count((p) => p.category === child.slug),
            })),
        })),
      brands: brands
        .map((b) => ({ ...b, products_count: count((p) => p.brand === b.slug) }))
        .filter((b) => b.products_count > 0),
      colors: colors
        .map((c) => ({ ...c, products_count: count((p) => p.color === c.slug) }))
        .filter((c) => c.products_count > 0),
      price_range: { min: Math.min(...prices), max: Math.max(...prices) },
      currency: CURRENCY,
    },
  })
}

function findBySlug(slug) {
  const product = findProduct((p) => p.slug === slug && p.status !== 'draft')
  if (!product) throw notFound('Product not found.')
  return product
}

/** GET /products/{slug} */
export const showProduct = ({ params }) => ok({ data: productDetail(findBySlug(params.slug)) })

/** GET /products/{slug}/related */
export function relatedProducts({ params }) {
  const product = findBySlug(params.slug)
  const parent = categories.find((c) => c.slug === product.category).parent ?? product.category
  const related = published()
    .filter((p) => p.id !== product.id && p.status === 'active')
    .sort((a, b) => Number(inCategory(b, parent)) - Number(inCategory(a, parent)) || a.position - b.position)
    .slice(0, 9)
  return ok({ data: related.map(productSummary) })
}

/** GET /promotions/deals-of-the-week */
export function dealsOfTheWeek() {
  const deals = promotion('deals_of_the_week')
  if (!deals) throw notFound('No active promotion.')
  return ok({ data: { ends_at: deals.ends_at, products: deals.products } })
}
