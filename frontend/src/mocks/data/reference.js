// Reference data for the mock server (see catalog.js).

export const STORE_COUNTRY = 'US'

export const countries = [
  { code: 'US', name: 'United States', states: ['California', 'Florida', 'New York', 'Texas'] },
  { code: 'GB', name: 'United Kingdom', states: ['England', 'Northern Ireland', 'Scotland', 'Wales'] },
  { code: 'PK', name: 'Pakistan', states: ['Balochistan', 'Khyber Pakhtunkhwa', 'Punjab', 'Sindh'] },
  { code: 'IN', name: 'India', states: ['Delhi', 'Karnataka', 'Maharashtra', 'Tamil Nadu'] },
  { code: 'BD', name: 'Bangladesh', states: ['Chittagong', 'Dhaka', 'Khulna', 'Sylhet'] },
]

/**
 * Shipping methods with default prices. `domesticOnly` methods are only offered
 * when the destination is the store's country (or not set yet).
 */
export const shippingMethods = [
  { code: 'flat_rate_5', name: 'Flat Rate', price: 500 },
  { code: 'free', name: 'Free Shipping', price: 0 },
  { code: 'flat_rate_10', name: 'Flat Rate', price: 1000 },
  { code: 'local_delivery', name: 'Local Delivery', price: 200, domesticOnly: true },
]

export const DEFAULT_SHIPPING_METHOD = 'local_delivery'

export const paymentMethods = [
  {
    code: 'cash_on_delivery',
    name: 'Cash on delivery',
    description: 'Pay with cash when your order is delivered.',
    image: null,
  },
  {
    code: 'check',
    name: 'Check payments',
    description: 'Please send a check to Store Name, Store Street, Store Town, Store State / County, Store Postcode.',
    image: null,
  },
]

export const coupons = [
  { code: 'KICKZERS10', type: 'percent', value: 10, description: '10% off', min_subtotal: null, expires_at: null },
  { code: 'SAVE20', type: 'fixed', value: 2000, description: '$20 off', min_subtotal: null, expires_at: null },
]
