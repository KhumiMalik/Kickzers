import { ToastProvider } from '../components/ui/toast/ToastProvider'
import { QuickViewProvider } from '../features/products'

/**
 * Client-state providers that render UI (toasts, quick-view modal). They live
 * inside the router because the quick view contains links.
 * Server state is in TanStack Query (see App.jsx).
 */
export default function UiProviders({ children }) {
  return (
    <ToastProvider>
      <QuickViewProvider>{children}</QuickViewProvider>
    </ToastProvider>
  )
}
