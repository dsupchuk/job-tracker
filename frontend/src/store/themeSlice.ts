import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { readStored } from '@/lib/storage'

export const THEME_KEY = 'theme'

export type Theme = 'light' | 'dark'

function initialTheme(): Theme {
  const stored = readStored(THEME_KEY)
  if (stored === 'light' || stored === 'dark') return stored

  // `matchMedia` is missing in some environments (jsdom among them), and this
  // runs at module load — an unguarded call would take the whole app down.
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

const themeSlice = createSlice({
  name: 'theme',
  // Lazy for the same reason as `authSlice`: a store reflects storage when it
  // is created, not when this module happened to load.
  initialState: () => ({ mode: initialTheme() }),
  reducers: {
    themeSet(state, action: PayloadAction<Theme>) {
      state.mode = action.payload
    },
    themeToggled(state) {
      state.mode = state.mode === 'dark' ? 'light' : 'dark'
    },
  },
})

export const { themeSet, themeToggled } = themeSlice.actions
export const themeReducer = themeSlice.reducer
