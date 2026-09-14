import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { refreshAccessToken } from '@/api/client'
import { useAppSelector } from '@/store/hooks'

/**
 * A refresh token that survived a page reload is exchanged for an access token
 * once, on startup. `refreshAccessToken` dispatches the outcome itself, so this
 * only has to trigger it.
 */
export function AuthBootstrap({ children }: { children: ReactNode }) {
  const status = useAppSelector((state) => state.auth.status)

  useEffect(() => {
    if (status !== 'bootstrapping') return
    void refreshAccessToken().catch(() => {
      // Expired or rejected refresh token — the store is already anonymous.
    })
  }, [status])

  return children
}
