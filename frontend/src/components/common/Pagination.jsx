import { Link } from 'react-router-dom'
import { cx, pad2 } from '../../utils/format'

/** Page numbers with gaps, e.g. [1, 2, 3, '…', 6] */
function pageList(page, lastPage) {
  const pages = new Set([1, lastPage, page - 1, page, page + 1])
  const sorted = [...pages].filter((p) => p >= 1 && p <= lastPage).sort((a, b) => a - b)
  return sorted.flatMap((p, i) => (i > 0 && p - sorted[i - 1] > 1 ? ['…', p] : [p]))
}

/** Shop filter-bar pagination (.pagination). `hrefFor(page)` builds each link. */
export default function Pagination({ page, lastPage, hrefFor }) {
  if (lastPage <= 1) return <div className="pagination"></div>
  return (
    <div className="pagination">
      <Link to={hrefFor(Math.max(1, page - 1))} className="prev-arrow" aria-label="Previous page">
        <i className="fa fa-long-arrow-left" aria-hidden="true"></i>
      </Link>
      {pageList(page, lastPage).map((p, i) =>
        p === '…' ? (
          <span key={`gap-${i}`} className="dot-dot">
            <i className="fa fa-ellipsis-h" aria-hidden="true"></i>
          </span>
        ) : (
          <Link key={p} to={hrefFor(p)} className={cx(p === page && 'active')} aria-current={p === page ? 'page' : undefined}>
            {p}
          </Link>
        ),
      )}
      <Link to={hrefFor(Math.min(lastPage, page + 1))} className="next-arrow" aria-label="Next page">
        <i className="fa fa-long-arrow-right" aria-hidden="true"></i>
      </Link>
    </div>
  )
}

/** Blog list pagination (.blog-pagination). */
export function BlogPagination({ page, lastPage, hrefFor }) {
  if (lastPage <= 1) return null
  return (
    <nav className="blog-pagination justify-content-center d-flex">
      <ul className="pagination">
        <li className="page-item">
          <Link to={hrefFor(Math.max(1, page - 1))} className="page-link" aria-label="Previous">
            <span aria-hidden="true">
              <span className="lnr lnr-chevron-left"></span>
            </span>
          </Link>
        </li>
        {pageList(page, lastPage).map((p, i) =>
          p === '…' ? (
            <li key={`gap-${i}`} className="page-item disabled">
              <span className="page-link">…</span>
            </li>
          ) : (
            <li key={p} className={cx('page-item', p === page && 'active')}>
              <Link to={hrefFor(p)} className="page-link">
                {pad2(p)}
              </Link>
            </li>
          ),
        )}
        <li className="page-item">
          <Link to={hrefFor(Math.min(lastPage, page + 1))} className="page-link" aria-label="Next">
            <span aria-hidden="true">
              <span className="lnr lnr-chevron-right"></span>
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  )
}
