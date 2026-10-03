import { Link, useParams } from 'react-router-dom'
import { getPost } from '../api/blog'
import BlogInfo from '../components/blog/BlogInfo'
import BlogSidebar from '../components/blog/BlogSidebar'
import CommentsArea from '../components/blog/CommentsArea'
import Loader from '../components/common/Loader'
import PageBanner from '../components/layout/PageBanner'
import { useAsync } from '../hooks/useAsync'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import NotFound from './NotFound'

function PostNavigation({ prev, next }) {
  return (
    <div className="navigation-area">
      <div className="row">
        <div className="col-lg-6 col-md-6 col-12 nav-left flex-row d-flex justify-content-start align-items-center">
          {prev && (
            <>
              <div className="thumb">
                <Link to={`/blog/${prev.slug}`}>
                  <img className="img-fluid" src="/img/blog/prev.jpg" alt="" />
                </Link>
              </div>
              <div className="arrow">
                <Link to={`/blog/${prev.slug}`} aria-label="Previous post">
                  <span className="lnr text-white lnr-arrow-left"></span>
                </Link>
              </div>
              <div className="detials">
                <p>Prev Post</p>
                <Link to={`/blog/${prev.slug}`}>
                  <h4>{prev.title}</h4>
                </Link>
              </div>
            </>
          )}
        </div>
        <div className="col-lg-6 col-md-6 col-12 nav-right flex-row d-flex justify-content-end align-items-center">
          {next && (
            <>
              <div className="detials">
                <p>Next Post</p>
                <Link to={`/blog/${next.slug}`}>
                  <h4>{next.title}</h4>
                </Link>
              </div>
              <div className="arrow">
                <Link to={`/blog/${next.slug}`} aria-label="Next post">
                  <span className="lnr text-white lnr-arrow-right"></span>
                </Link>
              </div>
              <div className="thumb">
                <Link to={`/blog/${next.slug}`}>
                  <img className="img-fluid" src="/img/blog/next.jpg" alt="" />
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function BlogPost() {
  const { slug } = useParams()
  const { data, error } = useAsync(() => getPost(slug), [slug])
  const post = data?.post.slug === slug ? data.post : null
  useDocumentTitle(post?.title ?? 'Blog')

  if (error?.status === 404) return <NotFound />

  return (
    <>
      <PageBanner title="Blog Page" crumbs={[{ label: 'Blog', to: '/blog' }, { label: post?.title ?? '…' }]} />
      <section className="blog_area single-post-area section_gap">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 posts-list">
              {!post ? (
                <Loader />
              ) : (
                <>
                  <div className="single-post row">
                    <div className="col-lg-12">
                      <div className="feature-img">
                        <img className="img-fluid" src={post.cover} alt={post.title} />
                      </div>
                    </div>
                    <div className="col-lg-3 col-md-3">
                      <BlogInfo post={post}>
                        <ul className="social-links">
                          {['facebook', 'twitter', 'github', 'behance'].map((icon) => (
                            <li key={icon}>
                              <a href="#share" aria-label={`Share on ${icon}`}>
                                <i className={`fa fa-${icon}`}></i>
                              </a>
                            </li>
                          ))}
                        </ul>
                      </BlogInfo>
                    </div>
                    <div className="col-lg-9 col-md-9 blog_details">
                      <h2>{post.title}</h2>
                      <p className="excert">{post.excerpt}</p>
                      {post.body.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                    <div className="col-lg-12">
                      <div className="quotes">{post.quote}</div>
                      <div className="row">
                        {post.images.map((src) => (
                          <div key={src} className="col-6">
                            <img className="img-fluid" src={src} alt="" />
                          </div>
                        ))}
                        <div className="col-lg-12 mt-25">
                          {post.closing.map((p, i) => (
                            <p key={i}>{p}</p>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <PostNavigation prev={data.prev} next={data.next} />
                  <CommentsArea key={post.id} post={post} />
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
