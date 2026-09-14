import { useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationKeys, changeApplicationStatus } from '@/api/applications'
import { apiErrorMessage } from '@/api/client'
import type { Application, ApplicationStatus } from '@/api/types'
import { useAppDispatch } from '@/store/hooks'
import { toastShown } from '@/store/toastSlice'

export type StatusMove = {
  id: number
  status: ApplicationStatus
}

/**
 * Moves a card between columns. The cache is updated before the request goes
 * out and restored from the pre-move snapshot if it fails, so a drop feels
 * instant but never lies about what the server accepted.
 */
export function useStatusMutation() {
  const queryClient = useQueryClient()
  const dispatch = useAppDispatch()
  const key = applicationKeys.listAll()

  return useMutation({
    mutationFn: ({ id, status }: StatusMove) => changeApplicationStatus(id, status),

    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: key })
      const previous = queryClient.getQueryData<Application[]>(key)

      queryClient.setQueryData<Application[]>(key, (current) =>
        (current ?? []).map((application) =>
          application.id === id ? { ...application, status } : application,
        ),
      )
      return { previous }
    },

    onError: (error, _move, context) => {
      if (context?.previous) queryClient.setQueryData(key, context.previous)
      dispatch(toastShown('error', apiErrorMessage(error, 'Could not move the application')))
    },

    onSuccess: (_data, { id }) => {
      // The timeline gained an entry; drop the stale copy.
      void queryClient.invalidateQueries({ queryKey: applicationKeys.history(id) })
    },

    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: applicationKeys.all })
    },
  })
}
