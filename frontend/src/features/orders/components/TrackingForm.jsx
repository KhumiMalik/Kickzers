import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { FormAlert, TextField } from '../../../components/ui/FormControls'
import { formatShortDate } from '../../../lib/dates'
import { applyServerErrors } from '../../../lib/forms'
import { formatMoney } from '../../../lib/money'
import { useTrackOrder } from '../queries'
import { trackingFormSchema } from '../schemas'

const FIELDS = ['orderNumber', 'email']

function TrackingResult({ order }) {
  return (
    <div className="tracking-result">
      <h4>
        Order #{order.number} — <span>{order.statusLabel}</span>
      </h4>
      <ul className="list">
        <li>Placed on {formatShortDate(order.placedAt)}</li>
        <li>
          {order.itemCount} item(s), total {formatMoney(order.totals.total, order.currency)}
        </li>
        <li>Shipping: {order.shippingMethod.name}</li>
      </ul>
      <Link to={`/confirmation?order=${encodeURIComponent(order.number)}`}>View order details</Link>
    </div>
  )
}

/** Order tracking by order number + billing email (works for guests). */
export default function TrackingForm() {
  const trackOrder = useTrackOrder()
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(trackingFormSchema), defaultValues: { orderNumber: '', email: '' } })

  const onSubmit = handleSubmit((values) =>
    trackOrder.mutateAsync(values).catch((error) => applyServerErrors(error, setError, FIELDS)),
  )

  return (
    <>
      <form className="row tracking_form" noValidate onSubmit={onSubmit}>
        <TextField
          wrapperClassName="col-md-12 form-group"
          type="text"
          placeholder="Order ID"
          error={errors.orderNumber}
          {...register('orderNumber')}
        />
        <TextField
          wrapperClassName="col-md-12 form-group"
          type="email"
          placeholder="Billing Email Address"
          error={errors.email}
          {...register('email')}
        />
        <div className="col-md-12 form-group">
          <FormAlert error={errors.root?.serverError} />
          <button type="submit" className="primary-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Tracking…' : 'Track Order'}
          </button>
        </div>
      </form>
      {trackOrder.data && !trackOrder.isError && <TrackingResult order={trackOrder.data} />}
    </>
  )
}
