import PageBanner from '../components/layout/PageBanner'
import ErrorState from '../components/ui/ErrorState'
import Loader from '../components/ui/Loader'
import { CartTable, useCart } from '../features/cart'
import { useDocumentTitle } from '../hooks/useDocumentTitle'

export default function Cart() {
  useDocumentTitle('Shopping Cart')
  const { data: cart, isPending, isError, refetch } = useCart()

  return (
    <>
      <PageBanner title="Shopping Cart" crumbs={[{ label: 'Cart', to: '/cart' }]} />
      <section className="cart_area">
        <div className="container">
          <div className="cart_inner">
            {isPending && <Loader />}
            {isError && <ErrorState message="Your cart could not be loaded." onRetry={refetch} />}
            {cart && <CartTable cart={cart} />}
          </div>
        </div>
      </section>
    </>
  )
}
