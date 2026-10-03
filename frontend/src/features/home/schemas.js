import { z } from 'zod'
import { imageUrl, isoDateTime } from '../../lib/schemas'
import { productSummarySchema, promotionSchema } from '../products'

/** GET /home (API contract §5.1) */
export const homeSchema = z.object({
  heroSlides: z.array(
    z.object({
      id: z.number().int(),
      titleLines: z.array(z.string()),
      body: z.string(),
      image: imageUrl,
      product: productSummarySchema,
    }),
  ),
  latest: z.array(productSummarySchema),
  comingSoon: z.array(productSummarySchema),
  exclusiveDeal: z
    .object({ title: z.string(), endsAt: isoDateTime, products: z.array(productSummarySchema) })
    .nullable(),
  dealsOfTheWeek: promotionSchema.nullable(),
})
