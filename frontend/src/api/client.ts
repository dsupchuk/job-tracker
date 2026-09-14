import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { credentialsReceived, loggedOut } from '@/store/authSlice'
import { store } from '@/store'
import type { ApiError, AuthResponse } from './types'

export const API_URL = import.meta.env.VITE_API_URL

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

/** Marks a request that has already been retried, so a loop cannot form. */
type RetriableConfig = InternalAxiosRequestConfig & { _retried?: boolean }

apiClient.interceptors.request.use((config) => {
  const { accessToken } = store.getState().auth
  if (accessToken) {
    config.headers.setAuthorization(`Bearer ${accessToken}`)
  }
  return config
})

/**
 * Single-flight refresh: several requests failing with 401 at once share one
 * call to `/api/auth/refresh` instead of each firing their own.
 */
let refreshInFlight: Promise<string> | null = null

export function refreshAccessToken(): Promise<string> {
  if (refreshInFlight) return refreshInFlight

  const { refreshToken } = store.getState().auth
  if (!refreshToken) return Promise.reject(new Error('No refresh token'))

  refreshInFlight = axios
    // A bare axios call — going through apiClient would re-enter these interceptors.
    .post<AuthResponse>(`${API_URL}/api/auth/refresh`, { refreshToken })
    .then((response) => {
      store.dispatch(credentialsReceived(response.data))
      return response.data.accessToken
    })
    .catch((error: unknown) => {
      store.dispatch(loggedOut())
      throw error
    })
    .finally(() => {
      refreshInFlight = null
    })

  return refreshInFlight
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const config = error.config as RetriableConfig | undefined
    const isAuthCall = config?.url?.startsWith('/api/auth/') ?? false

    if (error.response?.status !== 401 || !config || config._retried || isAuthCall) {
      return Promise.reject(error)
    }

    config._retried = true
    try {
      const accessToken = await refreshAccessToken()
      config.headers.setAuthorization(`Bearer ${accessToken}`)
      return await apiClient.request(config)
    } catch {
      // Refresh already dispatched loggedOut; ProtectedRoute handles the redirect.
      return Promise.reject(error)
    }
  },
)

/** Pulls the backend's error message out of an Axios failure for display. */
export function apiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  if (axios.isAxiosError<ApiError>(error)) {
    const data = error.response?.data
    const firstFieldError = data?.fieldErrors?.[0]
    if (firstFieldError) return `${firstFieldError.field}: ${firstFieldError.message}`
    if (data?.message) return data.message
    if (!error.response) return 'Cannot reach the server'
  }
  return fallback
}
