import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { applicationKeys, changeApplicationStatus } from '@/api/applications'
import type { Application } from '@/api/types'
import { createTestQueryClient, createWrapper, deferred } from '@/test/providers'
import { useStatusMutation } from './useStatusMutation'

vi.mock('@/api/applications', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/api/applications')>()),
  changeApplicationStatus: vi.fn(),
}))

const card: Application = {
  id: 1,
  position: 'Backend Engineer',
  company: 'Stripe',
  status: 'SAVED',
  sourceUrl: null,
  salaryMin: null,
  salaryMax: null,
  appliedAt: null,
  deadline: null,
  techStack: null,
  createdAt: '2026-08-01T00:00:00Z',
  updatedAt: '2026-08-01T00:00:00Z',
}

function setup() {
  const queryClient = createTestQueryClient()
  queryClient.setQueryData(applicationKeys.listAll(), [card])

  const { Wrapper, store } = createWrapper(queryClient)
  const { result } = renderHook(() => useStatusMutation(), { wrapper: Wrapper })

  const statusOf = () =>
    queryClient.getQueryData<Application[]>(applicationKeys.listAll())?.[0]?.status

  return { result, statusOf, store }
}

beforeEach(() => {
  vi.mocked(changeApplicationStatus).mockReset()
})

describe('useStatusMutation', () => {
  it('moves the card in the cache before the server responds', async () => {
    const server = deferred<Application>()
    vi.mocked(changeApplicationStatus).mockReturnValue(server.promise)

    const { result, statusOf } = setup()
    act(() => result.current.mutate({ id: 1, status: 'INTERVIEW' }))

    await waitFor(() => expect(statusOf()).toBe('INTERVIEW'))
    expect(result.current.isPending).toBe(true)

    server.resolve({ ...card, status: 'INTERVIEW' })
    await waitFor(() => expect(result.current.isPending).toBe(false))
  })

  it('puts the card back and reports the failure when the move is rejected', async () => {
    const server = deferred<Application>()
    vi.mocked(changeApplicationStatus).mockReturnValue(server.promise)

    const { result, statusOf, store } = setup()
    act(() => result.current.mutate({ id: 1, status: 'INTERVIEW' }))
    await waitFor(() => expect(statusOf()).toBe('INTERVIEW'))

    act(() => server.reject(new Error('boom')))

    await waitFor(() => expect(statusOf()).toBe('SAVED'))
    expect(store.getState().toasts.items[0]).toMatchObject({
      kind: 'error',
      message: 'Could not move the application',
    })
  })
})
