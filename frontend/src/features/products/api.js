import { z } from 'zod'
import { apiClient } from '../../lib/api-client'
import { dataOf } from '../../lib/schemas'
import { productDetailSchema, productSummarySchema, promotionSchema } from './schemas'

/** GET /products/{slug} */
export async function getProduct(slug) {
  return dataOf(productDetailSchema).parse(await apiClient.get(`/products/${encodeURIComponent(slug)}`))
}

/** GET /products/{slug}/related */
export async function getRelatedProducts(slug) {
  return dataOf(z.array(productSummarySchema)).parse(
    await apiClient.get(`/products/${encodeURIComponent(slug)}/related`),
  )
}

/** GET /promotions/deals-of-the-week */
export async function getDealsOfTheWeek() {
  return dataOf(promotionSchema).parse(await apiClient.get('/promotions/deals-of-the-week'))
}
