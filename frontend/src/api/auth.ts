import { apiClient } from './client'
import type { AuthResponse } from './types'

export type AuthCredentials = {
  email: string
  password: string
}

export async function register(credentials: AuthCredentials): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/register', credentials)
  return data
}

export async function login(credentials: AuthCredentials): Promise<AuthResponse> {
  const { data } = await apiClient.post<AuthResponse>('/api/auth/login', credentials)
  return data
}
