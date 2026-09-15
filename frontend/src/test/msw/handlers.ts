import { http, HttpResponse } from 'msw'
import type { Application, ApplicationStatus, Page } from '@/api/types'

export const API = 'http://localhost:8080'

/** Mirrors the backend's `ApiError` so the client parses the same shape. */
function apiError(status: number, code: string, message: string) {
  return HttpResponse.json(
    { timestamp: new Date().toISOString(), status, code, message },
    { status },
  )
}

export function application(overrides: Partial<Application> = {}): Application {
  return {
    id: 1,
    position: 'Backend Engineer',
    company: 'Stripe',
    status: 'APPLIED',
    sourceUrl: null,
    salaryMin: 120000,
    salaryMax: 160000,
    appliedAt: '2026-08-01',
    deadline: null,
    techStack: 'Java, Spring',
    createdAt: '2026-08-01T00:00:00Z',
    updatedAt: '2026-08-01T00:00:00Z',
    ...overrides,
  }
}

export function page(content: Application[]): Page<Application> {
  return {
    content,
    number: 0,
    size: 200,
    totalElements: content.length,
    totalPages: 1,
    first: true,
    last: true,
  }
}

/**
 * The happy path, mirroring the real contract: a valid bearer token is
 * required, and anything else is a 401 with the backend's error body.
 */
export const VALID_ACCESS_TOKEN = 'valid-access-token'
export const VALID_REFRESH_TOKEN = 'valid-refresh-token'

function authorized(request: Request): boolean {
  return request.headers.get('Authorization') === `Bearer ${VALID_ACCESS_TOKEN}`
}

export const handlers = [
  http.post(`${API}/api/auth/login`, () =>
    HttpResponse.json({
      accessToken: VALID_ACCESS_TOKEN,
      refreshToken: VALID_REFRESH_TOKEN,
      tokenType: 'Bearer',
    }),
  ),

  http.post(`${API}/api/auth/refresh`, async ({ request }) => {
    const body = (await request.json()) as { refreshToken?: string }
    if (body.refreshToken !== VALID_REFRESH_TOKEN) {
      return apiError(401, 'UNAUTHENTICATED', 'Authentication required')
    }
    return HttpResponse.json({
      accessToken: VALID_ACCESS_TOKEN,
      refreshToken: VALID_REFRESH_TOKEN,
      tokenType: 'Bearer',
    })
  }),

  http.get(`${API}/api/applications`, ({ request }) => {
    if (!authorized(request)) {
      return apiError(401, 'UNAUTHENTICATED', 'Authentication required')
    }
    return HttpResponse.json(page([application()]))
  }),

  http.patch(`${API}/api/applications/:id/status`, async ({ request, params }) => {
    if (!authorized(request)) {
      return apiError(401, 'UNAUTHENTICATED', 'Authentication required')
    }
    const body = (await request.json()) as { status: ApplicationStatus }
    return HttpResponse.json(application({ id: Number(params.id), status: body.status }))
  }),
]
