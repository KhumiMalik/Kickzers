import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getOrderHistory } from './api'

export const accountKeys = {
  all: ['account'],
  orders: (page) => ['account', 'orders', page],
}

/** One page of the order history. The previous page stays on screen while the next one loads. */
export const useOrderHistory = (page) =>
  useQuery({
    queryKey: accountKeys.orders(page),
    queryFn: () => getOrderHistory({ page }),
    placeholderData: keepPreviousData,
  })
