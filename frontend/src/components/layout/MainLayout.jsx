import { Outlet, ScrollRestoration } from 'react-router-dom'
import AppProviders from '../../context/AppProviders'
import Footer from './Footer'
import Header from './Header'

export default function MainLayout() {
  return (
    <AppProviders>
      <Header />
      <Outlet />
      <Footer />
      <ScrollRestoration />
    </AppProviders>
  )
}
