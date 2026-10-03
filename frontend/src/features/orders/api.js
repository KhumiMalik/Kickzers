import { apiClient } from '../../lib/api-client'
import { dataOf } from '../../lib/schemas'
import { orderSchema, trackingSchema } from './schemas'

/** GET /orders/{number} */
export const getOrder = async (number) =>
  dataOf(orderSchema).parse(await apiClient.get(`/orders/${encodeURIComponent(number)}`))

/** POST /orders/track */
export const trackOrder = async ({ orderNumber, email }) =>
  dataOf(trackingSchema).parse(await apiClient.post('/orders/track', { orderNumber, email }))
