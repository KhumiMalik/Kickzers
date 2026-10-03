import { Link } from 'react-router-dom'
import QuantityInput from '../../../components/ui/QuantityInput'
import { formatMoney } from '../../../lib/money'
import { useEmptyCart, useRemoveCartItem, useUpdateCartItem } from '../queries'
import CouponForm from './CouponForm'
import ShippingCalculator from './ShippingCalculator'

/** One label/value line of the totals block. */
function TotalsRow({ label, children, className }) {
  return (
    <tr className={className}>
      <td></td>
      <td></td>
      <td>
        <h5>{label}</h5>
      </td>
      <td>{children}</td>
    </tr>
  )
}

/** The cart page table: items, coupon, totals and shipping — all values come from the API. */
export default function CartTable({ cart }) {
  const updateItem = useUpdateCartItem()
  const removeItem = useRemoveCartItem()
  const emptyCart = useEmptyCart()
  const money = (amount) => formatMoney(amount, cart.currency)
  const isEmpty = cart.items.length === 0

  const confirmEmpty = (e) => {
    e.preventDefault()
    if (window.confirm('Remove all items from your cart?')) emptyCart.mutate()
  }

  return (
    <div className="table-responsive">
      <table className="table">
        <thead>
          <tr>
            <th scope="col">Product</th>
            <th scope="col">Price</th>
            <th scope="col">Quantity</th>
            <th scope="col">Total</th>
          </tr>
        </thead>
        <tbody>
          {isEmpty && (
            <tr>
              <td colSpan={4} className="empty-cart">
                <h5>Your cart is currently empty.</h5>
                <Link className="primary-btn" to="/shop">
                  Return to shop
                </Link>
              </td>
            </tr>
          )}
          {cart.items.map((item) => (
            <tr key={item.id}>
              <td>
                <div className="media">
                  <div className="d-flex">
                    <Link to={`/product/${item.product.slug}`}>
                      <img className="cart-thumb" src={item.product.image} alt={item.product.name} />
                    </Link>
                  </div>
                  <div className="media-body">
                    <p>
                      <Link to={`/product/${item.product.slug}`}>{item.product.name}</Link>
                    </p>
                    <button type="button" className="cart-remove" onClick={() => removeItem.mutate(item.id)}>
                      <span className="lnr lnr-cross" aria-hidden="true"></span> Remove
                    </button>
                  </div>
                </div>
              </td>
              <td>
                <h5>{money(item.unitPrice)}</h5>
              </td>
              <td>
                <QuantityInput
                  id={`qty-${item.id}`}
                  value={item.quantity}
                  max={Math.max(1, item.maxQuantity)}
                  onChange={(quantity) =>
                    quantity !== item.quantity && updateItem.mutate({ itemId: item.id, quantity })
                  }
                />
              </td>
              <td>
                <h5>{money(item.lineTotal)}</h5>
              </td>
            </tr>
          ))}
          {!isEmpty && (
            <>
              <tr className="bottom_button">
                <td>
                  <a className="gray_btn" href="#empty-cart" onClick={confirmEmpty}>
                    Empty Cart
                  </a>
                </td>
                <td></td>
                <td></td>
                <td>
                  <CouponForm coupon={cart.coupon} />
                </td>
              </tr>
              <TotalsRow label="Subtotal">
                <h5>{money(cart.totals.subtotal)}</h5>
              </TotalsRow>
              {cart.totals.discount > 0 && (
                <TotalsRow label="Discount">
                  <h5>-{money(cart.totals.discount)}</h5>
                </TotalsRow>
              )}
              <TotalsRow label="Shipping" className="shipping_area">
                <ShippingCalculator cart={cart} />
              </TotalsRow>
              <TotalsRow label="Total">
                <h5>{money(cart.totals.total)}</h5>
              </TotalsRow>
              <tr className="out_button_area">
                <td></td>
                <td></td>
                <td></td>
                <td>
                  <div className="checkout_btn_inner d-flex align-items-center">
                    <Link className="gray_btn" to="/shop">
                      Continue Shopping
                    </Link>
                    <Link className="primary-btn" to="/checkout">
                      Proceed to checkout
                    </Link>
                  </div>
                </td>
              </tr>
            </>
          )}
        </tbody>
      </table>
    </div>
  )
}
