import { AuthProvider } from './AuthContext'
import { CartProvider } from './CartContext'
import { QuickViewProvider } from './QuickViewContext'
import { ToastProvider } from './ToastContext'
import { WishlistProvider } from './WishlistContext'

export default function AppProviders({ children }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <QuickViewProvider>{children}</QuickViewProvider>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  )
}
