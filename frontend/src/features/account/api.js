import { apiClient } from '../../lib/api-client'
import { orderHistorySchema } from './schemas'

/** GET /account/orders — the logged-in customer's orders, newest first. */
export const getOrderHistory = async ({ page = 1 } = {}) =>
  orderHistorySchema.parse(await apiClient.get('/account/orders', { params: { page } }))
