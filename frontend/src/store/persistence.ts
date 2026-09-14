import { createListenerMiddleware, isAnyOf } from '@reduxjs/toolkit'
import { writeStored } from '@/lib/storage'
import { credentialsReceived, loggedOut, REFRESH_TOKEN_KEY } from './authSlice'
import { themeSet, themeToggled, THEME_KEY } from './themeSlice'
import type { RootState } from './index'

/**
 * Mirrors the two pieces of state that must survive a reload into localStorage.
 * Kept as a listener rather than a reducer side effect so reducers stay pure.
 */
export const persistenceMiddleware = createListenerMiddleware()

persistenceMiddleware.startListening({
  matcher: isAnyOf(credentialsReceived, loggedOut),
  effect: (_action, api) => {
    writeStored(REFRESH_TOKEN_KEY, (api.getState() as RootState).auth.refreshToken)
  },
})

persistenceMiddleware.startListening({
  matcher: isAnyOf(themeSet, themeToggled),
  effect: (_action, api) => {
    writeStored(THEME_KEY, (api.getState() as RootState).theme.mode)
  },
})
