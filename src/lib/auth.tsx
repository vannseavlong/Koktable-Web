import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { apiFetch, ApiError } from '@/lib/api'
import { AUTH_TOKEN_STORAGE_KEY } from '@/lib/constants'
import { queryKeys } from '@/lib/queryKeys'
import type { ApiUser } from '@/types/api'

interface AuthContextValue {
  token: string | null
  user: ApiUser | null
  isAuthenticated: boolean
  /** True only while the one-time `auth/me` bootstrap fetch (for a token already in storage) is in flight. */
  isInitializing: boolean
  login: (email: string, password: string) => Promise<void>
  register: (fullName: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

function readStoredToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_STORAGE_KEY)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(readStoredToken)
  const queryClient = useQueryClient()

  // Fetched once on app load, only when a token already exists in storage —
  // never polled, never refetched on route change (staleTime: Infinity).
  const meQuery = useQuery({
    queryKey: queryKeys.authMe(),
    queryFn: () => apiFetch<{ user: ApiUser }>('/user/auth/me'),
    enabled: !!token,
    staleTime: Infinity,
    retry: false,
  })

  const persistToken = useCallback((next: string | null) => {
    try {
      if (next) localStorage.setItem(AUTH_TOKEN_STORAGE_KEY, next)
      else localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY)
    } catch {
      // ignore storage failures (private mode, etc.) — session just won't persist across reloads
    }
    setToken(next)
  }, [])

  const login = useCallback(
    async (email: string, password: string) => {
      const res = await apiFetch<{ token: string; user: ApiUser }>('/user/auth/login', {
        method: 'POST',
        body: { email, password },
      })
      persistToken(res.token)
      queryClient.setQueryData(queryKeys.authMe(), { user: res.user })
    },
    [persistToken, queryClient],
  )

  const register = useCallback(
    async (fullName: string, email: string, password: string) => {
      const res = await apiFetch<{ token: string; user: ApiUser }>('/user/auth/register', {
        method: 'POST',
        body: { full_name: fullName, email, password },
      })
      persistToken(res.token)
      queryClient.setQueryData(queryKeys.authMe(), { user: res.user })
    },
    [persistToken, queryClient],
  )

  const logout = useCallback(() => {
    persistToken(null)
    queryClient.removeQueries({ queryKey: queryKeys.authMe() })
    queryClient.removeQueries({ queryKey: queryKeys.reservations() })
  }, [persistToken, queryClient])

  // A token that's no longer valid (expired/revoked) — drop it rather than
  // getting stuck treating the user as logged-in with no usable session.
  useEffect(() => {
    if (token && meQuery.isError && meQuery.error instanceof ApiError && meQuery.error.status === 401) {
      persistToken(null)
    }
  }, [token, meQuery.isError, meQuery.error, persistToken])

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user: meQuery.data?.user ?? null,
      isAuthenticated: !!token,
      isInitializing: !!token && meQuery.isLoading,
      login,
      register,
      logout,
    }),
    [token, meQuery.data, meQuery.isLoading, login, register, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
