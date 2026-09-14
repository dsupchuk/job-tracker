import { useEffect } from 'react'
import { useAppSelector } from '@/store/hooks'

/** Keeps the `dark` class on <html> in sync with the themeSlice. */
export function useThemeEffect() {
  const mode = useAppSelector((state) => state.theme.mode)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', mode === 'dark')
  }, [mode])
}
