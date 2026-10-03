import { QueryClient } from '@tanstack/react-query'
import { ApiError } from './api-client'

/** 4xx responses are the client's fault (not found, validation…): retrying cannot help. */
const isClientError = (error) => error instanceof ApiError && error.status >= 400 && error.status < 500

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => !isClientError(error) && failureCount < 2,
      },
      mutations: {
        retry: false,
      },
    },
  })
}
