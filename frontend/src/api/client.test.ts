import { http, HttpResponse } from 'msw'
import { beforeEach, describe, expect, it } from 'vitest'
import { listApplications } from '@/api/applications'
import { apiErrorMessage } from '@/api/client'
import { credentialsReceived, loggedOut } from '@/store/authSlice'
import { store } from '@/store'
import {
  API,
  VALID_ACCESS_TOKEN,
  VALID_REFRESH_TOKEN,
  application,
  page,
} from '@/test/msw/handlers'
import { server } from '@/test/msw/server'

/**
 * The interceptor contract, exercised over real HTTP rather than a mocked
 * module: an expired access token is refreshed once and the original request is
 * replayed, and a refresh that fails signs the user out instead of looping.
 */
beforeEach(() => {
  store.dispatch(loggedOut())
})

function signIn({ access = VALID_ACCESS_TOKEN, refresh = VALID_REFRESH_TOKEN } = {}) {
  store.dispatch(credentialsReceived({ accessToken: access, refreshToken: refresh }))
}

describe('the request interceptor', () => {
  it('attaches the access token from the store', async () => {
    signIn()
    const result = await listApplications()
    expect(result.content[0]?.position).toBe('Backend Engineer')
  })

  it('sends no Authorization header when nobody is signed in', async () => {
    let sent: string | null = 'unset'
    server.use(
      http.get(`${API}/api/applications`, ({ request }) => {
        sent = request.headers.get('Authorization')
        return HttpResponse.json(page([]))
      }),
    )

    await listApplications()
    expect(sent).toBeNull()
  })
})

describe('the response interceptor', () => {
  it('refreshes once on 401 and replays the original request', async () => {
    // A stale token: the first call 401s, and the replay must carry the new one.
    signIn({ access: 'expired-token' })

    let attempts = 0
    server.use(
      http.get(`${API}/api/applications`, ({ request }) => {
        attempts += 1
        if (request.headers.get('Authorization') !== `Bearer ${VALID_ACCESS_TOKEN}`) {
          return HttpResponse.json({ status: 401, code: 'UNAUTHENTICATED' }, { status: 401 })
        }
        return HttpResponse.json(page([application()]))
      }),
    )

    const result = await listApplications()

    expect(attempts).toBe(2)
    expect(result.content).toHaveLength(1)
    expect(store.getState().auth.accessToken).toBe(VALID_ACCESS_TOKEN)
    expect(store.getState().auth.status).toBe('authenticated')
  })

  it('shares one refresh between requests that fail together', async () => {
    signIn({ access: 'expired-token' })

    let refreshes = 0
    server.use(
      http.post(`${API}/api/auth/refresh`, () => {
        refreshes += 1
        return HttpResponse.json({
          accessToken: VALID_ACCESS_TOKEN,
          refreshToken: VALID_REFRESH_TOKEN,
          tokenType: 'Bearer',
        })
      }),
      http.get(`${API}/api/applications`, ({ request }) =>
        request.headers.get('Authorization') === `Bearer ${VALID_ACCESS_TOKEN}`
          ? HttpResponse.json(page([application()]))
          : HttpResponse.json({ status: 401, code: 'UNAUTHENTICATED' }, { status: 401 }),
      ),
    )

    await Promise.all([listApplications(), listApplications(), listApplications()])

    // Three failures, one refresh — otherwise a page load would stampede.
    expect(refreshes).toBe(1)
  })

  it('signs the user out when the refresh itself is rejected', async () => {
    signIn({ access: 'expired-token', refresh: 'expired-refresh' })

    server.use(
      http.get(`${API}/api/applications`, () =>
        HttpResponse.json({ status: 401, code: 'UNAUTHENTICATED' }, { status: 401 }),
      ),
    )

    await expect(listApplications()).rejects.toThrow()

    expect(store.getState().auth.status).toBe('anonymous')
    expect(store.getState().auth.accessToken).toBeNull()
    expect(store.getState().auth.refreshToken).toBeNull()
  })

  it('does not retry a second time, so a stubborn 401 cannot loop', async () => {
    signIn()

    let attempts = 0
    server.use(
      http.get(`${API}/api/applications`, () => {
        attempts += 1
        return HttpResponse.json({ status: 401, code: 'UNAUTHENTICATED' }, { status: 401 })
      }),
    )

    await expect(listApplications()).rejects.toThrow()
    expect(attempts).toBe(2)
  })

  it('leaves a 4xx that is not 401 alone', async () => {
    signIn()

    server.use(
      http.get(`${API}/api/applications`, () =>
        HttpResponse.json(
          { status: 400, code: 'MALFORMED_REQUEST', message: 'Request body could not be read' },
          { status: 400 },
        ),
      ),
    )

    await expect(listApplications()).rejects.toThrow()
    // A client mistake must not be answered by refreshing the session.
    expect(store.getState().auth.status).toBe('authenticated')
  })
})

describe('apiErrorMessage', () => {
  it('prefers the backend message', async () => {
    signIn()
    server.use(
      http.get(`${API}/api/applications`, () =>
        HttpResponse.json(
          { status: 409, code: 'CONFLICT', message: 'Email already registered' },
          { status: 409 },
        ),
      ),
    )

    await listApplications().catch((error: unknown) => {
      expect(apiErrorMessage(error)).toBe('Email already registered')
    })
  })

  it('names the offending field when validation failed', async () => {
    signIn()
    server.use(
      http.get(`${API}/api/applications`, () =>
        HttpResponse.json(
          {
            status: 400,
            code: 'VALIDATION_ERROR',
            message: 'Request validation failed',
            fieldErrors: [{ field: 'position', message: 'must not be blank' }],
          },
          { status: 400 },
        ),
      ),
    )

    await listApplications().catch((error: unknown) => {
      expect(apiErrorMessage(error)).toBe('position: must not be blank')
    })
  })
})
