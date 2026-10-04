import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { accountKeys } from '../account'
import { authKeys } from '../auth'
import { cartKeys } from '../cart'
import { orderKeys } from '../orders'
import { getPaymentMethods, placeOrder } from './api'

export const checkoutKeys = {
  paymentMethods: ['payment-methods'],
}

export const usePaymentMethods = () =>
  useQuery({ queryKey: checkoutKeys.paymentMethods, queryFn: getPaymentMethods, staleTime: Infinity })

/**
 * Places the order. The server empties the cart (and may create + log in an
 * account), so those caches and the order history are refreshed; the order is
 * cached for the confirmation page.
 */
export function usePlaceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ payload, idempotencyKey }) => placeOrder(payload, idempotencyKey),
    onSuccess: (order) => {
      queryClient.setQueryData(orderKeys.detail(order.number), order)
      return Promise.all([
        queryClient.invalidateQueries({ queryKey: cartKeys.cart }),
        queryClient.invalidateQueries({ queryKey: authKeys.user }),
        queryClient.invalidateQueries({ queryKey: accountKeys.all }),
      ])
    },
  })
}
