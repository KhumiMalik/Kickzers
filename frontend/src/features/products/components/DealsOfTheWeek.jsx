import { Link } from 'react-router-dom'
import { sectionIntro } from '../../../config/site'
import { cx } from '../../../lib/format'
import { formatMoney } from '../../../lib/money'

/** "Deals of the Week" block shared by the home, shop and product pages. */
export default function DealsOfTheWeek({ products, className = 'section_gap' }) {
  if (!products?.length) return null
  const lastRowStart = products.length - (products.length % 3 || 3)

  return (
    <section className={cx('related-product-area', className)}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-lg-6 text-center">
            <div className="section-title">
              <h1>Deals of the Week</h1>
              <p>{sectionIntro}</p>
            </div>
          </div>
        </div>
        <div className="row">
          <div className="col-lg-9">
            <div className="row">
              {products.map((p, i) => (
                <div key={p.id} className={cx('col-lg-4 col-md-4 col-sm-6', i < lastRowStart && 'mb-20')}>
                  <div className="single-related-product d-flex">
                    <Link to={`/product/${p.slug}`}>
                      <img src={p.image} alt={p.name} />
                    </Link>
                    <div className="desc">
                      <Link to={`/product/${p.slug}`} className="title">
                        {p.name}
                      </Link>
                      <div className="price">
                        <h6>{formatMoney(p.price, p.currency)}</h6>
                        {p.compareAtPrice && <h6 className="l-through">{formatMoney(p.compareAtPrice, p.currency)}</h6>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-lg-3">
            <div className="ctg-right">
              <Link to="/shop">
                <img className="img-fluid d-block mx-auto" src="/img/category/c5.jpg" alt="Shop the collection" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
