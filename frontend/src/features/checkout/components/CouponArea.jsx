import { useState } from 'react'
import { FieldError } from '../../../components/ui/FormControls'
import { useApplyCoupon, useRemoveCoupon } from '../../cart'

/** "Have a coupon?" box at the top of the checkout. Totals update from the cart response. */
export default function CouponArea({ coupon }) {
  const [open, setOpen] = useState(true)
  const [code, setCode] = useState('')
  const applyCoupon = useApplyCoupon()
  const removeCoupon = useRemoveCoupon()

  const apply = (e) => {
    e.preventDefault()
    applyCoupon.mutate(code, { onSuccess: () => setCode('') })
  }

  return (
    <div className="cupon_area">
      <div className="check_title">
        <h2>
          Have a coupon?{' '}
          <a href="#coupon" onClick={(e) => (e.preventDefault(), setOpen((o) => !o))}>
            Click here to enter your code
          </a>
        </h2>
      </div>
      {open && (
        <form onSubmit={apply}>
          <input
            type="text"
            placeholder="Enter coupon code"
            aria-label="Coupon code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <button type="submit" className="tp_btn" disabled={applyCoupon.isPending}>
            Apply Coupon
          </button>
          <FieldError error={applyCoupon.error && (applyCoupon.error.errors?.code ?? applyCoupon.error.message)} />
        </form>
      )}
      {coupon && (
        <p className="coupon-note">
          Coupon {coupon.code} applied ({coupon.description}).{' '}
          <a href="#remove-coupon" onClick={(e) => (e.preventDefault(), removeCoupon.mutate())}>
            Remove
          </a>
        </p>
      )}
    </div>
  )
}
