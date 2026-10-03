import { Link } from 'react-router-dom'
import PageBanner from '../components/layout/PageBanner'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <>
      <PageBanner title="Page Not Found" crumbs={[{ label: '404' }]} />
      <section className="section_gap">
        <div className="container empty-state">
          <h3>Sorry, we couldn’t find that page.</h3>
          <p>It may have been moved, or the link may be broken.</p>
          <Link className="primary-btn" to="/">
            Back to home
          </Link>
        </div>
      </section>
    </>
  )
}
