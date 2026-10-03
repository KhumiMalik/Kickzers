import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useToast } from '../../components/ui/toast/ToastProvider'
import {
  addCartItem,
  applyCoupon,
  emptyCart,
  getCart,
  getCountries,
  removeCartItem,
  removeCoupon,
  setDestination,
  setShippingMethod,
  updateCartItem,
} from './api'

export const cartKeys = {
  cart: ['cart'],
  countries: ['countries'],
}

/** The current visitor's cart (guest or logged-in). */
export const useCart = () => useQuery({ queryKey: cartKeys.cart, queryFn: getCart })

export const useCountries = () => useQuery({ queryKey: cartKeys.countries, queryFn: getCountries, staleTime: Infinity })

/** A cart mutation whose response (the full cart) replaces the cached cart. */
function useCartMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    ...options,
    onSuccess: (cart, variables) => {
      queryClient.setQueryData(cartKeys.cart, cart)
      options.onSuccess?.(cart, variables)
    },
  })
}

/** First validation message from an ApiError, or its general message. */
const firstError = (error) => Object.values(error.errors ?? {})[0] ?? error.message

/**
 * Adds a product to the bag with toast feedback.
 * @returns {{ addToCart: (product: {id: number, name: string}, quantity?: number, options?: {onSuccess?: Function}) => void, isPending: boolean }}
 */
export function useAddToCart() {
  const { notify } = useToast()
  const mutation = useCartMutation(({ product, quantity }) => addCartItem({ productId: product.id, quantity }), {
    onSuccess: (_cart, { product }) => notify(`${product.name} added to your bag.`),
    onError: (error) => notify(firstError(error), 'error'),
  })
  return {
    addToCart: (product, quantity = 1, options) => mutation.mutate({ product, quantity }, options),
    isPending: mutation.isPending,
  }
}

export function useUpdateCartItem() {
  const { notify } = useToast()
  return useCartMutation(updateCartItem, { onError: (error) => notify(firstError(error), 'error') })
}

export const useRemoveCartItem = () => useCartMutation(removeCartItem)
export const useEmptyCart = () => useCartMutation(emptyCart)
export const useApplyCoupon = () => useCartMutation(applyCoupon)
export const useRemoveCoupon = () => useCartMutation(removeCoupon)
export const useSetShippingMethod = () => useCartMutation(setShippingMethod)
export const useSetDestination = () => useCartMutation(setDestination)
