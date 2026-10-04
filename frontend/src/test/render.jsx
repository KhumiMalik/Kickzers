import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { ToastProvider } from '../components/ui/toast/ToastProvider'
import { QuickViewProvider } from '../features/products'

/** Shows the current URL, so tests can assert navigation: `screen.getByTestId('location')`. */
function LocationDisplay() {
  const location = useLocation()
  return <output data-testid="location">{`${location.pathname}${location.search}`}</output>
}

/**
 * Renders `ui` inside the app's providers (TanStack Query, router, toasts,
 * quick view), like main.jsx does, with a fresh QueryClient that never
 * retries so failed requests surface immediately.
 *
 * @param {import('react').ReactElement} ui
 * @param {{ route?: string, path?: string }} [options] start URL, and the route pattern when the component reads params
 */
export function renderWithProviders(ui, { route = '/', path = '*' } = {}) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  const result = render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[route]}>
        <ToastProvider>
          <QuickViewProvider>
            <Routes>
              <Route path={path} element={ui} />
            </Routes>
            <LocationDisplay />
          </QuickViewProvider>
        </ToastProvider>
      </MemoryRouter>
    </QueryClientProvider>,
  )

  return { ...result, queryClient }
}
