import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { useCart } from '../../context/CartContext'
import CarouselNav from '../common/CarouselNav'

export default function HeroBanner({ slides }) {
  const [swiper, setSwiper] = useState(null)
  const { addItem } = useCart()

  return (
    <section className="banner-area">
      <div className="container">
        {/* The template's JS sized .fullscreen to the window height; the theme caps it at 650px on mobile. */}
        <div className="row fullscreen align-items-center justify-content-start" style={{ height: '100vh' }}>
          <div className="col-lg-12">
            <div className="active-banner-slider">
              <Swiper onSwiper={setSwiper} rewind slidesPerView={1} spaceBetween={30}>
                {slides.map((slide) => (
                  <SwiperSlide key={slide.id}>
                    <div className="row single-slide align-items-center d-flex">
                      <div className="col-lg-5 col-md-6">
                        <div className="banner-content">
                          <h1>
                            {slide.title[0]} <br />
                            {slide.title[1]}
                          </h1>
                          <p>{slide.text}</p>
                          <div className="add-bag d-flex align-items-center">
                            <button type="button" className="add-btn" aria-label="Add to Bag" onClick={() => addItem(slide.product)}>
                              <span className="lnr lnr-cross"></span>
                            </button>
                            <span className="add-text text-uppercase">Add to Bag</span>
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-7">
                        <div className="banner-img">
                          <img className="img-fluid" src={slide.image} alt={slide.product?.name ?? ''} />
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
              <CarouselNav swiper={swiper} prevIcon="/img/banner/prev.png" nextIcon="/img/banner/next.png" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
