import { z } from 'zod'
import { requiredEmail, requiredText, submissionSchema } from '../../lib/forms'
import { imageUrl, isoDateTime } from '../../lib/schemas'

const commentFields = {
  id: z.number().int(),
  authorName: z.string(),
  avatar: imageUrl.nullable(),
  body: z.string(),
  createdAt: isoDateTime,
}

/** A top-level comment with one level of replies (API contract §2.5). */
export const commentSchema = z.object({
  ...commentFields,
  replies: z.array(z.object({ ...commentFields, replies: z.array(z.never()) })),
})

export const productCommentFormSchema = submissionSchema('Message')

export const postCommentFormSchema = z.object({
  name: requiredText('Name'),
  email: requiredEmail('Email'),
  subject: z.string().trim(),
  body: requiredText('Message'),
})
