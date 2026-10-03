import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { getProduct, getRelatedProducts } from '../api/products'
import Loader from '../components/common/Loader'
import QuantityInput from '../components/common/QuantityInput'
import PageBanner from '../components/layout/PageBanner'
import DealsOfTheWeek from '../components/product/DealsOfTheWeek'
import ProductTabs from '../components/product/ProductTabs'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useWishlist } from '../context/WishlistContext'
import { categoryNames } from '../data/catalog'
import { useAsync } from '../hooks/useAsync'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cx, formatPrice } from '../utils/format'
import NotFound from './NotFound'

function Gallery({ images }) {
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
          {images.map((_, i) => (
            <div
              key={i}
              className={cx('owl-dot', i === index && 'active')}
              role="button"
              aria-label={`Show image ${i + 1}`}
              onClick={() => swiper?.slideTo(i)}
            ></div>
          ))}
        </div>
      )}
    </div>
  )
}

function ProductSummary({ product }) {
  const [qty, setQty] = useState(1)
  const { addItem } = useCart()
  const wishlist = useWishlist()
  const { notify } = useToast()

  return (
    <div className="s_product_text">
      <h3>{product.name}</h3>
      <h2>{formatPrice(product.price)}</h2>
      <ul className="list">
        <li>
          <span className="active">
            <span>Category</span> : {categoryNames[product.category]}
          </span>
        </li>
        <li>
          <span>
            <span>Availibility</span> : {product.inStock ? 'In Stock' : 'Coming Soon'}
          </span>
        </li>
      </ul>
      <p>{product.shortDescription}</p>
      <QuantityInput label="Quantity:" value={qty} onChange={setQty} />
      <div className="card_area d-flex align-items-center">
        <button type="button" className="primary-btn" disabled={!product.inStock} onClick={() => addItem(product, qty)}>
          {product.inStock ? 'Add to Cart' : 'Coming Soon'}
        </button>
        <button type="button" className="icon_btn" aria-label="Compare" onClick={() => notify('Product comparison is coming soon.', 'error')}>
          <i className="lnr lnr-diamond"></i>
        </button>
        <button
          type="button"
          className={cx('icon_btn', wishlist.has(product.id) && 'is-active')}
          aria-label="Wishlist"
          onClick={() => wishlist.toggle(product)}
        >
          <i className="lnr lnr-heart"></i>
        </button>
      </div>
    </div>
  )
}

export default function ProductDetail() {
  const { slug } = useParams()
  const { data: product, error } = useAsync(() => getProduct(slug), [slug])
  const related = useAsync(() => getRelatedProducts(slug), [slug])
  useDocumentTitle(product?.name ?? 'Product Details')

  if (error?.status === 404) return <NotFound />

  return (
    <>
      <PageBanner title="Product Details Page" crumbs={[{ label: 'Shop', to: '/shop' }, { label: product?.name ?? 'product-details' }]} />
      {!product || product.slug !== slug ? (
        <Loader />
      ) : (
        <>
          <div className="product_image_area">
            <div className="container">
              <div className="row s_product_inner">
                <div className="col-lg-6">
                  <Gallery key={product.id} images={product.gallery} />
                </div>
                <div className="col-lg-5 offset-lg-1">
                  <ProductSummary key={product.id} product={product} />
                </div>
              </div>
            </div>
          </div>
          <ProductTabs key={product.id} product={product} />
        </>
      )}
      <DealsOfTheWeek products={related.data} className="section_gap_bottom" />
    </>
  )
}
