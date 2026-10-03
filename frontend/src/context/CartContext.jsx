import { createContext, useCallback, useContext, useEffect, useMemo, useReducer } from 'react'
import { validateCoupon } from '../api/checkout'
import { readStore, writeStore } from '../api/mock'
import { shippingMethods } from '../data/site'
import { useToast } from './ToastContext'

const CartContext = createContext(null)
const STORAGE_KEY = 'karma.cart'

const emptyCart = {
  items: [],
  coupon: null,
  shippingId: 'local',
  destination: { country: '', state: '', zip: '' },
}

function reducer(state, action) {
  switch (action.type) {
    case 'add': {
      const { product, qty } = action
      const existing = state.items.find((i) => i.id === product.id)
      const items = existing
        ? state.items.map((i) => (i.id === product.id ? { ...i, qty: i.qty + qty } : i))
        : [...state.items, { id: product.id, slug: product.slug, name: product.name, price: product.price, image: product.image, qty }]
      return { ...state, items }
    }
    case 'setQty':
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.id ? { ...i, qty: Math.max(1, action.qty) } : i)),
      }
    case 'remove':
      return { ...state, items: state.items.filter((i) => i.id !== action.id) }
    case 'coupon':
      return { ...state, coupon: action.coupon }
    case 'shipping':
      return { ...state, shippingId: action.id }
    case 'destination':
      return { ...state, destination: action.destination }
    case 'clear':
      return { ...emptyCart, shippingId: state.shippingId, destination: state.destination }
    default:
      return state
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, null, () => ({ ...emptyCart, ...readStore(STORAGE_KEY, {}) }))
  const { notify } = useToast()

  useEffect(() => writeStore(STORAGE_KEY, state), [state])

  const addItem = useCallback(
    (product, qty = 1) => {
      if (product.comingSoon || !product.inStock) {
        notify(`${product.name} is coming soon.`, 'error')
        return
      }
      dispatch({ type: 'add', product, qty })
      notify(`${product.name} added to your bag.`)
    },
    [notify],
  )

  const applyCoupon = useCallback(async (code) => {
    const coupon = await validateCoupon(code)
    dispatch({ type: 'coupon', coupon })
    return coupon
  }, [])

  const value = useMemo(() => {
    const subtotal = state.items.reduce((sum, i) => sum + i.price * i.qty, 0)
    const { coupon } = state
    const discount = !coupon ? 0 : coupon.type === 'percent' ? (subtotal * coupon.value) / 100 : Math.min(coupon.value, subtotal)
    const shipping = shippingMethods.find((m) => m.id === state.shippingId) ?? shippingMethods[0]
    const shippingCost = state.items.length ? shipping.cost : 0

    return {
      items: state.items,
      count: state.items.reduce((n, i) => n + i.qty, 0),
      coupon,
      destination: state.destination,
      shipping,
      subtotal,
      discount,
      shippingCost,
      total: Math.max(0, subtotal - discount) + shippingCost,
      addItem,
      applyCoupon,
      updateQty: (id, qty) => dispatch({ type: 'setQty', id, qty }),
      removeItem: (id) => dispatch({ type: 'remove', id }),
      removeCoupon: () => dispatch({ type: 'coupon', coupon: null }),
      setShipping: (id) => dispatch({ type: 'shipping', id }),
      setDestination: (destination) => dispatch({ type: 'destination', destination }),
      clearCart: () => dispatch({ type: 'clear' }),
    }
  }, [state, addItem, applyCoupon])

  return <CartContext value={value}>{children}</CartContext>
}

export const useCart = () => useContext(CartContext)
