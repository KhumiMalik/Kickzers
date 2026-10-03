import { Link } from 'react-router-dom'
import ErrorState from '../../../components/ui/ErrorState'
import Loader from '../../../components/ui/Loader'
import { formatShortDate } from '../../../lib/dates'
import { pad2 } from '../../../lib/format'
import { formatDecimal, formatMoney } from '../../../lib/money'
import { useOrder } from '../queries'

function DetailsList({ title, rows }) {
  return (
    <div className="col-lg-4">
      <div className="details_item">
        <h4>{title}</h4>
        <ul className="list">
          {rows.map(([label, value]) => (
            <li key={label}>
              <span>
                <span>{label}</span> : {value || '—'}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const addressRows = (address) => [
  ['Street', [address.addressLine1, address.addressLine2].filter(Boolean).join(', ')],
  ['City', address.city],
  ['Country', address.countryName],
  ['Postcode', address.postcode],
]

function TotalsRow({ label, value }) {
  return (
    <tr>
      <td>
        <h4>{label}</h4>
      </td>
      <td></td>
      <td>
        <p>{value}</p>
      </td>
    </tr>
  )
}

function OrderDetails({ order }) {
  const money = (amount) => formatMoney(amount, order.currency)
  return (
    <>
      <h3 className="title_confirmation">Thank you. Your order has been received.</h3>
      <div className="row order_d_inner">
        <DetailsList
          title="Order Info"
          rows={[
            ['Order number', order.number],
            ['Date', formatShortDate(order.placedAt)],
            ['Total', `${order.currency} ${formatDecimal(order.totals.total)}`],
            ['Payment method', order.paymentMethod.name],
          ]}
        />
        <DetailsList title="Billing Address" rows={addressRows(order.billingAddress)} />
        <DetailsList title="Shipping Address" rows={addressRows(order.shippingAddress)} />
      </div>
      <div className="order_details_table">
        <h2>Order Details</h2>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th scope="col">Product</th>
                <th scope="col">Quantity</th>
                <th scope="col">Total</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={`${item.productSlug}-${item.name}`}>
                  <td>
                    <p>{item.name}</p>
                  </td>
                  <td>
                    <h5>x {pad2(item.quantity)}</h5>
                  </td>
                  <td>
                    <p>{money(item.lineTotal)}</p>
                  </td>
                </tr>
              ))}
              <TotalsRow label="Subtotal" value={money(order.totals.subtotal)} />
              {order.totals.discount > 0 && (
                <TotalsRow label={`Discount (${order.couponCode})`} value={`-${money(order.totals.discount)}`} />
              )}
              <TotalsRow
                label="Shipping"
                value={
                  order.shippingMethod.price > 0
                    ? `${order.shippingMethod.name}: ${money(order.shippingMethod.price)}`
                    : order.shippingMethod.name
                }
              />
              <TotalsRow label="Total" value={money(order.totals.total)} />
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

/** Confirmation page content for order `number` (owner or the session that placed it). */
export default function OrderConfirmation({ number }) {
  const { data: order, isPending, isError, error, refetch } = useOrder(number)

  if (!number) {
    return (
      <div className="empty-state">
        <h3 className="title_confirmation">No order to show yet.</h3>
        <Link className="primary-btn" to="/shop">
          Continue shopping
        </Link>
      </div>
    )
  }
  if (isPending) return <Loader />
  if (isError && (error.status === 403 || error.status === 404)) {
    return (
      <div className="empty-state">
        <h3 className="title_confirmation">We could not show that order here.</h3>
        <p>You can check its status with your order number and billing email.</p>
        <Link className="primary-btn" to="/tracking">
          Track your order
        </Link>
      </div>
    )
  }
  if (isError) return <ErrorState message="Your order could not be loaded." onRetry={refetch} />
  return <OrderDetails order={order} />
}
