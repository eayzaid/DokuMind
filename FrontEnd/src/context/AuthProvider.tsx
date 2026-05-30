import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import {AxiosHeaders} from 'axios'
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
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [authState, setAuthState] = useState<AuthState>({
    accessToken: null,
    role: null,
  })
  const accessTokenRef = useRef<string | null>(null)
  const didInitRefresh = useRef(false)

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
  }, [])

  const clearAuth = useCallback(() => {
    accessTokenRef.current = null
    setAuthState({ accessToken: null, role: null })
  }, [])

  useEffect(() => {
    if (didInitRefresh.current || accessTokenRef.current) {
      return
    }

    didInitRefresh.current = true

    const refreshSession = async () => {
      try {
        const refreshResponse = await refreshClient.get<AuthResponse>(
          '/auth/refresh',
        )
        setAuth(refreshResponse.data)
        handleRoleRedirect(refreshResponse.data.role)
      } catch {
        clearAuth()
        navigate('/auth/login', { replace: true })
      }
    }

    refreshSession()
  }, [clearAuth, handleRoleRedirect, navigate, setAuth])

  useEffect(() => {
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

    const requestInterceptor = apiClient.interceptors.request.use((config) => {
      const token = authState.accessToken
      if (token) {
        const headers = AxiosHeaders.from(config.headers)
        headers.set("Authorization", `Bearer ${token}`)
        config.headers = headers
      }
      return config
    })

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
          const refreshResponse = await refreshClient.get<AuthResponse>(
            '/auth/refresh',
          )
          const refreshData = refreshResponse.data
          setAuth(refreshData)
          handleRoleRedirect(refreshData.role)
          processQueue(null, refreshData.accessToken)
          originalRequest.headers = {
            ...originalRequest.headers,
            Authorization: `Bearer ${refreshData.accessToken}`,
          }
          return apiClient(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError, null)
          clearAuth()
          navigate('/auth/login', { replace: true })
          return Promise.reject(refreshError)
        } finally {
          isRefreshing = false
        }
      },
    )

    return () => {
      apiClient.interceptors.request.eject(requestInterceptor)
      apiClient.interceptors.response.eject(responseInterceptor)
    }
  }, [clearAuth, handleRoleRedirect, navigate, setAuth])

  const value = useMemo(
    () => ({
      accessToken: authState.accessToken,
      role: authState.role,
      setAuth,
      clearAuth,
    }),
    [authState.accessToken, authState.role, clearAuth, setAuth],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
