import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { applicationKeys, createApplication, deleteApplication } from '@/api/applications'
import type { Application, ApplicationRequest } from '@/api/types'
import { createTestQueryClient, createWrapper, deferred } from '@/test/providers'
import { useApplicationMutations } from './useApplicationMutations'

vi.mock('@/api/applications', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/applications')>()),
  createApplication: vi.fn(),
  deleteApplication: vi.fn(),
}))

const existing: Application = {
  id: 1,
  position: 'Backend Engineer',
  company: 'Stripe',
  status: 'APPLIED',
  sourceUrl: null,
  salaryMin: null,
  salaryMax: null,
  appliedAt: '2026-08-01',
  deadline: null,
  techStack: null,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
}

const request: ApplicationRequest = { position: 'Staff Engineer @ Linear', status: 'SAVED' }

function setup() {
  const queryClient = createTestQueryClient()
  queryClient.setQueryData(applicationKeys.listAll(), [existing])

  const { Wrapper, store } = createWrapper(queryClient)
  const { result } = renderHook(() => useApplicationMutations(), { wrapper: Wrapper })

  const cached = () => queryClient.getQueryData<Application[]>(applicationKeys.listAll()) ?? []
  return { result, cached, store }
}

beforeEach(() => {
  vi.mocked(createApplication).mockReset()
  vi.mocked(deleteApplication).mockReset()
})

describe('useApplicationMutations — optimistic create', () => {
  it('adds the row to the cache before the server responds', async () => {
    const server = deferred<Application>()
    vi.mocked(createApplication).mockReturnValue(server.promise)

    const { result, cached } = setup()
    act(() => result.current.create.mutate(request))

    // The request is in flight and deliberately unresolved at this point.
    await waitFor(() => expect(cached()).toHaveLength(2))
    expect(cached()[0]?.position).toBe('Staff Engineer @ Linear')
    expect(result.current.create.isPending).toBe(true)

    server.resolve({ ...existing, id: 2, position: request.position, status: 'SAVED' })
    await waitFor(() => expect(result.current.create.isPending).toBe(false))
  })

  it('rolls the cache back and reports the failure when the request is rejected', async () => {
    const server = deferred<Application>()
    vi.mocked(createApplication).mockReturnValue(server.promise)

    const { result, cached, store } = setup()
    act(() => result.current.create.mutate(request))
    await waitFor(() => expect(cached()).toHaveLength(2))

    act(() => server.reject(new Error('boom')))

    await waitFor(() => expect(cached()).toEqual([existing]))
    expect(store.getState().toasts.items[0]).toMatchObject({
      kind: 'error',
      message: 'Could not create the application',
    })
  })
})

describe('useApplicationMutations — optimistic delete', () => {
  it('removes the row immediately and restores it on failure', async () => {
    const server = deferred<void>()
    vi.mocked(deleteApplication).mockReturnValue(server.promise)

    const { result, cached } = setup()
    act(() => result.current.remove.mutate(existing.id))

    await waitFor(() => expect(cached()).toEqual([]))

    act(() => server.reject(new Error('boom')))
    await waitFor(() => expect(cached()).toEqual([existing]))
  })
})
