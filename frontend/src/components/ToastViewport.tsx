import { useEffect } from 'react'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { toastDismissed, type Toast } from '@/store/toastSlice'

const DISMISS_AFTER_MS = 5000

const KIND_CLASS = {
  success:
    'border-emerald-500/40 bg-emerald-50 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100',
  error: 'border-red-500/40 bg-red-50 text-red-900 dark:bg-red-950 dark:text-red-100',
} as const

function ToastItem({ toast }: { toast: Toast }) {
  const dispatch = useAppDispatch()

  useEffect(() => {
    const timer = setTimeout(() => dispatch(toastDismissed(toast.id)), DISMISS_AFTER_MS)
    return () => clearTimeout(timer)
  }, [dispatch, toast.id])

  return (
    <li
      className={`flex items-start gap-3 rounded-lg border px-4 py-3 text-sm shadow-sm ${KIND_CLASS[toast.kind]}`}
    >
      <span className="flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => dispatch(toastDismissed(toast.id))}
        className="opacity-60 hover:opacity-100"
      >
        ×<span className="sr-only">Dismiss</span>
      </button>
    </li>
  )
}

export function ToastViewport() {
  const toasts = useAppSelector((state) => state.toasts.items)

  return (
    <ul
      aria-live="polite"
      aria-relevant="additions"
      className="fixed right-4 bottom-4 z-50 flex w-80 flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </ul>
  )
}
