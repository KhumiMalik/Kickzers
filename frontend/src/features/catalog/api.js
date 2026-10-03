import { apiClient } from '../../lib/api-client'
import { dataOf } from '../../lib/schemas'
import { catalogFiltersSchema, productListSchema } from './schemas'

/** GET /products — `params` are the API parameters (see search-params.js toProductQuery). */
export const getProducts = async (params) => productListSchema.parse(await apiClient.get('/products', { params }))

/** GET /catalog/filters */
export const getCatalogFilters = async () => dataOf(catalogFiltersSchema).parse(await apiClient.get('/catalog/filters'))
