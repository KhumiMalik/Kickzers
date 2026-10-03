import { author, blogCategories, featuredCategories, posts, tags } from '../data/blog'
import { db, save } from '../db'
import { notFound, ok, paginate } from '../http'
import { newestPostsFirst, postDetail, postSummary } from '../resources'

/** GET /posts */
export function listPosts({ query }) {
  const term = query.q?.trim().toLowerCase()
  const result = newestPostsFirst()
    .filter((p) => !query.category || p.categories.includes(query.category))
    .filter((p) => !query.tag || p.tags.includes(query.tag))
    .filter((p) => !term || p.title.toLowerCase().includes(term) || p.excerpt.toLowerCase().includes(term))
    .map(postSummary)
  return ok(paginate(result, { page: query.page, perPage: Number(query.per_page ?? 5), path: '/api/v1/posts' }))
}

export function findPost(slug) {
  const post = posts.find((p) => p.slug === slug)
  if (!post) throw notFound('Post not found.')
  return post
}

/** GET /posts/{slug} — counts a view, like the real API does after responding. */
export function showPost({ params }) {
  const post = findPost(params.slug)
  const body = { data: postDetail(post) }
  db.postViews[post.id] = (db.postViews[post.id] ?? post.views) + 1
  save()
  return ok(body)
}

/** GET /blog/sidebar */
export function sidebar() {
  return ok({
    data: {
      author,
      popular: [...posts]
        .sort((a, b) => (db.postViews[b.id] ?? b.views) - (db.postViews[a.id] ?? a.views))
        .slice(0, 4)
        .map(({ slug, title, thumbnail, published_at }) => ({ slug, title, thumbnail, published_at })),
      categories: blogCategories.map((c) => ({
        ...c,
        posts_count: posts.filter((p) => p.categories.includes(c.slug)).length,
      })),
      tags,
      featured_categories: featuredCategories,
    },
  })
}
