import { author, blogCategories, posts } from '../data/blog'
import { delay, nextId, notFound, paginate } from './mock'

/** GET /api/posts?category=&tag=&q=&page= */
export function getPosts({ category, tag, q, page = 1, perPage = 5 } = {}) {
  const term = q?.trim().toLowerCase()
  const result = posts
    .filter((p) => !category || p.categories.includes(category))
    .filter((p) => !tag || p.tags.includes(tag))
    .filter((p) => !term || p.title.toLowerCase().includes(term) || p.excerpt.toLowerCase().includes(term))
    .sort((a, b) => b.date.localeCompare(a.date))
  return delay(paginate(result, page, perPage))
}

/** GET /api/posts/{slug} — the post plus its neighbours for prev/next navigation */
export async function getPost(slug) {
  await delay()
  const ordered = [...posts].sort((a, b) => b.date.localeCompare(a.date))
  const index = ordered.findIndex((p) => p.slug === slug)
  if (index === -1) throw notFound('Post')
  const summary = (p) => p && { slug: p.slug, title: p.title, thumb: p.thumb }
  return {
    post: structuredClone(ordered[index]),
    prev: summary(ordered[index + 1]),
    next: summary(ordered[index - 1]),
  }
}

/** GET /api/blog/sidebar */
export function getBlogSidebar() {
  return delay({
    author,
    popular: [...posts].sort((a, b) => b.views - a.views).slice(0, 4),
    categories: blogCategories.map((c) => ({ ...c, count: posts.filter((p) => p.categories.includes(c.slug)).length })),
    tags: [...new Set(posts.flatMap((p) => p.tags))],
  })
}

/** POST /api/posts/{id}/comments */
export function addPostComment(postId, { name, email, subject, text }) {
  const post = posts.find((p) => p.id === postId)
  const comment = { id: nextId(post.comments.flatMap((c) => [c, ...c.replies])), name, email, subject, text, avatar: '/img/blog/c6.jpg', date: new Date().toISOString(), replies: [] }
  post.comments.push(comment)
  return delay(comment)
}
