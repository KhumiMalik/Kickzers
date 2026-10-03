import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { getCatalogFilters, getProducts } from './api'

export const catalogKeys = {
  products: (params) => ['catalog', 'products', params],
  filters: ['catalog', 'filters'],
}

/**
 * Product listing. While a new page/filter loads, the previous results stay on
 * screen (`placeholderData`) and `isPlaceholderData` lets the grid dim itself.
 */
export const useProducts = (params) =>
  useQuery({
    queryKey: catalogKeys.products(params),
    queryFn: () => getProducts(params),
    placeholderData: keepPreviousData,
  })

export const useCatalogFilters = () =>
  useQuery({ queryKey: catalogKeys.filters, queryFn: getCatalogFilters, staleTime: 5 * 60_000 })
