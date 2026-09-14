import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center gap-2">
      <h1 className="text-content text-title font-semibold tracking-tight">Page not found</h1>
      <Link to="/applications" className="text-brand text-data underline underline-offset-4">
        Back to applications
      </Link>
    </main>
  )
}
