import { z } from 'zod'
import { requiredEmail, requiredText } from '../../lib/forms'
import { isoDateTime, money } from '../../lib/schemas'

const addressSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  company: z.string().nullable(),
  addressLine1: z.string(),
  addressLine2: z.string().nullable(),
  city: z.string(),
  state: z.string().nullable(),
  postcode: z.string().nullable(),
  country: z.string(),
  countryName: z.string(),
})

const totalsSchema = z.object({ subtotal: money, discount: money, shipping: money, total: money })

/** A placed order with snapshot items (API contract §2.8). */
export const orderSchema = z.object({
  number: z.string(),
  status: z.string(),
  statusLabel: z.string(),
  placedAt: isoDateTime,
  email: z.string(),
  billingAddress: addressSchema.extend({ phone: z.string(), email: z.string() }),
  shippingAddress: addressSchema,
  items: z.array(
    z.object({
      productSlug: z.string().nullable(),
      name: z.string(),
      unitPrice: money,
      quantity: z.number().int(),
      lineTotal: money,
    }),
  ),
  couponCode: z.string().nullable(),
  shippingMethod: z.object({ code: z.string(), name: z.string(), price: money }),
  paymentMethod: z.object({ code: z.string(), name: z.string() }),
  paymentStatus: z.string(),
  totals: totalsSchema,
  currency: z.string().length(3),
  notes: z.string().nullable(),
})

export const trackingSchema = z.object({
  number: z.string(),
  status: z.string(),
  statusLabel: z.string(),
  placedAt: isoDateTime,
  itemCount: z.number().int(),
  shippingMethod: z.object({ code: z.string(), name: z.string(), price: money }),
  totals: z.object({ total: money }),
  currency: z.string().length(3),
})

export const trackingFormSchema = z.object({
  orderNumber: requiredText('Order ID'),
  email: requiredEmail('Billing email'),
})
