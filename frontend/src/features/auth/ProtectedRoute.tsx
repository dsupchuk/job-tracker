import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStatus } from './useAuth'

function FullPageLoader() {
  return (
    <div className="text-content-muted flex min-h-dvh items-center justify-center text-sm">
      <span role="status">Restoring your session…</span>
    </div>
  )
}

/** Guards every route that needs a signed-in user. */
export function ProtectedRoute() {
  const status = useAuthStatus()
  const location = useLocation()

  if (status === 'bootstrapping') return <FullPageLoader />
  if (status === 'anonymous') return <Navigate to="/login" state={{ from: location }} replace />
  return <Outlet />
}

/** Keeps a signed-in user away from the login and register pages. */
export function AnonymousOnlyRoute() {
  const status = useAuthStatus()

  if (status === 'bootstrapping') return <FullPageLoader />
  if (status === 'authenticated') return <Navigate to="/applications" replace />
  return <Outlet />
}
