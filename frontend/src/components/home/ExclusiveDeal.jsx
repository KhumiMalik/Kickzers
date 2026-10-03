import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useCart } from '../../context/CartContext'
import { exclusiveDealEndsAt } from '../../data/site'
import { useCountdown } from '../../hooks/useCountdown'
import { formatPrice, pad2 } from '../../utils/format'
import CarouselNav from '../common/CarouselNav'

function Countdown() {
  const { days, hours, minutes, seconds } = useCountdown(exclusiveDealEndsAt)
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

export default function ExclusiveDeal({ products }) {
  const [swiper, setSwiper] = useState(null)
  const { addItem } = useCart()

  return (
    <section className="exclusive-deal-area">
      <div className="container-fluid">
        <div className="row justify-content-center align-items-center">
          <div className="col-lg-6 no-padding exclusive-left">
            <div className="row clock_sec clockdiv">
              <div className="col-lg-12">
                <h1>Exclusive Hot Deal Ends Soon!</h1>
                <p>Who are in extremely love with eco friendly system.</p>
              </div>
              <div className="col-lg-12">
                <Countdown />
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
                          <h6>{formatPrice(p.price)}</h6>
                          {p.oldPrice && <h6 className="l-through">{formatPrice(p.oldPrice)}</h6>}
                        </div>
                        <h4>{p.name}</h4>
                        <div className="add-bag d-flex align-items-center justify-content-center">
                          <button type="button" className="add-btn" aria-label="Add to Bag" onClick={() => addItem(p)}>
                            <span className="ti-bag"></span>
                          </button>
                          <span className="add-text text-uppercase">Add to Bag</span>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              {products.length > 1 && <CarouselNav swiper={swiper} prevIcon="/img/product/prev.png" nextIcon="/img/product/next.png" />}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
