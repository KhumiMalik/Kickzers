import { createContext, useContext, useMemo, useState } from 'react'
import QuickViewModal from '../components/product/QuickViewModal'

const QuickViewContext = createContext(null)

export function QuickViewProvider({ children }) {
  const [product, setProduct] = useState(null)

  const value = useMemo(() => ({ open: setProduct, close: () => setProduct(null) }), [])

  return (
    <QuickViewContext value={value}>
      {children}
      {product && <QuickViewModal product={product} onClose={() => setProduct(null)} />}
    </QuickViewContext>
  )
}

export const useQuickView = () => useContext(QuickViewContext)
