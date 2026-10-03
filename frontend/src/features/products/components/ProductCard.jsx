import { Link } from 'react-router-dom'
import { useToast } from '../../../components/ui/toast/ToastProvider'
import { cx } from '../../../lib/format'
import { formatMoney } from '../../../lib/money'
import { useAddToCart } from '../../cart'
import { useWishlist } from '../../wishlist'
import { useQuickView } from './QuickViewProvider'

function Action({ icon, label, ariaLabel = label, onClick, active }) {
  return (
    <a
      href="#action"
      className={cx('social-info', active && 'is-active')}
      aria-label={ariaLabel}
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
    >
      <span className={icon} aria-hidden="true"></span>
      <p className="hover-text">{label}</p>
    </a>
  )
}

/** Product tile used in every product grid. `product` is a ProductSummary. */
export default function ProductCard({ product }) {
  const { addToCart } = useAddToCart()
  const wishlist = useWishlist()
  const quickView = useQuickView()
  const { notify } = useToast()
  const url = `/product/${product.slug}`

  return (
    <div className="single-product">
      <Link to={url}>
        <img className="img-fluid" src={product.image} alt={product.name} />
      </Link>
      <div className="product-details">
        <h6>
          <Link to={url} className="product-title">
            {product.name}
          </Link>
        </h6>
        <div className="price">
          <h6>{formatMoney(product.price, product.currency)}</h6>
          {product.compareAtPrice && (
            <h6 className="l-through">{formatMoney(product.compareAtPrice, product.currency)}</h6>
          )}
          {product.isComingSoon && <h6 className="coming-soon">Coming soon</h6>}
        </div>
        <div className="prd-bottom">
          <Action icon="ti-bag" label="add to bag" onClick={() => addToCart(product)} />
          <Action
            icon="lnr lnr-heart"
            label="Wishlist"
            ariaLabel={wishlist.has(product.id) ? 'Remove from wishlist' : 'Add to wishlist'}
            active={wishlist.has(product.id)}
            onClick={() => wishlist.toggle(product)}
          />
          <Action
            icon="lnr lnr-sync"
            label="compare"
            onClick={() => notify('Product comparison is coming soon.', 'error')}
          />
          <Action icon="lnr lnr-move" label="view more" onClick={() => quickView.open(product.slug)} />
        </div>
      </div>
    </div>
  )
}
