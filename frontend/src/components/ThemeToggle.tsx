import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { themeToggled } from '@/store/themeSlice'

export function ThemeToggle() {
  const mode = useAppSelector((state) => state.theme.mode)
  const dispatch = useAppDispatch()

  return (
    <button
      type="button"
      onClick={() => dispatch(themeToggled())}
      aria-pressed={mode === 'dark'}
      className="border-border-subtle text-content hover:bg-surface-muted rounded-md border px-2.5 py-1.5 text-sm"
    >
      {mode === 'dark' ? '☀️' : '🌙'}
      <span className="sr-only">Switch to {mode === 'dark' ? 'light' : 'dark'} theme</span>
    </button>
  )
}
