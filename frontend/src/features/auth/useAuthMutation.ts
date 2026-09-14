import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { apiErrorMessage } from '@/api/client'
import type { AuthCredentials } from '@/api/auth'
import type { AuthResponse } from '@/api/types'
import { credentialsReceived } from '@/store/authSlice'
import { useAppDispatch } from '@/store/hooks'

/**
 * Shared wiring for login and register: run the request, put the resulting
 * token pair in the store, then land the user on the applications page.
 */
export function useAuthMutation(
  request: (credentials: AuthCredentials) => Promise<AuthResponse>,
  fallbackMessage: string,
) {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const mutation = useMutation({
    mutationFn: request,
    onSuccess: (response) => {
      dispatch(credentialsReceived(response))
      void navigate('/applications', { replace: true })
    },
  })

  return {
    submit: mutation.mutate,
    pending: mutation.isPending,
    errorMessage: mutation.error ? apiErrorMessage(mutation.error, fallbackMessage) : undefined,
  }
}
