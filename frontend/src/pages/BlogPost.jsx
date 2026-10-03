import { useParams } from 'react-router-dom'
import PageBanner from '../components/layout/PageBanner'
import ErrorState from '../components/ui/ErrorState'
import Loader from '../components/ui/Loader'
import { BlogSidebar, PostArticle, usePost } from '../features/blog'
import { PostComments } from '../features/comments'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import NotFound from './NotFound'

export default function BlogPost() {
  const { slug } = useParams()
  const { data: post, isPending, isError, error, refetch } = usePost(slug)
  useDocumentTitle(post?.title ?? 'Blog')

  if (error?.isNotFound) return <NotFound />

  return (
    <>
      <PageBanner title="Blog Page" crumbs={[{ label: 'Blog', to: '/blog' }, { label: post?.title ?? '…' }]} />
      <section className="blog_area single-post-area section_gap">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 posts-list">
              {isPending && <Loader />}
              {isError && <ErrorState message="This post could not be loaded." onRetry={refetch} />}
              {post && (
                <>
                  <PostArticle post={post} />
                  <PostComments key={post.slug} postSlug={post.slug} commentsCount={post.commentsCount} />
                </>
              )}
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
