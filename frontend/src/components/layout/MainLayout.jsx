import { Outlet, ScrollRestoration } from 'react-router-dom'
import { CartNotices } from '../../features/cart'
import { WishlistSync } from '../../features/wishlist'
import Footer from './Footer'
import Header from './Header'

export default function MainLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
      {/* Renderless helpers that must exist exactly once per page */}
      <CartNotices />
      <WishlistSync />
      <ScrollRestoration />
    </>
  )
}
