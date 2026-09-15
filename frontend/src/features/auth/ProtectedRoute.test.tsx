import { QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { AuthBootstrap } from '@/features/auth/AuthBootstrap'
import { AnonymousOnlyRoute, ProtectedRoute } from '@/features/auth/ProtectedRoute'
import { createStore } from '@/store'
import { credentialsReceived, REFRESH_TOKEN_KEY } from '@/store/authSlice'
import { createTestQueryClient } from '@/test/providers'
import { VALID_ACCESS_TOKEN, VALID_REFRESH_TOKEN } from '@/test/msw/handlers'

function renderRoutes(initialEntry: string, store = createStore()) {
  const queryClient = createTestQueryClient()
  render(
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap>
          <MemoryRouter initialEntries={[initialEntry]}>
            <Routes>
              <Route element={<AnonymousOnlyRoute />}>
                <Route path="/login" element={<p>Login page</p>} />
              </Route>
              <Route element={<ProtectedRoute />}>
                <Route path="/applications" element={<p>Applications page</p>} />
              </Route>
            </Routes>
          </MemoryRouter>
        </AuthBootstrap>
      </QueryClientProvider>
    </Provider>,
  )
  return { store }
}

describe('ProtectedRoute', () => {
  it('sends an anonymous visitor to the login page', () => {
    renderRoutes('/applications')
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })

  it('lets a signed-in user through', () => {
    const store = createStore()
    store.dispatch(
      credentialsReceived({ accessToken: VALID_ACCESS_TOKEN, refreshToken: VALID_REFRESH_TOKEN }),
    )

    renderRoutes('/applications', store)
    expect(screen.getByText('Applications page')).toBeInTheDocument()
  })
})

describe('AnonymousOnlyRoute', () => {
  it('keeps a signed-in user away from the login page', () => {
    const store = createStore()
    store.dispatch(
      credentialsReceived({ accessToken: VALID_ACCESS_TOKEN, refreshToken: VALID_REFRESH_TOKEN }),
    )

    renderRoutes('/login', store)
    expect(screen.getByText('Applications page')).toBeInTheDocument()
  })
})

describe('session restore on startup', () => {
  /**
   * What the outcome of the exchange is — a new token, or being signed out —
   * is covered in `api/client.test.ts`, where the refresh actually happens.
   * What matters here is that the guard *waits* for it.
   */
  it('waits rather than bouncing while a stored refresh token is exchanged', () => {
    localStorage.setItem(`jobtracker.${REFRESH_TOKEN_KEY}`, VALID_REFRESH_TOKEN)
    try {
      renderRoutes('/applications')

      // Crucially not the login page: bouncing here would sign people out on
      // every reload of the tab.
      expect(screen.getByRole('status')).toHaveTextContent('Restoring your session')
      expect(screen.queryByText('Login page')).not.toBeInTheDocument()
    } finally {
      localStorage.clear()
    }
  })

  it('does not wait when there is no stored token to exchange', () => {
    renderRoutes('/applications')

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(screen.getByText('Login page')).toBeInTheDocument()
  })
})
