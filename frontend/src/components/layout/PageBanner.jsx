import { Link } from 'react-router-dom'

/** Inner-page breadcrumb banner. `crumbs` excludes "Home", which is always first. */
export default function PageBanner({ title, crumbs = [] }) {
  const trail = [{ label: 'Home', to: '/' }, ...crumbs]
  return (
    <section className="banner-area organic-breadcrumb">
      <div className="container">
        <div className="breadcrumb-banner d-flex flex-wrap align-items-center justify-content-end">
          <div className="col-first">
            <h1>{title}</h1>
            <nav className="d-flex align-items-center" aria-label="Breadcrumb">
              {trail.map((crumb, i) => (
                <Link key={crumb.label} to={crumb.to ?? '#'}>
                  {crumb.label}
                  {i < trail.length - 1 && <span className="lnr lnr-arrow-right"></span>}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  )
}
