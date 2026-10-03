import { useSearchParams } from 'react-router-dom'
import PageBanner from '../components/layout/PageBanner'
import { BlogSidebar, FeaturedCategories, PostList } from '../features/blog'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Blog() {
  useDocumentTitle('Blog')
  const [params] = useSearchParams()
  const filters = {
    category: params.get('category'),
    tag: params.get('tag'),
    q: params.get('q'),
    page: Number(params.get('page')) || 1,
  }

  const hrefFor = (page) => {
    const next = new URLSearchParams(params)
    if (page > 1) next.set('page', page)
    else next.delete('page')
    return `?${next}`
  }

  return (
    <>
      <PageBanner title="Blog Page" crumbs={[{ label: 'Blog', to: '/blog' }]} />
      <FeaturedCategories />
      <section className="blog_area">
        <div className="container">
          <div className="row">
            <div className="col-lg-8">
              <PostList filters={filters} hrefFor={hrefFor} />
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
