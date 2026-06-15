import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import { AxiosHeaders } from 'axios'
import { apiClient, refreshClient } from '../services/apiClient'
import type { AuthResponse } from '../types/auth'

type AuthState = {
  accessToken: string | null
  role: string | null
}

type PendingRequest = {
  resolve: (value: unknown) => void
  reject: (reason?: unknown) => void
  config: AxiosRequestConfig
}
type AuthContextValue = AuthState & {
  setAuth: (payload: AuthResponse) => void
  clearAuth: () => void
  getRolePath: (role: string | null) => string
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [authState, setAuthState] = useState<AuthState>({
    accessToken: null,
    role: null,
  })
  const [isAuthReady, setIsAuthReady] = useState(false)
  const [interceptorsReady, setInterceptorsReady] = useState(false)
  const accessTokenRef = useRef<string | null>(null)
  const didInitRefresh = useRef(false)
  const refreshPromiseRef = useRef<Promise<AuthResponse> | null>(null)

  const getRolePath = useCallback((role: string | null) => {
    switch (role) {
      case 'SUPER_RH':
        return '/admin'
      case 'RH':
        return '/rh'
      case 'ASSISTANT':
        return '/assistant'
      case 'WORKER':
        return '/worker'
      default:
        return '/auth/login'
    }
  }, [])

  const handleRoleRedirect = useCallback(
    (role: string | null) => {
      if (!location.pathname.startsWith('/auth')) {
        return
      }

      const target = getRolePath(role)
      if (location.pathname === target) {
        return
      }

      navigate(target, { replace: true })
    },
    [getRolePath, location.pathname, navigate],
  )

  const setAuth = useCallback((payload: AuthResponse) => {
    accessTokenRef.current = payload.accessToken
    setAuthState({ accessToken: payload.accessToken, role: payload.role })
    setIsAuthReady(true)
  }, [])

  const clearAuth = useCallback(() => {
    accessTokenRef.current = null
    setAuthState({ accessToken: null, role: null })
    setIsAuthReady(true)
  }, [])

  const runRefresh = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current
    }

    didInitRefresh.current = true

    const refreshPromise = refreshClient
      .get<AuthResponse>('/auth/refresh')
      .then((refreshResponse) => {
        setAuth(refreshResponse.data)
        handleRoleRedirect(refreshResponse.data.role)
        return refreshResponse.data
      })
      .catch((error) => {
        clearAuth()
        navigate('/auth/login', { replace: true })
        throw error
      })
      .finally(() => {
        refreshPromiseRef.current = null
      })

    refreshPromiseRef.current = refreshPromise
    return refreshPromise
  }, [clearAuth, handleRoleRedirect, navigate, setAuth])

  useEffect(() => {
    if (didInitRefresh.current || accessTokenRef.current) {
      return
    }

    runRefresh()
  }, [runRefresh])

  useLayoutEffect(() => {
    let isRefreshing = false
    let requestQueue: PendingRequest[] = []

    const processQueue = (error: unknown, token: string | null) => {
      requestQueue.forEach(({ resolve, reject, config }) => {
        if (error) {
          reject(error)
          return
        }

        if (token) {
          config.headers = {
            ...config.headers,
            Authorization: `Bearer ${token}`,
          }
        }

        resolve(apiClient(config))
      })
      requestQueue = []
    }

    const requestInterceptor = apiClient.interceptors.request.use(
      async (config) => {
        const requestUrl = config.url ?? ''
        const isAuthRequest = requestUrl.startsWith('/auth/')

        if (!isAuthRequest && !accessTokenRef.current) {
          try {
            if (!didInitRefresh.current) {
              await runRefresh()
            } else if (refreshPromiseRef.current) {
              await refreshPromiseRef.current
            }
          } catch (error) {
            return Promise.reject(error)
          }
        }

        const token = accessTokenRef.current
        if (!isAuthRequest && !token) {
          return Promise.reject(new Error('Missing access token.'))
        }

        if (token) {
          const headers = AxiosHeaders.from(config.headers)
          headers.set('Authorization', `Bearer ${token}`)
          config.headers = headers
        }

        return config
      },
    )

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as
          | (AxiosRequestConfig & { _retry?: boolean })
          | undefined

        if (!originalRequest || error.response?.status !== 401) {
          return Promise.reject(error)
        }

        if (originalRequest._retry) {
          return Promise.reject(error)
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            requestQueue.push({ resolve, reject, config: originalRequest })
          })
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshData = await runRefresh()
          processQueue(null, refreshData.accessToken)
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${refreshData.accessToken}`,
          }
          return apiClient(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      },
    )

    setInterceptorsReady(true)

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor)
      apiClient.interceptors.response.eject(responseInterceptor)
      setInterceptorsReady(false)
    }
  }, [clearAuth, handleRoleRedirect, navigate, runRefresh, setAuth])

  const value = useMemo(
    () => ({
      accessToken: authState.accessToken,
      role: authState.role,
      setAuth,
      clearAuth,
      getRolePath,
    }),
    [authState.accessToken, authState.role, clearAuth, getRolePath, setAuth],
  )

  if (!isAuthReady || !interceptorsReady) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-foreground">
        <div className="rounded-full border border-border bg-card px-4 py-2 text-xs text-muted-foreground">
          Loading session...
        </div>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
