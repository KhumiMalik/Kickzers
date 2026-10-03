import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import ErrorState from '../../../components/ui/ErrorState'
import Loader from '../../../components/ui/Loader'
import Modal from '../../../components/ui/Modal'
import QuantityInput from '../../../components/ui/QuantityInput'
import { cx } from '../../../lib/format'
import { formatMoney } from '../../../lib/money'
import { useAddToCart } from '../../cart'
import { useWishlist } from '../../wishlist'
import { useProduct } from '../queries'

function QuickViewContent({ product, onClose }) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart, isPending } = useAddToCart()
  const wishlist = useWishlist()

  return (
    <div className="row align-items-center">
      <div className="col-lg-6">
        <Swiper className="quick-view-carousel" modules={[Pagination]} pagination={{ clickable: true }} rewind>
          {product.gallery.map((src, i) => (
            <SwiperSlide key={i}>
              <div className="item" style={{ backgroundImage: `url(${src})` }}></div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      <div className="col-lg-6">
        <div className="quick-view-content">
          <div className="top">
            <h3 className="head" id="quick-view-title">
              {product.name}
            </h3>
            <div className="price d-flex align-items-center">
              <span className="lnr lnr-tag" aria-hidden="true"></span>{' '}
              <span className="ml-10">{formatMoney(product.price, product.currency)}</span>
            </div>
            <div className="category">
              Category: <span>{product.category.name}</span>
            </div>
            <div className="available">
              Availibility:{' '}
              <span>{product.isInStock ? 'In Stock' : product.isComingSoon ? 'Coming Soon' : 'Out of Stock'}</span>
            </div>
          </div>
          <div className="middle">
            <p className="content">{product.shortDescription}</p>
            <Link to={`/product/${product.slug}`} className="view-full" onClick={onClose}>
              View full Details <span className="lnr lnr-arrow-right" aria-hidden="true"></span>
            </Link>
          </div>
          <div className="bottom">
            <QuantityInput
              variant="arrows"
              label="Quantity:"
              value={quantity}
              max={Math.max(1, product.maxQuantity)}
              onChange={setQuantity}
            />
            <div className="d-flex mt-20">
              <button
                type="button"
                className="view-btn color-2"
                disabled={isPending}
                onClick={() => addToCart(product, quantity, { onSuccess: onClose })}
              >
                <span>Add to Cart</span>
              </button>
              <button
                type="button"
                className={cx('like-btn', wishlist.has(product.id) && 'is-active')}
                aria-label="Wishlist"
                aria-pressed={wishlist.has(product.id)}
                onClick={() => wishlist.toggle(product)}
              >
                <span className="lnr lnr-heart" aria-hidden="true"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** "view more" quick view; loads the product detail (shared cache with the product page). */
export default function QuickViewModal({ slug, onClose }) {
  const { data: product, isPending, isError, refetch } = useProduct(slug)

  return (
    <Modal onClose={onClose} dialogClassName="quick-view-dialog" labelledBy="quick-view-title">
      <div className="container relative">
        <button type="button" className="close" aria-label="Close" onClick={onClose}>
          <span aria-hidden="true">&times;</span>
        </button>
        <div className="product-quick-view">
          {isPending && <Loader />}
          {isError && <ErrorState message="This product could not be loaded." onRetry={refetch} />}
          {product && <QuickViewContent product={product} onClose={onClose} />}
        </div>
      </div>
    </Modal>
  )
}
