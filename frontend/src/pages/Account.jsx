import { Navigate, useSearchParams } from 'react-router-dom'
import PageBanner from '../components/layout/PageBanner'
import Loader from '../components/ui/Loader'
import { OrderHistory } from '../features/account'
import { useCurrentUser } from '../features/auth'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import { formatShortDate } from '../lib/dates'

/** "My Account": profile and order history. Guests are sent to the login page and brought back. */
export default function Account() {
  useDocumentTitle('My Account')
  const { data: user, isPending } = useCurrentUser()
  const [params] = useSearchParams()
  const page = Math.max(1, Number(params.get('page')) || 1)

  if (isPending) return <Loader />
  if (!user) return <Navigate to="/login" replace state={{ from: '/account' }} />

  return (
    <>
      <PageBanner title="My Account" crumbs={[{ label: 'My Account', to: '/account' }]} />
      <section className="order_details section_gap">
        <div className="container">
          <div className="row order_d_inner">
            <div className="col-lg-4">
              <div className="details_item">
                <h4>Profile</h4>
                <ul className="list">
                  <li>
                    <span>
                      <span>Name</span> : {user.name}
                    </span>
                  </li>
                  <li>
                    <span>
                      <span>Email</span> : {user.email}
                    </span>
                  </li>
                  <li>
                    <span>
                      <span>Member since</span> : {formatShortDate(user.createdAt)}
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="order_details_table">
            <h2>Order History</h2>
            <OrderHistory page={page} hrefFor={(p) => (p === 1 ? '/account' : `/account?page=${p}`)} />
          </div>
        </div>
      </section>
    </>
  )
}
