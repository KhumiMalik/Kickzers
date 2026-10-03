import { useState } from 'react'
import { Link } from 'react-router-dom'
import NiceSelect from '../components/common/NiceSelect'
import QuantityInput from '../components/common/QuantityInput'
import PageBanner from '../components/layout/PageBanner'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { countries, shippingMethods } from '../data/site'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { cx, formatPrice } from '../utils/format'

const countryOptions = countries.map((c) => ({ value: c.value, label: c.label }))

function CouponForm() {
  const cart = useCart()
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState(false)

  const apply = async (e) => {
    e.preventDefault()
    if (!code.trim()) return setError('Please enter a coupon code.')
    setBusy(true)
    try {
      await cart.applyCoupon(code)
      setError(null)
      setCode('')
    } catch (err) {
      setError(err.errors?.code?.[0] ?? err.message)
    } finally {
      setBusy(false)
    }
  }

  const close = (e) => {
    e.preventDefault()
    cart.removeCoupon()
    setCode('')
    setError(null)
  }

  return (
    <>
      <form className="cupon_text d-flex align-items-center" onSubmit={apply}>
        <input type="text" placeholder="Coupon Code" aria-label="Coupon code" value={code} onChange={(e) => setCode(e.target.value)} />
        <button type="submit" className="primary-btn" disabled={busy}>
          Apply
        </button>
        <a className="gray_btn" href="#close-coupon" onClick={close}>
          Close Coupon
        </a>
      </form>
      {error && <div className="field-error text-right">{error}</div>}
      {cart.coupon && <div className="coupon-note text-right">Coupon {cart.coupon.code} applied ({cart.coupon.label}).</div>}
    </>
  )
}

function ShippingCalculator() {
  const cart = useCart()
  const { notify } = useToast()
  const [destination, setDestination] = useState(cart.destination)
  const states = countries.find((c) => c.value === destination.country)?.states ?? []

  const save = (e) => {
    e.preventDefault()
    cart.setDestination(destination)
    notify('Shipping details updated.')
  }

  return (
    <div className="shipping_box">
      <ul className="list">
        {shippingMethods.map((m) => (
          <li key={m.id} className={cx(cart.shipping.id === m.id && 'active')}>
            <a
              href={`#${m.id}`}
              onClick={(e) => {
                e.preventDefault()
                cart.setShipping(m.id)
              }}
            >
              {m.label}
            </a>
          </li>
        ))}
      </ul>
      <h6>
        Calculate Shipping <i className="fa fa-caret-down" aria-hidden="true"></i>
      </h6>
      <NiceSelect
        className="shipping_select"
        placeholder="Select a Country"
        value={destination.country}
        options={countryOptions}
        onChange={(country) => setDestination({ ...destination, country, state: '' })}
      />
      <NiceSelect
        className="shipping_select"
        placeholder="Select a State"
        value={destination.state}
        options={states.map((s) => ({ value: s, label: s }))}
        onChange={(state) => setDestination({ ...destination, state })}
        disabled={!states.length}
      />
      <input
        type="text"
        placeholder="Postcode/Zipcode"
        aria-label="Postcode"
        value={destination.zip}
        onChange={(e) => setDestination({ ...destination, zip: e.target.value })}
      />
      <a className="gray_btn" href="#update-shipping" onClick={save}>
        Update Details
      </a>
    </div>
  )
}

export default function Cart() {
  useDocumentTitle('Shopping Cart')
  const cart = useCart()
  const empty = cart.items.length === 0

  const emptyCart = (e) => {
    e.preventDefault()
    if (window.confirm('Remove all items from your cart?')) cart.clearCart()
  }

  return (
    <>
      <PageBanner title="Shopping Cart" crumbs={[{ label: 'Cart', to: '/cart' }]} />
      <section className="cart_area">
        <div className="container">
          <div className="cart_inner">
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
                  {empty && (
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
                            <Link to={`/product/${item.slug}`}>
                              <img className="cart-thumb" src={item.image} alt={item.name} />
                            </Link>
                          </div>
                          <div className="media-body">
                            <p>
                              <Link to={`/product/${item.slug}`}>{item.name}</Link>
                            </p>
                            <button type="button" className="cart-remove" onClick={() => cart.removeItem(item.id)}>
                              <span className="lnr lnr-cross"></span> Remove
                            </button>
                          </div>
                        </div>
                      </td>
                      <td>
                        <h5>{formatPrice(item.price)}</h5>
                      </td>
                      <td>
                        <QuantityInput id={`qty-${item.id}`} value={item.qty} onChange={(qty) => cart.updateQty(item.id, qty)} />
                      </td>
                      <td>
                        <h5>{formatPrice(item.price * item.qty)}</h5>
                      </td>
                    </tr>
                  ))}
                  {!empty && (
                    <>
                      <tr className="bottom_button">
                        <td>
                          <a className="gray_btn" href="#empty-cart" onClick={emptyCart}>
                            Empty Cart
                          </a>
                        </td>
                        <td></td>
                        <td></td>
                        <td>
                          <CouponForm />
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td></td>
                        <td>
                          <h5>Subtotal</h5>
                        </td>
                        <td>
                          <h5>{formatPrice(cart.subtotal)}</h5>
                        </td>
                      </tr>
                      {cart.discount > 0 && (
                        <tr>
                          <td></td>
                          <td></td>
                          <td>
                            <h5>Discount</h5>
                          </td>
                          <td>
                            <h5>-{formatPrice(cart.discount)}</h5>
                          </td>
                        </tr>
                      )}
                      <tr className="shipping_area">
                        <td></td>
                        <td></td>
                        <td>
                          <h5>Shipping</h5>
                        </td>
                        <td>
                          <ShippingCalculator />
                        </td>
                      </tr>
                      <tr>
                        <td></td>
                        <td></td>
                        <td>
                          <h5>Total</h5>
                        </td>
                        <td>
                          <h5>{formatPrice(cart.total)}</h5>
                        </td>
                      </tr>
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
          </div>
        </div>
      </section>
    </>
  )
}
