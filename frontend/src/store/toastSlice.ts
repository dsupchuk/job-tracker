import { createSlice, nanoid, type PayloadAction } from '@reduxjs/toolkit'

export type ToastKind = 'success' | 'error'

export type Toast = {
  id: string
  kind: ToastKind
  message: string
}

const toastSlice = createSlice({
  name: 'toasts',
  initialState: { items: [] as Toast[] },
  reducers: {
    toastShown: {
      reducer(state, action: PayloadAction<Toast>) {
        state.items.push(action.payload)
      },
      prepare(kind: ToastKind, message: string) {
        return { payload: { id: nanoid(), kind, message } }
      },
    },
    toastDismissed(state, action: PayloadAction<string>) {
      state.items = state.items.filter((toast) => toast.id !== action.payload)
    },
  },
})

export const { toastShown, toastDismissed } = toastSlice.actions
export const toastReducer = toastSlice.reducer
