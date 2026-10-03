import { useState } from 'react'
import { Link } from 'react-router-dom'
import { trackOrder } from '../api/checkout'
import { FormAlert, TextField } from '../components/common/FormControls'
import PageBanner from '../components/layout/PageBanner'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { useForm } from '../hooks/useForm'
import { formatPrice, formatShortDate } from '../utils/format'
import { email, required } from '../utils/validation'

export default function Tracking() {
  useDocumentTitle('Order Tracking')
  const [order, setOrder] = useState(null)
  const form = useForm({ orderId: '', email: '' }, { orderId: [required('Order ID')], email: [required('Billing email'), email()] })

  const onSubmit = form.submit(async (values) => {
    setOrder(null)
    setOrder(await trackOrder(values))
  })

  return (
    <>
      <PageBanner title="Order Tracking" crumbs={[{ label: 'Order Tracking', to: '/tracking' }]} />
      <section className="tracking_box_area section_gap">
        <div className="container">
          <div className="tracking_box_inner">
            <p>
              To track your order please enter your Order ID in the box below and press the &quot;Track&quot; button. This was given to you on
              your receipt and in the confirmation email you should have received.
            </p>
            <form className="row tracking_form" noValidate onSubmit={onSubmit}>
              <TextField wrapperClassName="col-md-12 form-group" type="text" placeholder="Order ID" error={form.errors.orderId} {...form.field('orderId')} />
              <TextField wrapperClassName="col-md-12 form-group" type="email" placeholder="Billing Email Address" error={form.errors.email} {...form.field('email')} />
              <div className="col-md-12 form-group">
                <FormAlert error={form.errors.form} />
                <button type="submit" className="primary-btn" disabled={form.submitting}>
                  {form.submitting ? 'Tracking…' : 'Track Order'}
                </button>
              </div>
            </form>
            {order && (
              <div className="tracking-result">
                <h4>
                  Order #{order.id} — <span>{order.status}</span>
                </h4>
                <ul className="list">
                  <li>Placed on {formatShortDate(order.createdAt)}</li>
                  <li>
                    {order.items.length} item(s), total {formatPrice(order.total)}
                  </li>
                  <li>Shipping: {order.shippingMethod.label}</li>
                </ul>
                <Link to={`/confirmation?order=${order.id}`}>View order details</Link>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
