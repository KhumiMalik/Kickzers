import { createContext, useContext, useMemo, useState } from 'react'
import QuickViewModal from './QuickViewModal'

const QuickViewContext = createContext(null)

/** Which product's quick view is open (client UI state, so a context is appropriate). */
export function QuickViewProvider({ children }) {
  const [slug, setSlug] = useState(null)

  const value = useMemo(() => ({ open: setSlug, close: () => setSlug(null) }), [])

  return (
    <QuickViewContext value={value}>
      {children}
      {slug && <QuickViewModal slug={slug} onClose={() => setSlug(null)} />}
    </QuickViewContext>
  )
}

/** @returns {{ open: (slug: string) => void, close: () => void }} */
export const useQuickView = () => useContext(QuickViewContext)
