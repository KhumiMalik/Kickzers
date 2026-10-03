import { Link } from 'react-router-dom'
import ErrorState from '../../../components/ui/ErrorState'
import Loader from '../../../components/ui/Loader'
import { BlogPagination } from '../../../components/ui/Pagination'
import { useBlogSidebar, usePosts } from '../queries'
import BlogInfo from './BlogInfo'

function filterLabel({ category, tag, q }, sidebar) {
  const nameOf = (list, slug) => list?.find((item) => item.slug === slug)?.name ?? slug
  if (category) return `Category: ${nameOf(sidebar?.categories, category)}`
  if (tag) return `Tag: ${nameOf(sidebar?.tags, tag)}`
  if (q) return `Search: “${q}”`
  return null
}

/**
 * Blog post list with the active filter, pagination and loading/empty/error states.
 * @param {{ filters: { category?: string, tag?: string, q?: string, page: number }, hrefFor: (page: number) => string }} props
 */
export default function PostList({ filters, hrefFor }) {
  const { data, isPending, isError, refetch } = usePosts(filters)
  const { data: sidebar } = useBlogSidebar()
  const label = filterLabel(filters, sidebar)

  return (
    <div className="blog_left_sidebar">
      {label && (
        <div className="search-summary">
          {label}
          <Link to="/blog">Show all posts</Link>
        </div>
      )}
      {isPending && <Loader />}
      {isError && <ErrorState message="Posts could not be loaded." onRetry={refetch} />}
      {data?.data.length === 0 && <p className="empty-state">No posts found.</p>}
      {data?.data.map((post) => (
        <article key={post.id} className="row blog_item">
          <div className="col-md-3">
            <BlogInfo post={post} />
          </div>
          <div className="col-md-9">
            <div className="blog_post">
              <img src={post.image} alt={post.title} />
              <div className="blog_details">
                <Link to={`/blog/${post.slug}`}>
                  <h2>{post.title}</h2>
                </Link>
                <p>{post.excerpt}</p>
                <Link to={`/blog/${post.slug}`} className="white_bg_btn">
                  View More
                </Link>
              </div>
            </div>
          </div>
        </article>
      ))}
      {data && <BlogPagination page={data.meta.page} lastPage={data.meta.lastPage} hrefFor={hrefFor} />}
    </div>
  )
}
