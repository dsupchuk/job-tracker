import { QueryClient } from '@tanstack/react-query'
import axios from 'axios'

/** Retrying a 4xx never helps — only server and network failures get a retry. */
function shouldRetry(failureCount: number, error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status
    if (status !== undefined && status >= 400 && status < 500) return false
  }
  return failureCount < 2
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetry,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})
