/**
 * Prev/next arrows rendered with Owl Carousel's markup (.owl-nav > .owl-prev/.owl-next)
 * so the theme's existing positioning rules apply to our Swiper sliders.
 */
export default function CarouselNav({ swiper, prevIcon, nextIcon }) {
  return (
    <div className="owl-nav">
      <div className="owl-prev" role="button" tabIndex={0} aria-label="Previous slide" onClick={() => swiper?.slidePrev()}>
        <img src={prevIcon} alt="" />
      </div>
      <div className="owl-next" role="button" tabIndex={0} aria-label="Next slide" onClick={() => swiper?.slideNext()}>
        <img src={nextIcon} alt="" />
      </div>
    </div>
  )
}
