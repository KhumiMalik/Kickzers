import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout'
import Loader from '../components/ui/Loader'
import Home from '../pages/Home'
import UiProviders from './providers'

// Every page except Home is code-split and fetched on first visit.
const page = (load) => () => load().then((module) => ({ Component: module.default }))

export const router = createBrowserRouter([
  {
    element: (
      <UiProviders>
        <MainLayout />
      </UiProviders>
    ),
    // Shown while the first (lazy) page chunk downloads on a direct visit.
    hydrateFallbackElement: <Loader />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/shop', lazy: page(() => import('../pages/Shop')) },
      { path: '/product/:slug', lazy: page(() => import('../pages/ProductDetail')) },
      { path: '/cart', lazy: page(() => import('../pages/Cart')) },
      { path: '/checkout', lazy: page(() => import('../pages/Checkout')) },
      { path: '/confirmation', lazy: page(() => import('../pages/Confirmation')) },
      { path: '/login', lazy: page(() => import('../pages/Login')) },
      { path: '/tracking', lazy: page(() => import('../pages/Tracking')) },
      { path: '/blog', lazy: page(() => import('../pages/Blog')) },
      { path: '/blog/:slug', lazy: page(() => import('../pages/BlogPost')) },
      { path: '/contact', lazy: page(() => import('../pages/Contact')) },
      { path: '/elements', lazy: page(() => import('../pages/Elements')) },
      { path: '*', lazy: page(() => import('../pages/NotFound')) },
    ],
  },
])
