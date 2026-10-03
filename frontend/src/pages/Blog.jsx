import { Link, useSearchParams } from 'react-router-dom'
import { getPosts } from '../api/blog'
import BlogInfo from '../components/blog/BlogInfo'
import BlogSidebar from '../components/blog/BlogSidebar'
import Loader from '../components/common/Loader'
import { BlogPagination } from '../components/common/Pagination'
import PageBanner from '../components/layout/PageBanner'
import { blogCategories, featuredCategories } from '../data/blog'
import { useAsync } from '../hooks/useAsync'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function FeaturedCategories() {
  return (
    <section className="blog_categorie_area">
      <div className="container">
        <div className="row">
          {featuredCategories.map((c) => (
            <div key={c.title} className="col-lg-4">
              <div className="categories_post">
                <img src={c.image} alt={c.title} />
                <div className="categories_details">
                  <div className="categories_text">
                    <Link to={`/blog?category=${c.slug}`}>
                      <h5>{c.title}</h5>
                    </Link>
                    <div className="border_line"></div>
                    <p>{c.text}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default function Blog() {
  useDocumentTitle('Blog')
  const [params] = useSearchParams()
  const category = params.get('category')
  const tag = params.get('tag')
  const q = params.get('q')
  const page = Number(params.get('page')) || 1

  const { data } = useAsync(() => getPosts({ category, tag, q, page }), [category, tag, q, page])

  const hrefFor = (p) => {
    const next = new URLSearchParams(params)
    if (p > 1) next.set('page', p)
    else next.delete('page')
    return `?${next}`
  }

  const filterLabel = category
    ? `Category: ${blogCategories.find((c) => c.slug === category)?.name ?? category}`
    : tag
      ? `Tag: ${tag}`
      : q
        ? `Search: “${q}”`
        : null

  return (
    <>
      <PageBanner title="Blog Page" crumbs={[{ label: 'Blog', to: '/blog' }]} />
      <FeaturedCategories />
      <section className="blog_area">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <div className="blog_left_sidebar">
                {filterLabel && (
                  <div className="search-summary">
                    {filterLabel}
                    <Link to="/blog">Show all posts</Link>
                  </div>
                )}
                {!data && <Loader />}
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
            </div>
            <div className="col-lg-4">
              <BlogSidebar />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
