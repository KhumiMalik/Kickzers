import { useMutation, useQuery } from '@tanstack/react-query'
import { getOrder, trackOrder } from './api'

export const orderKeys = {
  detail: (number) => ['orders', 'detail', number],
}

export const useOrder = (number) =>
  useQuery({ queryKey: orderKeys.detail(number), queryFn: () => getOrder(number), enabled: Boolean(number) })

export const useTrackOrder = () => useMutation({ mutationFn: trackOrder })
