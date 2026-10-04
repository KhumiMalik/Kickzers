import { z } from 'zod'
import { isoDateTime, money, paginatedOf } from '../../lib/schemas'

/** A row of the order history (API contract §2.8 OrderSummary). */
export const orderSummarySchema = z.object({
  number: z.string(),
  status: z.string(),
  statusLabel: z.string(),
  placedAt: isoDateTime,
  itemCount: z.number().int(),
  totals: z.object({ total: money }),
  currency: z.string(),
})

export const orderHistorySchema = paginatedOf(orderSummarySchema)
