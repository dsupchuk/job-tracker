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
      className="border-border-subtle text-content-muted hover:text-content hover:bg-surface-muted rounded-data text-meta border px-2.5 py-2 font-semibold"
    >
      {mode === 'dark' ? 'Light' : 'Dark'}
      <span className="sr-only">Switch to {mode === 'dark' ? 'light' : 'dark'} theme</span>
    </button>
  )
}
