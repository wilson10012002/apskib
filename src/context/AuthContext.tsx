import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import {
  authApi,
  clearStoredAuthToken,
  getApiErrorMessage,
  getStoredAuthToken,
  setAuthToken,
  storeAuthToken,
} from '../lib/api'
import type { AdminUser } from '../types/api'

interface AuthContextValue {
  admin: AdminUser | null
  initializing: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [initializing, setInitializing] = useState(true)

  // Ao carregar a app, se houver um token guardado, valida-o contra a API
  // (/auth/me) para recuperar a sessão sem pedir login outra vez.
  useEffect(() => {
    let cancelled = false
    const token = getStoredAuthToken()

    if (!token) {
      // Sem token guardado: não há sessão a validar, termina a
      // inicialização já (mesmo padrão de fetch-on-mount usado no useFetch).
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setInitializing(false)
      return
    }

    setAuthToken(token)

    authApi
      .me()
      .then((user) => {
        if (!cancelled) setAdmin(user)
      })
      .catch(() => {
        if (!cancelled) {
          setAuthToken(null)
          clearStoredAuthToken()
        }
      })
      .finally(() => {
        if (!cancelled) setInitializing(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { token, user } = await authApi.login({ email, password })
      storeAuthToken(token)
      setAuthToken(token)
      setAdmin(user)
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Não foi possível iniciar sessão.'), { cause: error })
    }
  }, [])

  const logout = useCallback(() => {
    setAuthToken(null)
    clearStoredAuthToken()
    setAdmin(null)
  }, [])

  const value = useMemo(
    () => ({ admin, initializing, login, logout }),
    [admin, initializing, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- hook fica junto do provider por conveniência
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider.')
  }
  return context
}
