import { useEffect } from 'react'
import { useToast } from '../../../components/ui/toast/ToastProvider'
import { useCart } from '../queries'

/**
 * Shows the server's cart notices (stock changed, coupon removed…) as toasts.
 * Mounted once in the layout so each notice is shown exactly once, however
 * many components read the cart.
 */
export default function CartNotices() {
  const { data: cart, dataUpdatedAt } = useCart()
  const { notify } = useToast()

  useEffect(() => {
    cart?.notices.forEach((notice) => notify(notice, 'error'))
    // Re-run only when a new cart response arrives.
  }, [dataUpdatedAt]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
