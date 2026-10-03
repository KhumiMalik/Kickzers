import { z } from 'zod'
import { submissionSchema } from '../../lib/forms'
import { imageUrl, isoDateTime } from '../../lib/schemas'

export const reviewSchema = z.object({
  id: z.number().int(),
  authorName: z.string(),
  avatar: imageUrl.nullable(),
  rating: z.number().int().min(1).max(5),
  body: z.string(),
  createdAt: isoDateTime,
})

export const reviewFormSchema = submissionSchema('Review').extend({
  rating: z.number().int().min(1, 'Please choose a rating.').max(5),
})
