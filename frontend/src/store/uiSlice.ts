import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { ApplicationStatus } from '@/api/types'

/**
 * Client-only view state for the applications table. It lives here rather than
 * in component state so filters survive navigating to the board and back.
 * Phase 4 grows this slice; nothing fetched from the server belongs in it.
 */
export type UiState = {
  search: string
  statusFilter: ApplicationStatus[]
  sidebarOpen: boolean
  openApplicationId: number | null
}

const initialState: UiState = {
  search: '',
  statusFilter: [],
  sidebarOpen: true,
  openApplicationId: null,
}

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    searchChanged(state, action: PayloadAction<string>) {
      state.search = action.payload
    },
    statusFilterChanged(state, action: PayloadAction<ApplicationStatus[]>) {
      state.statusFilter = action.payload
    },
    filtersCleared(state) {
      state.search = ''
      state.statusFilter = []
    },
    sidebarToggled(state) {
      state.sidebarOpen = !state.sidebarOpen
    },
    applicationDrawerOpened(state, action: PayloadAction<number>) {
      state.openApplicationId = action.payload
    },
    applicationDrawerClosed(state) {
      state.openApplicationId = null
    },
  },
})

export const {
  searchChanged,
  statusFilterChanged,
  filtersCleared,
  sidebarToggled,
  applicationDrawerOpened,
  applicationDrawerClosed,
} = uiSlice.actions
export const uiReducer = uiSlice.reducer
