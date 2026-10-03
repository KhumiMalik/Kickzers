import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../components/ui/toast/ToastProvider'
import { useCurrentUser } from '../auth'
import { addToWishlist, getWishlist, mergeWishlist, removeFromWishlist } from './api'
import { guestWishlist, useGuestWishlistIds } from './guest-store'

export const wishlistKeys = {
  list: ['wishlist'],
}

/** Server wishlist for logged-in users (disabled for guests). */
export function useServerWishlist() {
  const { data: user } = useCurrentUser()
  return useQuery({ queryKey: wishlistKeys.list, queryFn: getWishlist, enabled: Boolean(user) })
}

/**
 * One API for both cases: guests use the browser list, users the server list.
 * @returns {{ has: (productId: number) => boolean, toggle: (product: {id: number, name: string}) => void }}
 */
export function useWishlist() {
  const { data: user } = useCurrentUser()
  const guestIds = useGuestWishlistIds()
  const { data: serverItems = [] } = useServerWishlist()
  const queryClient = useQueryClient()
  const { notify } = useToast()

  const ids = user ? serverItems.map((p) => p.id) : guestIds

  const toggleOnServer = useMutation({
    mutationFn: ({ product, saved }) => (saved ? removeFromWishlist(product.id) : addToWishlist(product.id)),
    onSettled: () => queryClient.invalidateQueries({ queryKey: wishlistKeys.list }),
  })

  const toggle = (product) => {
    const saved = ids.includes(product.id)
    const done = () => notify(saved ? `${product.name} removed from wishlist.` : `${product.name} saved to wishlist.`)
    if (!user) {
      guestWishlist.toggle(product.id)
      done()
      return
    }
    toggleOnServer.mutate({ product, saved }, { onSuccess: done, onError: (error) => notify(error.message, 'error') })
  }

  return { has: (productId) => ids.includes(productId), toggle }
}

/** Merges the guest wishlist into the account right after login (see WishlistSync). */
export function useMergeGuestWishlist() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: mergeWishlist,
    onSuccess: (items) => {
      guestWishlist.clear()
      queryClient.setQueryData(wishlistKeys.list, items)
    },
  })
}
