import { z } from 'zod'
import { apiClient } from '../../lib/api-client'
import { dataOf } from '../../lib/schemas'

// The API returns full product summaries; the UI only needs ids to show the
// heart state, so only `id` is validated (other fields are ignored).
const listSchema = dataOf(z.array(z.object({ id: z.number().int() })))

/** GET /wishlist */
export const getWishlist = async () => listSchema.parse(await apiClient.get('/wishlist'))

/** POST /wishlist */
export const addToWishlist = (productId) => apiClient.post('/wishlist', { productId })

/** DELETE /wishlist/{productId} */
export const removeFromWishlist = (productId) => apiClient.delete(`/wishlist/${productId}`)

/** POST /wishlist/merge */
export const mergeWishlist = async (productIds) =>
  listSchema.parse(await apiClient.post('/wishlist/merge', { productIds }))
