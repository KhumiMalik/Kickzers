import { Link } from 'react-router-dom'

/** "Prev Post / Next Post" strip under an article. */
export default function PostNavigation({ previous, next }) {
  return (
    <div className="navigation-area">
      <div className="row">
        <div className="col-lg-6 col-md-6 col-12 nav-left flex-row d-flex justify-content-start align-items-center">
          {previous && (
            <>
              <div className="thumb">
                <Link to={`/blog/${previous.slug}`}>
                  <img className="img-fluid" src="/img/blog/prev.jpg" alt="" />
                </Link>
              </div>
              <div className="arrow">
                <Link to={`/blog/${previous.slug}`} aria-label="Previous post">
                  <span className="lnr text-white lnr-arrow-left" aria-hidden="true"></span>
                </Link>
              </div>
              <div className="detials">
                <p>Prev Post</p>
                <Link to={`/blog/${previous.slug}`}>
                  <h4>{previous.title}</h4>
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
                  <span className="lnr text-white lnr-arrow-right" aria-hidden="true"></span>
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
