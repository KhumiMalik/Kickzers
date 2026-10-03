import { Link, useSearchParams } from 'react-router-dom'
import { getOrder } from '../api/checkout'
import Loader from '../components/common/Loader'
import PageBanner from '../components/layout/PageBanner'
import { useAsync } from '../hooks/useAsync'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatPrice, formatShortDate, pad2 } from '../utils/format'

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

const addressRows = (a) => [
  ['Street', [a.address1, a.address2].filter(Boolean).join(', ')],
  ['City', a.city],
  ['Country', a.country],
  ['Postcode', a.zip],
]

export default function Confirmation() {
  useDocumentTitle('Confirmation')
  const [params] = useSearchParams()
  const orderId = params.get('order')
  const { data: order, error, loading } = useAsync(() => (orderId ? getOrder(orderId) : Promise.resolve(null)), [orderId])

  return (
    <>
      <PageBanner title="Confirmation" crumbs={[{ label: 'Confirmation', to: '/confirmation' }]} />
      <section className="order_details section_gap">
        <div className="container">
          {loading && <Loader />}
          {!loading && !order && (
            <div className="empty-state">
              <h3 className="title_confirmation">{error ? 'We could not find that order.' : 'No order to show yet.'}</h3>
              <Link className="primary-btn" to="/shop">
                Continue shopping
              </Link>
            </div>
          )}
          {order && (
            <>
              <h3 className="title_confirmation">Thank you. Your order has been received.</h3>
              <div className="row order_d_inner">
                <DetailsList
                  title="Order Info"
                  rows={[
                    ['Order number', order.id],
                    ['Date', formatShortDate(order.createdAt)],
                    ['Total', `USD ${order.total.toFixed(2)}`],
                    ['Payment method', order.payment],
                  ]}
                />
                <DetailsList title="Billing Address" rows={addressRows(order.billing)} />
                <DetailsList title="Shipping Address" rows={addressRows(order.shipping)} />
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
                        <tr key={item.id}>
                          <td>
                            <p>{item.name}</p>
                          </td>
                          <td>
                            <h5>x {pad2(item.qty)}</h5>
                          </td>
                          <td>
                            <p>{formatPrice(item.total)}</p>
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td>
                          <h4>Subtotal</h4>
                        </td>
                        <td>
                          <h5></h5>
                        </td>
                        <td>
                          <p>{formatPrice(order.subtotal)}</p>
                        </td>
                      </tr>
                      {order.discount > 0 && (
                        <tr>
                          <td>
                            <h4>Discount ({order.coupon})</h4>
                          </td>
                          <td>
                            <h5></h5>
                          </td>
                          <td>
                            <p>-{formatPrice(order.discount)}</p>
                          </td>
                        </tr>
                      )}
                      <tr>
                        <td>
                          <h4>Shipping</h4>
                        </td>
                        <td>
                          <h5></h5>
                        </td>
                        <td>
                          <p>{order.shippingMethod.label}</p>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <h4>Total</h4>
                        </td>
                        <td>
                          <h5></h5>
                        </td>
                        <td>
                          <p>{formatPrice(order.total)}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  )
}
