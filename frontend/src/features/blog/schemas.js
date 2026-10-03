import { z } from 'zod'
import { imageUrl, isoDateTime, slugName } from '../../lib/schemas'

export const postSummarySchema = z.object({
  id: z.number().int(),
  slug: z.string(),
  title: z.string(),
  excerpt: z.string(),
  image: imageUrl,
  thumbnail: imageUrl,
  author: z.object({ name: z.string() }),
  publishedAt: isoDateTime,
  views: z.number().int(),
  commentsCount: z.number().int(),
  categories: z.array(slugName),
  tags: z.array(slugName),
})

const postLink = z.object({ slug: z.string(), title: z.string(), thumbnail: imageUrl }).nullable()

export const postDetailSchema = postSummarySchema.extend({
  cover: imageUrl,
  body: z.array(z.string()),
  quote: z.string().nullable(),
  gallery: z.array(imageUrl),
  closing: z.array(z.string()),
  previous: postLink,
  next: postLink,
})

export const blogSidebarSchema = z.object({
  author: z.object({ name: z.string(), role: z.string(), avatar: imageUrl, bio: z.string() }),
  popular: z.array(z.object({ slug: z.string(), title: z.string(), thumbnail: imageUrl, publishedAt: isoDateTime })),
  categories: z.array(slugName.extend({ postsCount: z.number().int() })),
  tags: z.array(slugName),
  featuredCategories: z.array(slugName.extend({ tagline: z.string(), image: imageUrl })),
})
