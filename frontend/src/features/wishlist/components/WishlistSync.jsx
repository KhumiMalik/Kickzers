import { useEffect } from 'react'
import { useCurrentUser } from '../../auth'
import { useGuestWishlistIds } from '../guest-store'
import { useMergeGuestWishlist } from '../queries'

/**
 * When a visitor with a guest wishlist logs in, send it to the account once.
 * Mounted once in the layout (renders nothing).
 */
export default function WishlistSync() {
  const { data: user } = useCurrentUser()
  const guestIds = useGuestWishlistIds()
  const { mutate: merge, isPending } = useMergeGuestWishlist()

  useEffect(() => {
    if (user && guestIds.length && !isPending) merge(guestIds)
  }, [user, guestIds, isPending, merge])

  return null
}
