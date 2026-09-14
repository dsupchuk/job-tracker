import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactNode } from 'react'
import { Provider } from 'react-redux'
import { MemoryRouter } from 'react-router-dom'
import { createStore, type AppStore } from '@/store'

/** Retries and caching are off so a test observes exactly one attempt. */
export function createTestQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: Infinity, staleTime: Infinity },
      mutations: { retry: false },
    },
  })
}

/**
 * Wraps a hook or component in a fresh store and query client, so no state
 * leaks between tests.
 */
export function createWrapper(queryClient: QueryClient, store: AppStore = createStore()) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </Provider>
    )
  }

  return { Wrapper, store }
}

/**
 * Renders a component inside a fresh store, query client and router — the
 * combination every page-level test needs.
 */
export function renderWithProviders(
  ui: ReactNode,
  { queryClient = createTestQueryClient(), store = createStore() } = {},
) {
  const { Wrapper } = createWrapper(queryClient, store)
  const result = render(<MemoryRouter>{ui}</MemoryRouter>, { wrapper: Wrapper })
  return { ...result, store, queryClient }
}

/** A promise whose settlement the test controls, to hold a request mid-flight. */
export function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}
