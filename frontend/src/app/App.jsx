import { QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { RouterProvider } from 'react-router-dom'
import { createQueryClient } from '../lib/query-client'
import { router } from './router'

export default function App() {
  // One QueryClient per app instance (created lazily, never re-created on re-render).
  const [queryClient] = useState(createQueryClient)

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}
