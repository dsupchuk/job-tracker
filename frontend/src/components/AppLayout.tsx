import { useQueryClient } from '@tanstack/react-query'
import { NavLink, Outlet } from 'react-router-dom'
import { useCurrentUser } from '@/features/auth/useAuth'
import { FunnelSummary } from '@/features/applications/FunnelSummary'
import { loggedOut } from '@/store/authSlice'
import { useAppDispatch } from '@/store/hooks'
import { Button } from './ui/Button'
import { ThemeToggle } from './ThemeToggle'
import { ToastViewport } from './ToastViewport'

const NAV_ITEMS = [
  { to: '/applications', label: 'Applications' },
  { to: '/board', label: 'Board' },
  { to: '/analytics', label: 'Analytics' },
] as const

function navClass({ isActive }: { isActive: boolean }) {
  return `rounded-data text-data px-2.5 py-1.5 font-semibold ${
    isActive ? 'bg-content text-surface' : 'text-content-muted hover:bg-surface-muted'
  }`
}

export function AppLayout() {
  const user = useCurrentUser()
  const dispatch = useAppDispatch()
  const queryClient = useQueryClient()

  function signOut() {
    dispatch(loggedOut())
    // Drop every cached response so the next user never sees the previous one's data.
    queryClient.clear()
  }

  return (
    <div className="flex min-h-dvh flex-col sm:flex-row">
      <aside className="border-border-subtle hidden w-60 shrink-0 border-r p-4 sm:block">
        <p className="text-content text-lead px-2 font-semibold tracking-tight">Job Tracker</p>

        <nav aria-label="Sections" className="mt-6 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <FunnelSummary />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border-subtle flex flex-wrap items-center gap-3 border-b px-4 py-3 sm:px-6">
          {/* Below `sm` the sidebar is gone, so navigation moves up here. */}
          <nav aria-label="Sections" className="flex gap-1 sm:hidden">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} to={item.to} className={navClass}>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-3">
            {/* Who you are is not actionable on a phone; the controls are. */}
            {user && (
              <span className="text-content-muted text-meta hidden sm:inline">{user.email}</span>
            )}
            <ThemeToggle />
            <Button variant="ghost" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>

      <ToastViewport />
    </div>
  )
}
