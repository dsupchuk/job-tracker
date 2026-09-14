import { useAppSelector } from '@/store/hooks'

export function useAuthStatus() {
  return useAppSelector((state) => state.auth.status)
}

export function useCurrentUser() {
  return useAppSelector((state) => state.auth.user)
}
