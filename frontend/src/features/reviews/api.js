import { apiClient } from '../../lib/api-client'
import { dataOf, paginatedOf } from '../../lib/schemas'
import { reviewSchema } from './schemas'

const base = (slug) => `/products/${encodeURIComponent(slug)}/reviews`

/** GET /products/{slug}/reviews */
export const getReviews = async (slug, page = 1) =>
  paginatedOf(reviewSchema).parse(await apiClient.get(base(slug), { params: { page } }))

/** POST /products/{slug}/reviews */
export const createReview = async (slug, { name, email, phone, rating, body }) =>
  dataOf(reviewSchema).parse(await apiClient.post(base(slug), { name, email, phone, rating, body }))
