import { ApiError, apiClient } from '../../lib/api-client'
import { dataOf } from '../../lib/schemas'
import { userSchema } from './schemas'

/** GET /auth/user — resolves to null for guests (the API answers 401). */
export async function getCurrentUser() {
  try {
    return dataOf(userSchema).parse(await apiClient.get('/auth/user'))
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}

/** POST /auth/login */
export const login = async ({ email, password, remember }) =>
  dataOf(userSchema).parse(await apiClient.post('/auth/login', { email, password, remember }))

/** POST /auth/register */
export const register = async ({ name, email, password, passwordConfirmation }) =>
  dataOf(userSchema).parse(await apiClient.post('/auth/register', { name, email, password, passwordConfirmation }))

/** POST /auth/logout */
export const logout = () => apiClient.post('/auth/logout')
