import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { FieldError } from '../../../components/ui/FormControls'
import { applyServerErrors } from '../../../lib/forms'
import { useApplyCoupon, useRemoveCoupon } from '../queries'
import { couponFormSchema } from '../schemas'

/** Coupon row of the cart table. */
export default function CouponForm({ coupon }) {
  const applyCoupon = useApplyCoupon()
  const removeCoupon = useRemoveCoupon()
  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    formState: { errors },
  } = useForm({ resolver: zodResolver(couponFormSchema), defaultValues: { code: '' } })

  const onSubmit = handleSubmit(({ code }) =>
    applyCoupon.mutateAsync(code).then(
      () => reset(),
      (error) => applyServerErrors(error, setError, ['code']),
    ),
  )

  const close = (e) => {
    e.preventDefault()
    reset()
    clearErrors()
    if (coupon) removeCoupon.mutate()
  }

  return (
    <>
      <form className="cupon_text d-flex align-items-center" noValidate onSubmit={onSubmit}>
        <input type="text" placeholder="Coupon Code" aria-label="Coupon code" {...register('code')} />
        <button type="submit" className="primary-btn" disabled={applyCoupon.isPending}>
          Apply
        </button>
        <a className="gray_btn" href="#close-coupon" onClick={close}>
          Close Coupon
        </a>
      </form>
      <FieldError className="text-right" error={errors.code ?? errors.root?.serverError} />
      {coupon && (
        <div className="coupon-note text-right">
          Coupon {coupon.code} applied ({coupon.description}).
        </div>
      )}
    </>
  )
}
