import { useFormContext, useWatch } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { FieldError, FormAlert } from '../../../components/ui/FormControls'
import { cx, pad2 } from '../../../lib/format'
import { formatMoney } from '../../../lib/money'
import { shippingLabel } from '../../cart'

/**
 * "Your Order" box: items and totals exactly as the cart API returned them,
 * payment choice, terms and the submit button (linked to the form by id).
 */
export default function OrderReview({ cart, paymentMethods, formId }) {
  const {
    register,
    control,
    formState: { errors, isSubmitting },
  } = useFormContext()
  const selectedPayment = useWatch({ control, name: 'paymentMethod' })
  const money = (amount) => formatMoney(amount, cart.currency)
  const shipping = cart.shippingMethods.find((m) => m.code === cart.shippingMethod)
  const hasFieldErrors = Object.keys(errors).some((key) => key !== 'root')

  return (
    <div className="order_box">
      <h2>Your Order</h2>
      <ul className="list">
        <li>
          <span>
            Product <span>Total</span>
          </span>
        </li>
        {cart.items.map((item) => (
          <li key={item.id}>
            <span>
              {item.product.name} <span className="middle">x {pad2(item.quantity)}</span>{' '}
              <span className="last">{money(item.lineTotal)}</span>
            </span>
          </li>
        ))}
      </ul>
      <ul className="list list_2">
        <li>
          <span>
            Subtotal <span>{money(cart.totals.subtotal)}</span>
          </span>
        </li>
        {cart.totals.discount > 0 && (
          <li>
            <span>
              Discount <span>-{money(cart.totals.discount)}</span>
            </span>
          </li>
        )}
        <li>
          <Link to="/cart">
            Shipping <span>{shipping ? shippingLabel(shipping, cart.currency) : '—'}</span>
          </Link>
        </li>
        <li>
          <span>
            Total <span>{money(cart.totals.total)}</span>
          </span>
        </li>
      </ul>
      {paymentMethods.map((method) => (
        <div key={method.code} className={cx('payment_item', selectedPayment === method.code && 'active')}>
          <div className="radion_btn">
            <input type="radio" id={`pay-${method.code}`} value={method.code} {...register('paymentMethod')} />{' '}
            <label htmlFor={`pay-${method.code}`}>{method.name}</label>
            {method.image && <img src={method.image} alt="" />}
            <div className="check"></div>
          </div>
          {selectedPayment === method.code && <p>{method.description}</p>}
        </div>
      ))}
      <FieldError error={errors.paymentMethod} />
      <div className="creat_account">
        <input type="checkbox" id="accept-terms" {...register('acceptTerms')} />{' '}
        <label htmlFor="accept-terms">I’ve read and accept the </label> <a href="#terms">terms &amp; conditions*</a>
        <FieldError error={errors.acceptTerms} />
      </div>
      <FormAlert error={errors.root?.serverError ?? (hasFieldErrors ? 'Please fix the highlighted fields.' : null)} />
      <button type="submit" form={formId} className="primary-btn" disabled={isSubmitting}>
        {isSubmitting ? 'Placing order…' : 'Place Order'}
      </button>
    </div>
  )
}
