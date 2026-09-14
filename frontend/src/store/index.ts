import { configureStore } from '@reduxjs/toolkit'
import { authReducer } from './authSlice'
import { persistenceMiddleware } from './persistence'
import { themeReducer } from './themeSlice'
import { uiReducer } from './uiSlice'

/**
 * Client state only. Server data (applications, and anything else the API owns)
 * belongs to the TanStack Query cache and is deliberately absent here.
 */
export function createStore() {
  return configureStore({
    reducer: {
      auth: authReducer,
      theme: themeReducer,
      ui: uiReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().prepend(persistenceMiddleware.middleware),
  })
}

export const store = createStore()

export type AppStore = ReturnType<typeof createStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
