import { Link } from 'react-router-dom'
import { brandLogos } from '../../../config/site'

export default function BrandArea() {
  return (
    <section className="brand-area section_gap">
      <div className="container">
        <div className="row">
          {brandLogos.map((src) => (
            <Link key={src} className="col single-img" to="/shop">
              <img className="img-fluid d-block mx-auto" src={src} alt="Brand logo" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
