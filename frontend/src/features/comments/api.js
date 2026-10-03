import { apiClient } from '../../lib/api-client'
import { dataOf, paginatedOf } from '../../lib/schemas'
import { commentSchema } from './schemas'

/** `subject` is "products" or "posts"; comments work the same way on both. */
const base = (subject, slug) => `/${subject}/${encodeURIComponent(slug)}/comments`

/** GET /{products|posts}/{slug}/comments */
export const getComments = async (subject, slug, page = 1) =>
  paginatedOf(commentSchema).parse(await apiClient.get(base(subject, slug), { params: { page } }))

/** POST /{products|posts}/{slug}/comments */
export const createComment = async (subject, slug, values) =>
  dataOf(commentSchema).parse(await apiClient.post(base(subject, slug), values))
