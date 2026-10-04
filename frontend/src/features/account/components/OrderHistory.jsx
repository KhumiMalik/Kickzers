import { Link } from 'react-router-dom'
import ErrorState from '../../../components/ui/ErrorState'
import Loader from '../../../components/ui/Loader'
import Pagination from '../../../components/ui/Pagination'
import { formatShortDate } from '../../../lib/dates'
import { formatMoney } from '../../../lib/money'
import { useOrderHistory } from '../queries'

/**
 * The customer's orders, newest first, styled like the template's order
 * details table. Each order opens on the confirmation page, which the API
 * allows for the order's owner.
 */
export default function OrderHistory({ page, hrefFor }) {
  const { data, isPending, isError, refetch } = useOrderHistory(page)

  if (isPending) return <Loader />
  if (isError) return <ErrorState message="Your orders could not be loaded." onRetry={refetch} />

  if (data.data.length === 0) {
    return (
      <div className="empty-state">
        <p>You have not placed any orders yet.</p>
        <Link className="primary-btn" to="/shop">
          Start shopping
        </Link>
      </div>
    )
  }

  return (
    <>
      <div className="table-responsive">
        <table className="table">
          <thead>
            <tr>
              <th scope="col">Order</th>
              <th scope="col">Date</th>
              <th scope="col">Status</th>
              <th scope="col">Items</th>
              <th scope="col">Total</th>
              <th scope="col">
                <span className="sr-only">Details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((order) => (
              <tr key={order.number}>
                <td>
                  <p>{order.number}</p>
                </td>
                <td>
                  <p>{formatShortDate(order.placedAt)}</p>
                </td>
                <td>
                  <p>{order.statusLabel}</p>
                </td>
                <td>
                  <p>{order.itemCount}</p>
                </td>
                <td>
                  <p>{formatMoney(order.totals.total, order.currency)}</p>
                </td>
                <td>
                  <Link
                    to={`/confirmation?order=${encodeURIComponent(order.number)}`}
                    aria-label={`View order ${order.number}`}
                  >
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="filter-bar d-flex flex-wrap align-items-center justify-content-end">
        <Pagination page={data.meta.page} lastPage={data.meta.lastPage} hrefFor={hrefFor} />
      </div>
    </>
  )
}
