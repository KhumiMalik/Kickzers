import { z } from 'zod'
import { imageUrl, money } from '../../lib/schemas'

/** The server-owned cart, including the totals the UI displays (API contract §2.7). */
export const cartSchema = z.object({
  items: z.array(
    z.object({
      id: z.number().int(),
      product: z.object({ id: z.number().int(), slug: z.string(), name: z.string(), image: imageUrl }),
      unitPrice: money,
      quantity: z.number().int().positive(),
      lineTotal: money,
      maxQuantity: z.number().int().nonnegative(),
    }),
  ),
  itemCount: z.number().int().nonnegative(),
  coupon: z.object({ code: z.string(), description: z.string() }).nullable(),
  shippingMethod: z.string().nullable(),
  shippingMethods: z.array(z.object({ code: z.string(), name: z.string(), price: money })),
  destination: z.object({
    country: z.string().nullable(),
    state: z.string().nullable(),
    postcode: z.string().nullable(),
  }),
  totals: z.object({ subtotal: money, discount: money, shipping: money, total: money }),
  currency: z.string().length(3),
  notices: z.array(z.string()),
})

export const countrySchema = z.object({ code: z.string(), name: z.string(), states: z.array(z.string()) })

export const couponFormSchema = z.object({
  code: z.string().trim().min(1, 'Please enter a coupon code.'),
})
