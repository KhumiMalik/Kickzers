import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import CarouselNav from '../../../components/ui/CarouselNav'
import { useCountdown } from '../../../hooks/useCountdown'
import { pad2 } from '../../../lib/format'
import { formatMoney } from '../../../lib/money'
import { useAddToCart } from '../../cart'

function Countdown({ endsAt }) {
  const { days, hours, minutes, seconds } = useCountdown(endsAt)
  const units = [
    [days, 'Days'],
    [pad2(hours), 'Hours'],
    [pad2(minutes), 'Mins'],
    [pad2(seconds), 'Secs'],
  ]
  return (
    <div className="row clock-wrap">
      {units.map(([value, label]) => (
        <div key={label} className="col clockinner1 clockinner">
          <h1>{value}</h1>
          <span className="smalltext">{label}</span>
        </div>
      ))}
    </div>
  )
}

/** "Exclusive Hot Deal" section: countdown to the promotion's end + product slider. */
export default function ExclusiveDeal({ deal }) {
  const { products } = deal
  const [swiper, setSwiper] = useState(null)
  const { addToCart } = useAddToCart()

  return (
    <section className="exclusive-deal-area">
      <div className="container-fluid">
        <div className="row justify-content-center align-items-center">
          <div className="col-lg-6 no-padding exclusive-left">
            <div className="row clock_sec clockdiv">
              <div className="col-lg-12">
                <h1>{deal.title}</h1>
                <p>Who are in extremely love with eco friendly system.</p>
              </div>
              <div className="col-lg-12">
                <Countdown endsAt={deal.endsAt} />
              </div>
            </div>
            <Link to="/shop" className="primary-btn">
              Shop Now
            </Link>
          </div>
          <div className="col-lg-6 no-padding exclusive-right">
            <div className="active-exclusive-product-slider">
              <Swiper onSwiper={setSwiper} rewind slidesPerView={1}>
                {products.map((p) => (
                  <SwiperSlide key={p.id}>
                    <div className="single-exclusive-slider">
                      <Link to={`/product/${p.slug}`}>
                        <img className="img-fluid" src={p.image} alt={p.name} />
                      </Link>
                      <div className="product-details">
                        <div className="price">
                          <h6>{formatMoney(p.price, p.currency)}</h6>
                          {p.compareAtPrice && (
                            <h6 className="l-through">{formatMoney(p.compareAtPrice, p.currency)}</h6>
                          )}
                        </div>
                        <h4>{p.name}</h4>
                        <div className="add-bag d-flex align-items-center justify-content-center">
                          <button
                            type="button"
                            className="add-btn"
                            aria-label="Add to Bag"
                            onClick={() => addToCart(p)}
                          >
                            <span className="ti-bag"></span>
                          </button>
                          <span className="add-text text-uppercase">Add to Bag</span>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              {products.length > 1 && (
                <CarouselNav swiper={swiper} prevIcon="/img/product/prev.png" nextIcon="/img/product/next.png" />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
