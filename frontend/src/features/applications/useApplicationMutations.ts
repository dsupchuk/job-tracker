import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  applicationKeys,
  createApplication,
  deleteApplication,
  updateApplication,
} from '@/api/applications'
import { apiErrorMessage } from '@/api/client'
import type { Application, ApplicationRequest } from '@/api/types'
import { useAppDispatch } from '@/store/hooks'
import { toastShown } from '@/store/toastSlice'

/** Negative ids cannot collide with anything the server issues. */
let temporaryId = -1

function optimisticApplication(request: ApplicationRequest, id: number): Application {
  const now = new Date().toISOString()
  return {
    id,
    position: request.position,
    company: request.company ?? null,
    status: request.status ?? 'SAVED',
    sourceUrl: request.sourceUrl ?? null,
    salaryMin: request.salaryMin ?? null,
    salaryMax: request.salaryMax ?? null,
    appliedAt: request.appliedAt ?? null,
    deadline: request.deadline ?? null,
    techStack: request.techStack ?? null,
    createdAt: now,
    updatedAt: now,
  }
}

/**
 * Create, update and delete, each applied to the cached list immediately and
 * rolled back to the pre-mutation snapshot if the request fails.
 */
export function useApplicationMutations() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()
  const key = applicationKeys.listAll()

  /** Cancels in-flight refetches and returns a snapshot for rollback. */
  async function beginOptimistic(update: (current: Application[]) => Application[]) {
    await queryClient.cancelQueries({ queryKey: key })
    const previous = queryClient.getQueryData<Application[]>(key)
    queryClient.setQueryData<Application[]>(key, (current) => update(current ?? []))
    return { previous }
  }

  function rollback(context: { previous: Application[] | undefined } | undefined) {
    if (context?.previous) queryClient.setQueryData(key, context.previous)
  }

  function settle() {
    void queryClient.invalidateQueries({ queryKey: applicationKeys.all })
  }

  const create = useMutation({
    mutationFn: createApplication,
    onMutate: (request: ApplicationRequest) =>
      beginOptimistic((current) => [optimisticApplication(request, temporaryId--), ...current]),
    onError: (error, _request, context) => {
      rollback(context)
      dispatch(toastShown('error', apiErrorMessage(error, 'Could not create the application')))
    },
    onSuccess: () => dispatch(toastShown('success', 'Application created')),
    onSettled: settle,
  })

  const update = useMutation({
    mutationFn: ({ id, body }: { id: number; body: ApplicationRequest }) =>
      updateApplication(id, body),
    onMutate: ({ id, body }) =>
      beginOptimistic((current) =>
        current.map((application) =>
          application.id === id
            ? { ...optimisticApplication(body, id), createdAt: application.createdAt }
            : application,
        ),
      ),
    onError: (error, _variables, context) => {
      rollback(context)
      dispatch(toastShown('error', apiErrorMessage(error, 'Could not save the application')))
    },
    onSuccess: () => dispatch(toastShown('success', 'Application saved')),
    onSettled: settle,
  })

  const remove = useMutation({
    mutationFn: deleteApplication,
    onMutate: (id: number) =>
      beginOptimistic((current) => current.filter((application) => application.id !== id)),
    onError: (error, _id, context) => {
      rollback(context)
      dispatch(toastShown('error', apiErrorMessage(error, 'Could not delete the application')))
    },
    onSuccess: () => dispatch(toastShown('success', 'Application deleted')),
    onSettled: settle,
  })

  return { create, update, remove }
}
