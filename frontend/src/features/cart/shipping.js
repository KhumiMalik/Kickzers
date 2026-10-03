import { formatMoney } from '../../lib/money'

/** "Flat Rate: $10.00", or just "Free Shipping" for free methods (the template's labels). */
export const shippingLabel = ({ name, price }, currency = 'USD') =>
  price > 0 ? `${name}: ${formatMoney(price, currency)}` : name
