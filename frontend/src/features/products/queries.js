import { useQuery } from '@tanstack/react-query'
import { getDealsOfTheWeek, getProduct, getRelatedProducts } from './api'

/** Query keys for product data (other features use these to invalidate after writes). */
export const productKeys = {
  all: ['products'],
  detail: (slug) => ['products', 'detail', slug],
  related: (slug) => ['products', 'related', slug],
  dealsOfTheWeek: ['promotions', 'deals-of-the-week'],
}

export const useProduct = (slug) =>
  useQuery({ queryKey: productKeys.detail(slug), queryFn: () => getProduct(slug), enabled: Boolean(slug) })

export const useRelatedProducts = (slug) =>
  useQuery({ queryKey: productKeys.related(slug), queryFn: () => getRelatedProducts(slug), enabled: Boolean(slug) })

export const useDealsOfTheWeek = () => useQuery({ queryKey: productKeys.dealsOfTheWeek, queryFn: getDealsOfTheWeek })
