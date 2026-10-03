import { z } from 'zod'
import { money, paginatedOf, slugName } from '../../lib/schemas'
import { productSummarySchema } from '../products'

export const productListSchema = paginatedOf(productSummarySchema)

const facet = slugName.extend({ productsCount: z.number().int() })

/** Facets for the shop sidebar (API contract §5.3). */
export const catalogFiltersSchema = z.object({
  categories: z.array(facet.extend({ children: z.array(facet) })),
  brands: z.array(facet),
  colors: z.array(facet),
  priceRange: z.object({ min: money, max: money }),
  currency: z.string().length(3),
})
