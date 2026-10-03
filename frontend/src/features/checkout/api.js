import { z } from 'zod'
import { apiClient } from '../../lib/api-client'
import { dataOf } from '../../lib/schemas'
import { orderSchema } from '../orders'
import { paymentMethodSchema } from './schemas'

/** GET /payment-methods */
export const getPaymentMethods = async () =>
  dataOf(z.array(paymentMethodSchema)).parse(await apiClient.get('/payment-methods'))

/**
 * POST /checkout. The same `idempotencyKey` is sent on retries, so a double
 * click or network retry returns the original order instead of a duplicate.
 */
export const placeOrder = async (payload, idempotencyKey) =>
  dataOf(orderSchema).parse(
    await apiClient.post('/checkout', payload, { headers: { 'Idempotency-Key': idempotencyKey } }),
  )
