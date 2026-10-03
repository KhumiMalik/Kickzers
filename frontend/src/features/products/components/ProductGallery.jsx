import { useState } from 'react'
import { Swiper, SwiperSlide } from 'swiper/react'
import { cx } from '../../../lib/format'

/** Product page image slider with the template's vertical dots. */
export default function ProductGallery({ images }) {
  const [swiper, setSwiper] = useState(null)
  const [index, setIndex] = useState(0)

  return (
    <div className="s_Product_carousel">
      <Swiper onSwiper={setSwiper} onSlideChange={(s) => setIndex(s.realIndex)} rewind>
        {images.map((src, i) => (
          <SwiperSlide key={i}>
            <div className="single-prd-item">
              <img className="img-fluid" src={src} alt="" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      {images.length > 1 && (
        <div className="owl-dots">
          {/* The theme styles `.owl-dots div`, so these stay divs with button semantics. */}
          {images.map((_, i) => (
            <div
              key={i}
              className={cx('owl-dot', i === index && 'active')}
              role="button"
              tabIndex={0}
              aria-label={`Show image ${i + 1}`}
              aria-pressed={i === index}
              onClick={() => swiper?.slideTo(i)}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && (e.preventDefault(), swiper?.slideTo(i))}
            ></div>
          ))}
        </div>
      )}
    </div>
  )
}
