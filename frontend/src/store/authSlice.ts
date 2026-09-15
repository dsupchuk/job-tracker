import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { decodeJwt } from '@/lib/jwt'
import { readStored } from '@/lib/storage'

export const REFRESH_TOKEN_KEY = 'refreshToken'

/**
 * `bootstrapping` means a refresh token survived a page reload and is being
 * exchanged for an access token. Protected routes wait rather than bouncing the
 * user to the login page.
 */
export type AuthStatus = 'bootstrapping' | 'authenticated' | 'anonymous'

export type AuthUser = {
  email: string
  role: string
}

export type AuthState = {
  /** Access token lives in memory only — it is never written to storage. */
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  status: AuthStatus
}

/**
 * Read lazily, per store, rather than once when this module is first imported.
 * `createStore()` should reflect what storage holds at the moment it is called —
 * anything else makes the initial state impossible to set up in a test, and
 * quietly wrong for any second store.
 */
function initialState(): AuthState {
  const storedRefreshToken = readStored(REFRESH_TOKEN_KEY)
  return {
    accessToken: null,
    refreshToken: storedRefreshToken,
    user: null,
    status: storedRefreshToken ? 'bootstrapping' : 'anonymous',
  }
}

export type Credentials = {
  accessToken: string
  refreshToken: string
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    credentialsReceived(state, action: PayloadAction<Credentials>) {
      const { accessToken, refreshToken } = action.payload
      const claims = decodeJwt(accessToken)

      state.accessToken = accessToken
      state.refreshToken = refreshToken
      state.user = claims ? { email: claims.sub, role: claims.role } : null
      state.status = 'authenticated'
    },
    loggedOut(state) {
      state.accessToken = null
      state.refreshToken = null
      state.user = null
      state.status = 'anonymous'
    },
  },
})

export const { credentialsReceived, loggedOut } = authSlice.actions
export const authReducer = authSlice.reducer
