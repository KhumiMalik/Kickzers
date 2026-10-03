import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { readStore, writeStore } from '../api/mock'
import { useToast } from './ToastContext'

const WishlistContext = createContext(null)
const STORAGE_KEY = 'karma.wishlist'

export function WishlistProvider({ children }) {
  const [ids, setIds] = useState(() => readStore(STORAGE_KEY, []))
  const { notify } = useToast()

  useEffect(() => writeStore(STORAGE_KEY, ids), [ids])

  const toggle = useCallback(
    (product) => {
      const saved = ids.includes(product.id)
      setIds((list) => (saved ? list.filter((id) => id !== product.id) : [...list, product.id]))
      notify(saved ? `${product.name} removed from wishlist.` : `${product.name} saved to wishlist.`)
    },
    [ids, notify],
  )

  const value = useMemo(() => ({ ids, has: (id) => ids.includes(id), toggle }), [ids, toggle])

  return <WishlistContext value={value}>{children}</WishlistContext>
}

export const useWishlist = () => useContext(WishlistContext)
