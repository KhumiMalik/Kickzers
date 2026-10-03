import { Link } from 'react-router-dom'
import { useCart } from '../../context/CartContext'
import { useQuickView } from '../../context/QuickViewContext'
import { useToast } from '../../context/ToastContext'
import { useWishlist } from '../../context/WishlistContext'
import { cx, formatPrice } from '../../utils/format'

function Action({ icon, label, onClick, active }) {
  return (
    <a
      href="#action"
      className={cx('social-info', active && 'is-active')}
      aria-label={label}
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
    >
      <span className={icon}></span>
      <p className="hover-text">{label}</p>
    </a>
  )
}

export default function ProductCard({ product }) {
  const { addItem } = useCart()
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
          <h6>{formatPrice(product.price)}</h6>
          {product.oldPrice && <h6 className="l-through">{formatPrice(product.oldPrice)}</h6>}
          {product.comingSoon && <h6 className="coming-soon">Coming soon</h6>}
        </div>
        <div className="prd-bottom">
          <Action icon="ti-bag" label="add to bag" onClick={() => addItem(product)} />
          <Action icon="lnr lnr-heart" label="Wishlist" active={wishlist.has(product.id)} onClick={() => wishlist.toggle(product)} />
          <Action icon="lnr lnr-sync" label="compare" onClick={() => notify('Product comparison is coming soon.', 'error')} />
          <Action icon="lnr lnr-move" label="view more" onClick={() => quickView.open(product)} />
        </div>
      </div>
    </div>
  )
}
