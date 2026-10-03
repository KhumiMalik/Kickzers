import BlogInfo from './BlogInfo'
import PostNavigation from './PostNavigation'

/** The body of a single blog post (cover, meta, text, quote, images, prev/next). */
export default function PostArticle({ post }) {
  return (
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
                    <i className={`fa fa-${icon}`} aria-hidden="true"></i>
                  </a>
                </li>
              ))}
            </ul>
          </BlogInfo>
        </div>
        <div className="col-lg-9 col-md-9 blog_details">
          <h2>{post.title}</h2>
          <p className="excert">{post.excerpt}</p>
          {post.body.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        <div className="col-lg-12">
          {post.quote && <div className="quotes">{post.quote}</div>}
          <div className="row">
            {post.gallery.map((src) => (
              <div key={src} className="col-6">
                <img className="img-fluid" src={src} alt="" />
              </div>
            ))}
            <div className="col-lg-12 mt-25">
              {post.closing.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
      <PostNavigation previous={post.previous} next={post.next} />
    </>
  )
}
