import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/react'
import { categoryNames } from '../../data/catalog'
import { useCart } from '../../context/CartContext'
import { useWishlist } from '../../context/WishlistContext'
import { cx, formatPrice } from '../../utils/format'
import Modal from '../common/Modal'
import QuantityInput from '../common/QuantityInput'

/** "view more" quick view — the template shipped this modal markup on the category page but never opened it. */
export default function QuickViewModal({ product, onClose }) {
  const [qty, setQty] = useState(1)
  const { addItem } = useCart()
  const wishlist = useWishlist()

  return (
    <Modal onClose={onClose} dialogClassName="quick-view-dialog" labelledBy="quick-view-title">
      <div className="container relative">
        <button type="button" className="close" aria-label="Close" onClick={onClose}>
          <span aria-hidden="true">&times;</span>
        </button>
        <div className="product-quick-view">
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
                    <span className="lnr lnr-tag"></span> <span className="ml-10">{formatPrice(product.price)}</span>
                  </div>
                  <div className="category">
                    Category: <span>{categoryNames[product.category]}</span>
                  </div>
                  <div className="available">
                    Availibility: <span>{product.inStock ? 'In Stock' : 'Coming Soon'}</span>
                  </div>
                </div>
                <div className="middle">
                  <p className="content">{product.shortDescription}</p>
                  <Link to={`/product/${product.slug}`} className="view-full" onClick={onClose}>
                    View full Details <span className="lnr lnr-arrow-right"></span>
                  </Link>
                </div>
                <div className="bottom">
                  <QuantityInput variant="arrows" label="Quantity:" value={qty} onChange={setQty} />
                  <div className="d-flex mt-20">
                    <button
                      type="button"
                      className="view-btn color-2"
                      onClick={() => {
                        addItem(product, qty)
                        if (product.inStock) onClose()
                      }}
                    >
                      <span>Add to Cart</span>
                    </button>
                    <button
                      type="button"
                      className={cx('like-btn', wishlist.has(product.id) && 'is-active')}
                      aria-label="Wishlist"
                      onClick={() => wishlist.toggle(product)}
                    >
                      <span className="lnr lnr-heart"></span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  )
}
