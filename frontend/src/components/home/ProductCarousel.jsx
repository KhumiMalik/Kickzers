import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { sectionIntro } from '../../data/site'
import CarouselNav from '../common/CarouselNav'
import ProductCard from '../product/ProductCard'

/** Home "Latest Products / Coming Products" slider; each slide is a titled grid. */
export default function ProductCarousel({ slides }) {
  const [swiper, setSwiper] = useState(null)
  const visible = slides.filter((s) => s.products.length)

  return (
    <section className="active-product-area section_gap">
      <Swiper onSwiper={setSwiper} rewind slidesPerView={1} autoHeight>
        {visible.map((slide) => (
          <SwiperSlide key={slide.title}>
            <div className="single-product-slider">
              <div className="container">
                <div className="row justify-content-center">
                  <div className="col-lg-6 text-center">
                    <div className="section-title">
                      <h1>{slide.title}</h1>
                      <p>{sectionIntro}</p>
                    </div>
                  </div>
                </div>
                <div className="row">
                  {slide.products.map((product) => (
                    <div key={product.id} className="col-lg-3 col-md-6">
                      <ProductCard product={product} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {visible.length > 1 && <CarouselNav swiper={swiper} prevIcon="/img/product/prev.png" nextIcon="/img/product/next.png" />}
    </section>
  )
}
