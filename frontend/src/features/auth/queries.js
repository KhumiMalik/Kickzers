import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getCurrentUser, login, logout, register } from './api'

export const authKeys = {
  user: ['auth', 'user'],
}

/** The logged-in user, or null for guests. */
export const useCurrentUser = () => useQuery({ queryKey: authKeys.user, queryFn: getCurrentUser, staleTime: Infinity })

/**
 * After login/logout everything user-specific (cart, wishlist, orders) may have
 * changed, so the new user is stored and every other query is refetched.
 */
function useSessionChange(mutationFn) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onSuccess: async (user) => {
      queryClient.setQueryData(authKeys.user, user ?? null)
      await queryClient.invalidateQueries({ predicate: (query) => query.queryKey !== authKeys.user })
    },
  })
}

export const useLogin = () => useSessionChange(login)
export const useRegister = () => useSessionChange(register)
export const useLogout = () => useSessionChange(async () => (await logout(), null))
