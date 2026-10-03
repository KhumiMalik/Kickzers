import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { readStore, writeStore } from '../api/mock'
import { login as loginRequest, register as registerRequest } from '../api/site'

const AuthContext = createContext(null)
const STORAGE_KEY = 'karma.user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStore(STORAGE_KEY, null))

  useEffect(() => writeStore(STORAGE_KEY, user), [user])

  const login = useCallback(async (credentials) => {
    const loggedIn = await loginRequest(credentials)
    setUser(loggedIn)
    return loggedIn
  }, [])

  const register = useCallback(async (details) => {
    const created = await registerRequest(details)
    setUser(created)
    return created
  }, [])

  const logout = useCallback(() => setUser(null), [])

  const value = useMemo(() => ({ user, login, register, logout }), [user, login, register, logout])

  return <AuthContext value={value}>{children}</AuthContext>
}

export const useAuth = () => useContext(AuthContext)
