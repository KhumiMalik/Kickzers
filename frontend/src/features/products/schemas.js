import { z } from 'zod'
import { imageUrl, isoDateTime, money, slugName } from '../../lib/schemas'

/** Product cards, lists, wishlist, related products, deals (API contract §2.2). */
export const productSummarySchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  name: z.string(),
  image: imageUrl,
  price: money,
  compareAtPrice: money.nullable(),
  currency: z.string().length(3),
  isInStock: z.boolean(),
  isComingSoon: z.boolean(),
  category: slugName,
  brand: slugName,
})

/** Product page and quick view (API contract §2.3). */
export const productDetailSchema = productSummarySchema.extend({
  sku: z.string(),
  shortDescription: z.string(),
  description: z.array(z.string()),
  gallery: z.array(imageUrl).min(1),
  specifications: z.array(z.object({ label: z.string(), value: z.string() })),
  category: slugName.extend({ parent: slugName.nullable() }),
  color: slugName,
  maxQuantity: z.number().int().nonnegative(),
  rating: z.object({
    average: z.number(),
    count: z.number().int(),
    breakdown: z.record(z.string(), z.number().int()),
  }),
  commentsCount: z.number().int(),
})

/** A time-limited group of products (deals of the week, exclusive deal). */
export const promotionSchema = z.object({
  endsAt: isoDateTime,
  products: z.array(productSummarySchema),
})
