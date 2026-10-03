import { Link } from 'react-router-dom'
import PageBanner from '../components/layout/PageBanner'
import ErrorState from '../components/ui/ErrorState'
import Loader from '../components/ui/Loader'
import { useCurrentUser } from '../features/auth'
import { useCart } from '../features/cart'
import { CheckoutForm, CouponArea, ReturningCustomer, usePaymentMethods } from '../features/checkout'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

function CheckoutContent() {
  const cart = useCart()
  const paymentMethods = usePaymentMethods()
  const user = useCurrentUser()

  if (cart.isPending || paymentMethods.isPending || user.isPending) return <Loader />
  if (cart.isError || paymentMethods.isError) {
    return (
      <ErrorState message="Checkout could not be loaded." onRetry={() => (cart.refetch(), paymentMethods.refetch())} />
    )
  }
  if (cart.data.items.length === 0) {
    return (
      <div className="empty-state">
        <p>Your cart is empty — add something before checking out.</p>
        <Link className="primary-btn" to="/shop">
          Go to shop
        </Link>
      </div>
    )
  }

  return (
    <>
      {!user.data && <ReturningCustomer />}
      <CouponArea coupon={cart.data.coupon} />
      <CheckoutForm cart={cart.data} paymentMethods={paymentMethods.data} user={user.data} />
    </>
  )
}

export default function Checkout() {
  useDocumentTitle('Checkout')
  return (
    <>
      <PageBanner title="Checkout" crumbs={[{ label: 'Checkout', to: '/checkout' }]} />
      <section className="checkout_area section_gap">
        <div className="container">
          <CheckoutContent />
        </div>
      </section>
    </>
  )
}
