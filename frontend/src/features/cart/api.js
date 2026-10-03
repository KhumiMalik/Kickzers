import { z } from 'zod'
import { apiClient } from '../../lib/api-client'
import { dataOf } from '../../lib/schemas'
import { cartSchema, countrySchema } from './schemas'

// Every cart endpoint returns the whole cart, so callers can replace their copy.
const parseCart = (response) => dataOf(cartSchema).parse(response)

/** GET /cart */
export const getCart = async () => parseCart(await apiClient.get('/cart'))

/** POST /cart/items */
export const addCartItem = async ({ productId, quantity }) =>
  parseCart(await apiClient.post('/cart/items', { productId, quantity }))

/** PATCH /cart/items/{id} */
export const updateCartItem = async ({ itemId, quantity }) =>
  parseCart(await apiClient.patch(`/cart/items/${itemId}`, { quantity }))

/** DELETE /cart/items/{id} */
export const removeCartItem = async (itemId) => parseCart(await apiClient.delete(`/cart/items/${itemId}`))

/** DELETE /cart */
export const emptyCart = async () => parseCart(await apiClient.delete('/cart'))

/** POST /cart/coupon */
export const applyCoupon = async (code) => parseCart(await apiClient.post('/cart/coupon', { code }))

/** DELETE /cart/coupon */
export const removeCoupon = async () => parseCart(await apiClient.delete('/cart/coupon'))

/** PUT /cart/shipping-method */
export const setShippingMethod = async (method) => parseCart(await apiClient.put('/cart/shipping-method', { method }))

/** PUT /cart/destination */
export const setDestination = async ({ country, state, postcode }) =>
  parseCart(await apiClient.put('/cart/destination', { country, state, postcode }))

/** GET /countries */
export const getCountries = async () => dataOf(z.array(countrySchema)).parse(await apiClient.get('/countries'))
