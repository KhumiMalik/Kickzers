import { useState } from 'react'
import QuantityInput from '../../../components/ui/QuantityInput'
import { useToast } from '../../../components/ui/toast/ToastProvider'
import { cx } from '../../../lib/format'
import { formatMoney } from '../../../lib/money'
import { useAddToCart } from '../../cart'
import { useWishlist } from '../../wishlist'

/** Name, price, availability, quantity and "Add to Cart" block of the product page. */
export default function ProductOverview({ product }) {
  const [quantity, setQuantity] = useState(1)
  const { addToCart, isPending } = useAddToCart()
  const wishlist = useWishlist()
  const { notify } = useToast()

  return (
    <div className="s_product_text">
      <h3>{product.name}</h3>
      <h2>{formatMoney(product.price, product.currency)}</h2>
      <ul className="list">
        <li>
          <span className="active">
            <span>Category</span> : {product.category.name}
          </span>
        </li>
        <li>
          <span>
            <span>Availibility</span> :{' '}
            {product.isInStock ? 'In Stock' : product.isComingSoon ? 'Coming Soon' : 'Out of Stock'}
          </span>
        </li>
      </ul>
      <p>{product.shortDescription}</p>
      <QuantityInput label="Quantity:" value={quantity} max={Math.max(1, product.maxQuantity)} onChange={setQuantity} />
      <div className="card_area d-flex align-items-center">
        <button
          type="button"
          className="primary-btn"
          disabled={!product.isInStock || isPending}
          onClick={() => addToCart(product, quantity)}
        >
          {product.isInStock ? 'Add to Cart' : product.isComingSoon ? 'Coming Soon' : 'Out of Stock'}
        </button>
        <button
          type="button"
          className="icon_btn"
          aria-label="Compare"
          onClick={() => notify('Product comparison is coming soon.', 'error')}
        >
          <i className="lnr lnr-diamond" aria-hidden="true"></i>
        </button>
        <button
          type="button"
          className={cx('icon_btn', wishlist.has(product.id) && 'is-active')}
          aria-label="Wishlist"
          aria-pressed={wishlist.has(product.id)}
          onClick={() => wishlist.toggle(product)}
        >
          <i className="lnr lnr-heart" aria-hidden="true"></i>
        </button>
      </div>
    </div>
  )
}
