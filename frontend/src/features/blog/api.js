import { apiClient } from '../../lib/api-client'
import { dataOf, paginatedOf } from '../../lib/schemas'
import { blogSidebarSchema, postDetailSchema, postSummarySchema } from './schemas'

/** GET /posts?category=&tag=&q=&page= */
export const getPosts = async ({ category, tag, q, page }) =>
  paginatedOf(postSummarySchema).parse(await apiClient.get('/posts', { params: { category, tag, q, page } }))

/** GET /posts/{slug} */
export const getPost = async (slug) =>
  dataOf(postDetailSchema).parse(await apiClient.get(`/posts/${encodeURIComponent(slug)}`))

/** GET /blog/sidebar */
export const getBlogSidebar = async () => dataOf(blogSidebarSchema).parse(await apiClient.get('/blog/sidebar'))
