import { useQueryClient } from '@tanstack/react-query'
import { NavLink, Outlet } from 'react-router-dom'
import { useCurrentUser } from '@/features/auth/useAuth'
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
    <div className="flex min-h-dvh">
      <aside className="border-border-subtle bg-surface-muted hidden w-56 shrink-0 border-r p-4 sm:block">
        <p className="text-content px-2 text-sm font-semibold">Job Tracker</p>
        <nav className="mt-6 flex flex-col gap-1">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `rounded-md px-2 py-1.5 text-sm ${
                  isActive
                    ? 'bg-brand text-brand-contrast font-medium'
                    : 'text-content-muted hover:bg-surface'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-border-subtle flex items-center justify-end gap-3 border-b px-4 py-3">
          {user && <span className="text-content-muted text-sm">{user.email}</span>}
          <ThemeToggle />
          <Button variant="ghost" onClick={signOut}>
            Sign out
          </Button>
        </header>

        <main className="min-w-0 flex-1 p-6">
          <Outlet />
        </main>
      </div>

      <ToastViewport />
    </div>
  )
}
